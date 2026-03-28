"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllBarbers, getAllSpecialties, createAppointment } from "@/axios";

interface Barber {
  id: number;
  name: string;
  bornAt: number;
  hiredAt: string;
  specialties: string[];
  busyTimes?: BusyTime[];
}

interface BusyTime {
  start: string;
  end: string;
}

interface Specialty {
  name: string;
  description?: string;
}

interface FormDataState {
  barberId: string;
  specialtyId: string;
  appointmentDate: string;
  appointmentTime: string;
}

export default function AppointmentsPage() {
  const [formData, setFormData] = useState<FormDataState>({
    barberId: "",
    specialtyId: "",
    appointmentDate: "",
    appointmentTime: "",
  });

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busyTimes, setBusyTimes] = useState<string[]>([]);

  const generateAvailableTimes = () => {
    const times = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 30) break;
        const timeString = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const availableTimes = generateAvailableTimes();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barbersData, specialtiesData] = await Promise.all([
          getAllBarbers(100, 0),
          getAllSpecialties(100, 0),
        ]);

        setBarbers(barbersData.data || []);
        setSpecialties(specialtiesData.data || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setErrorMessage(
          "Erro ao carregar barbeiros e especialidades. Tente novamente.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "specialtyId" && { barberId: "" }), 
    }));

    if (name === "barberId" && value) {
      fetchBarberBusyTimes(parseInt(value), formData.appointmentDate);
    }

    if (name === "appointmentDate" && value && formData.barberId) {
      fetchBarberBusyTimes(parseInt(formData.barberId), value);
    }
  };

  const fetchBarberBusyTimes = async (
    barberId: number,
    appointmentDate: string,
  ): Promise<void> => {
    try {
      const response = await getAllBarbers(100, 0);
      const selectedBarber = response.data?.find(
        (b: Barber) => b.id === barberId,
      );

      if (selectedBarber?.busyTimes && selectedBarber.busyTimes.length > 0) {
        const selectedDate =
          appointmentDate || new Date().toISOString().split("T")[0];

        const busyTimesForDate = selectedBarber.busyTimes
          .filter((bt: BusyTime) => {
            const busyDate = new Date(bt.start).toISOString().split("T")[0];
            return busyDate === selectedDate;
          })
          .map((bt: BusyTime) => {
            const utcStartTime = new Date(bt.start);
            const hours = utcStartTime.getUTCHours();
            const minutes = utcStartTime.getUTCMinutes();
            const localHours = hours - 3;
            return `${String(localHours).padStart(2, "0")}:${String(
              minutes,
            ).padStart(2, "0")}`;
          });

        setBusyTimes(busyTimesForDate);
      } else {
        setBusyTimes([]);
      }
    } catch (error) {
      console.error("Erro ao buscar horários ocupados:", error);
    }
  };

  const filteredBarbers = formData.specialtyId
    ? barbers.filter((barber) => {
        return barber.specialties?.includes(formData.specialtyId);
      })
    : [];

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (
        !formData.barberId ||
        !formData.specialtyId ||
        !formData.appointmentDate ||
        !formData.appointmentTime
      ) {
        setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
        setIsSubmitting(false);
        return;
      }

      const [hours, minutes] = formData.appointmentTime.split(":");
      const utcHours = (parseInt(hours) + 3).toString().padStart(2, "0");
      const dateTime = new Date(
        `${formData.appointmentDate}T${utcHours}:${minutes}:00Z`,
      ).toISOString();

      const selectedSpecialty = specialties.find(
        (s) => s.name === formData.specialtyId,
      );

      if (!selectedSpecialty) {
        setErrorMessage("Especialidade selecionada inválida.");
        setIsSubmitting(false);
        return;
      }

      await createAppointment({
        barberId: parseInt(formData.barberId),
        datetime: dateTime,
        specialtyName: selectedSpecialty.name,
      });

      setSuccessMessage("Agendamento criado com sucesso! Redirecionando...");

      setFormData({
        barberId: "",
        specialtyId: "",
        appointmentDate: "",
        appointmentTime: "",
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Erro:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro ao criar agendamento. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <header className="bg-gray-900 border-b border-red-700/30 shadow-md ml-64">
          <div className="px-10 py-8">
            <h1 className="text-4xl font-bold text-white">Novo Agendamento</h1>
            <p className="text-gray-300 mt-2">
              Agende seu horário com um de nossos profissionais
            </p>
          </div>
        </header>
        <main className="ml-64 py-16 px-8">
          <div className="w-full max-w-2xl">
            <div className="bg-gray-900 rounded-xl shadow-lg p-12 border border-gray-800">
              <p className="text-white text-center">Carregando dados...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-red-700/30 shadow-md ml-64">
        <div className="px-10 py-8">
          <h1 className="text-4xl font-bold text-white">Novo Agendamento</h1>
          <p className="text-gray-300 mt-2">
            Agende seu horário com um de nossos profissionais
          </p>
        </div>
      </header>
      <main className="ml-64 py-16 px-8">
        <div className="w-full max-w-2xl">
          <div className="bg-gray-900 rounded-xl shadow-lg p-12 border border-gray-800">
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-400 font-semibold">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 font-semibold">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Tipo de Serviço
                </label>
                <select
                  name="specialtyId"
                  value={formData.specialtyId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">Escolha um serviço</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.name} value={specialty.name}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Selecione o Barbeiro
                </label>
                <select
                  name="barberId"
                  value={formData.barberId}
                  onChange={handleChange}
                  required
                  disabled={!formData.specialtyId}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.specialtyId
                      ? "Selecione um serviço primeiro"
                      : "Escolha um barbeiro"}
                  </option>
                  {filteredBarbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Data do Agendamento
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Horário (8h às 18h - Intervalos de 30 min)
                </label>
                <select
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  required
                  disabled={!formData.barberId || !formData.appointmentDate}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.barberId || !formData.appointmentDate
                      ? "Selecione barbeiro e data primeiro"
                      : "Escolha um horário"}
                  </option>
                  {availableTimes.map((time) => {
                    const isDisabled = busyTimes.includes(time);
                    return (
                      <option
                        key={time}
                        value={time}
                        disabled={isDisabled}
                        style={{
                          backgroundColor: isDisabled ? "#6b7280" : "#1f2937",
                          color: isDisabled ? "#9ca3af" : "#ffffff",
                        }}
                      >
                        {time} {isDisabled ? "(Ocupado)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-700">
                <Link
                  href="/"
                  className="flex-1 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all text-center"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-700 disabled:to-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
                >
                  {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
                </button>
              </div>
            </form>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-300 font-semibold">
                  Horário de Funcionamento
                </p>
              </div>
              <p className="text-sm text-gray-400">Todo dia: 8h às 18h</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <p className="text-gray-300 font-semibold">
                  Intervalos de Horário
                </p>
              </div>
              <p className="text-sm text-gray-400">Agendamentos a cada 30min</p>
              <p className="text-sm text-gray-400">De 8h até 18h</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
