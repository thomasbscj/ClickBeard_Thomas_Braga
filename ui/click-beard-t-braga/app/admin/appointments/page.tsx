"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPastAppointments, getUpcomingAppointments } from "@/axios/calls";

interface Appointment {
  id: number;
  userId: number;
  barberId: number;
  datetime: string;
  specialty?: {
    name: string;
  };
  status: string;
}

type TabType = "past" | "today" | "upcoming";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<{
    past: Appointment[];
    today: Appointment[];
    upcoming: Appointment[];
  }>({
    past: [],
    today: [],
    upcoming: [],
  });
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const [pastData, upcomingData] = await Promise.all([
        getPastAppointments(100, 0),
        getUpcomingAppointments(100, 0),
      ]);

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const todayAppointments = upcomingData.data.filter((apt: Appointment) => {
        const aptDate = new Date(apt.datetime);
        const aptDateOnly = new Date(
          aptDate.getFullYear(),
          aptDate.getMonth(),
          aptDate.getDate(),
        );
        return aptDateOnly.getTime() === today.getTime();
      });

      const futureAppointments = upcomingData.data.filter(
        (apt: Appointment) => {
          const aptDate = new Date(apt.datetime);
          const aptDateOnly = new Date(
            aptDate.getFullYear(),
            aptDate.getMonth(),
            aptDate.getDate(),
          );
          return aptDateOnly.getTime() > today.getTime();
        },
      );

      setAppointments({
        past: pastData.data,
        today: todayAppointments,
        upcoming: futureAppointments,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar agendamentos",
      );
    } finally {
      setIsLoading(false);
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

  const currentAppointments = appointments[activeTab];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-red-700/30 shadow-md ml-64">
        <div className="px-10 py-8">
          <Link
            href="/admin"
            className="text-sm text-gray-400 hover:text-white mb-2 inline-block"
          >
            ← Voltar
          </Link>
          <h1 className="text-4xl font-bold text-white">Agendamentos</h1>
          <p className="text-gray-300 mt-2">
            Visualize todos os agendamentos do sistema
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 py-16 px-8">
        <div className="w-full max-w-6xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 font-semibold">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-800">
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "past"
                  ? "text-red-400 border-b-2 border-red-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Passados ({appointments.past.length})
            </button>
            <button
              onClick={() => setActiveTab("today")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "today"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Hoje ({appointments.today.length})
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "upcoming"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Futuros ({appointments.upcoming.length})
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400 mt-4">Carregando agendamentos...</p>
            </div>
          )}

          {/* Appointments List */}
          {!isLoading && currentAppointments.length > 0 && (
            <div className="space-y-4">
              {currentAppointments.map((apt) => {
                const { date, time } = formatDateTime(apt.datetime);
                return (
                  <div
                    key={apt.id}
                    className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800"
                  >
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-bold text-white">
                            ID: {apt.id}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              apt.status === "SCHEDULED"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                                : apt.status === "CANCELLED"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/50"
                                  : "bg-green-500/20 text-green-400 border border-green-500/50"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                          <div>
                            <p className="text-xs text-gray-500">Usuário ID</p>
                            <p className="text-white font-semibold">
                              {apt.userId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Barbeiro ID</p>
                            <p className="text-white font-semibold">
                              {apt.barberId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Data</p>
                            <p className="text-white font-semibold">{date}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Hora</p>
                            <p className="text-white font-semibold">{time}</p>
                          </div>
                        </div>
                        {apt.specialty && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500">
                              Especialidade
                            </p>
                            <p className="text-blue-400">
                              {apt.specialty.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && currentAppointments.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">
                Nenhum agendamento
                {activeTab === "past"
                  ? " passado"
                  : activeTab === "today"
                    ? " para hoje"
                    : " futuro"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
