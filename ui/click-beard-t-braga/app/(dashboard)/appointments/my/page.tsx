"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyAppointments, cancelAppointment, getBarber } from "@/axios/calls";

interface Appointment {
  id: number;
  datetime: string;
  specialty?: {
    name: string;
  };
  barberId: number;
  barberName?: string;
  status?: string;
}

interface PaginatedResponse {
  data: Appointment[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


    const isUpcoming = (datetime: string) => {
    return new Date(datetime) > new Date();
  };

  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response: PaginatedResponse = await getMyAppointments(100, 0);

        // Fetch barber names for each appointment
        const appointmentsWithBarberNames = await Promise.all(
          response.data.map(async (apt) => {
            try {
              const barberData = await getBarber(apt.barberId);
              return {
                ...apt,
                barberName: barberData.name,
              };
            } catch {
              return {
                ...apt,
                barberName: "Barbeiro desconhecido",
              };
            }
          }),
        );

        // Sort by datetime in ascending order (oldest first)
        const sortedAppointments = appointmentsWithBarberNames.sort(
          (a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
        );

        // Filter only upcoming appointments (future dates)
        const upcomingAppointments = sortedAppointments.filter((apt) =>
          isUpcoming(apt.datetime),
        );

        setAppointments(upcomingAppointments);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError(
          "Erro ao carregar seus agendamentos. Tente novamente mais tarde.",
        );
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId: number) => {
    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      return;
    }

    try {
      await cancelAppointment(appointmentId);
      setSuccessMessage("Agendamento cancelado com sucesso!");
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erro ao cancelar agendamento";
      setError(errorMsg);
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    };
  };



  const canCancel = (datetime: string) => {
    const appointmentDate = new Date(datetime);
    const today = new Date();

    // Check if appointment is today
    const isToday =
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear();

    // Only check 2-hour rule if appointment is today
    if (!isToday) {
      return true;
    }

    // If it's today, check if there are 2 hours or more until appointment
    const appointmentTime = appointmentDate.getTime();
    const now = new Date().getTime();
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
    return hoursUntilAppointment >= 2;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-red-700/30 shadow-md ml-64">
        <div className="px-10 py-8">
          <h1 className="text-4xl font-bold text-white">Meus Agendamentos</h1>
          <p className="text-gray-300 mt-2">
            Visualize e gerencie seus agendamentos
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 py-16 px-8">
        <div className="w-full max-w-4xl">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-400 font-semibold">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 font-semibold">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400 mt-4">Carregando agendamentos...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && appointments.length === 0 && (
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-400 text-lg">
                Você não tem nenhum agendamento ainda
              </p>
              <Link
                href="/appointments"
                className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                Agendar agora
              </Link>
            </div>
          )}

          {/* Appointments List */}
          {!isLoading && appointments.length > 0 && (
            <div className="space-y-6">
              {appointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.datetime);
                const upcoming = isUpcoming(appointment.datetime);

                return (
                  <div
                    key={appointment.id}
                    className={`bg-gray-900 rounded-xl shadow-lg p-8 border ${
                      upcoming
                        ? "border-blue-700/50 bg-gray-900"
                        : "border-gray-800 bg-gray-900/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-6">
                      {/* Info Section */}
                      <div className="flex-1 space-y-4">
                        {/* Status Badge */}
                        {upcoming && (
                          <div className="inline-block">
                            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-semibold rounded-full">
                              Próximo agendamento
                            </span>
                          </div>
                        )}

                        {/* Barber Name */}
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Barbeiro</p>
                          <p className="text-xl font-semibold text-white">
                            {appointment.barberName}
                          </p>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Data</p>
                            <p className="text-white font-semibold">{date}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Hora</p>
                            <p className="text-white font-semibold">{time}</p>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {upcoming && (
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          disabled={!canCancel(appointment.datetime)}
                          className={`px-6 py-3 text-white font-semibold rounded-lg transition-all whitespace-nowrap self-start ${
                            canCancel(appointment.datetime)
                              ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                              : "bg-gray-600 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {canCancel(appointment.datetime)
                            ? "Cancelar"
                            : "Cancelamento indisponível"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
