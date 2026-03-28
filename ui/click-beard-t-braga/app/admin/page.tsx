"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAllBarbers,
  getAllSpecialties,
  getUpcomingAppointments,
  getPastAppointments,
  getAllUsers,
} from "@/axios/calls";

interface AdminStats {
  totalBarbers: number;
  totalSpecialties: number;
  upcomingAppointments: number;
  pastAppointments: number;
  totalUsers: number;
  isLoading: boolean;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalBarbers: 0,
    totalSpecialties: 0,
    upcomingAppointments: 0,
    pastAppointments: 0,
    totalUsers: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [
          barbersData,
          specialtiesData,
          upcomingData,
          pastData,
          usersData,
        ] = await Promise.all([
          getAllBarbers(1, 0),
          getAllSpecialties(1, 0),
          getUpcomingAppointments(1, 0),
          getPastAppointments(1, 0),
          getAllUsers(1, 0),
        ]);

        setStats({
          totalBarbers: barbersData.pagination?.total || barbersData.count || 0,
          totalSpecialties:
            specialtiesData.pagination?.total || specialtiesData.count || 0,
          upcomingAppointments:
            upcomingData.pagination?.total || upcomingData.count || 0,
          pastAppointments: pastData.pagination?.total || pastData.count || 0,
          totalUsers: usersData.pagination?.total || usersData.count || 0,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-red-700/30 shadow-md ml-64">
        <div className="px-10 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Painel Administrativo
            </h1>
            <p className="text-gray-300 mt-2">
              Gerencie barbeiros, especialidades e agendamentos
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 py-16 px-8">
        <div className="w-full max-w-7xl">
          {/* Dashboard Stats Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8">
              Estatísticas do Sistema
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Barbers Card */}
              <div className="bg-linear-to-br from-blue-900/30 to-blue-800/10 rounded-xl shadow-lg p-8 border border-blue-500/30 hover:border-blue-400/60 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-2">
                      Total de Barbeiros
                    </p>
                    <p className="text-4xl font-bold text-blue-400">
                      {stats.isLoading ? "..." : stats.totalBarbers}
                    </p>
                  </div>
                  <svg
                    className="w-8 h-8 text-blue-400/50"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Profissionais ativos no sistema
                </p>
              </div>

              {/* Total Specialties Card */}
              <div className="bg-linear-to-br from-purple-900/30 to-purple-800/10 rounded-xl shadow-lg p-8 border border-purple-500/30 hover:border-purple-400/60 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-2">
                      Especialidades
                    </p>
                    <p className="text-4xl font-bold text-purple-400">
                      {stats.isLoading ? "..." : stats.totalSpecialties}
                    </p>
                  </div>
                  <svg
                    className="w-8 h-8 text-purple-400/50"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Serviços disponíveis
                </p>
              </div>

              {/* Upcoming Appointments Card */}
              <div className="bg-linear-to-br from-green-900/30 to-green-800/10 rounded-xl shadow-lg p-8 border border-green-500/30 hover:border-green-400/60 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-2">
                      Próximos Agendamentos
                    </p>
                    <p className="text-4xl font-bold text-green-400">
                      {stats.isLoading ? "..." : stats.upcomingAppointments}
                    </p>
                  </div>
                  <svg
                    className="w-8 h-8 text-green-400/50"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7h-3v3H9v-3H6v-2h3V7h2v3h3v2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Agendamentos futuros
                </p>
              </div>

              {/* Past Appointments Card */}
              <div className="bg-linear-to-br from-orange-900/30 to-orange-800/10 rounded-xl shadow-lg p-8 border border-orange-500/30 hover:border-orange-400/60 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-2">
                      Agendamentos Passados
                    </p>
                    <p className="text-4xl font-bold text-orange-400">
                      {stats.isLoading ? "..." : stats.pastAppointments}
                    </p>
                  </div>
                  <svg
                    className="w-8 h-8 text-orange-400/50"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Histórico de agendamentos
                </p>
              </div>

              {/* Total Users Card */}
              <div className="bg-linear-to-br from-red-900/30 to-red-800/10 rounded-xl shadow-lg p-8 border border-red-500/30 hover:border-red-400/60 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium mb-2">
                      Usuários Registrados
                    </p>
                    <p className="text-4xl font-bold text-red-400">
                      {stats.isLoading ? "..." : stats.totalUsers}
                    </p>
                  </div>
                  <svg
                    className="w-8 h-8 text-red-400/50"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-xs mt-4">
                  Usuários no sistema
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 mb-12"></div>

          {/* Management Cards Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-8">
              Gerenciamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Barbeiros Card */}
              <Link href="/admin/barbers">
                <div className="bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-800 hover:border-blue-500/50 hover:shadow-xl transition-all cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <svg
                      className="w-8 h-8 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM16 20H4v-2a6 6 0 0112 0v2z"
                      />
                    </svg>
                    <h2 className="text-2xl font-bold text-white">Barbeiros</h2>
                  </div>
                  <p className="text-gray-400">
                    Criar, editar e gerenciar barbeiros
                  </p>
                </div>
              </Link>

              {/* Especialidades Card */}
              <Link href="/admin/specialties">
                <div className="bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-800 hover:border-purple-500/50 hover:shadow-xl transition-all cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <svg
                      className="w-8 h-8 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a6 6 0 016 6v10a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a6 6 0 00-6-6H7a2 2 0 00-2 2v4a4 4 0 004 4z"
                      />
                    </svg>
                    <h2 className="text-2xl font-bold text-white">
                      Especialidades
                    </h2>
                  </div>
                  <p className="text-gray-400">
                    Criar e gerenciar especialidades
                  </p>
                </div>
              </Link>

              {/* Agendamentos Card */}
              <Link href="/admin/appointments">
                <div className="bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-800 hover:border-green-500/50 hover:shadow-xl transition-all cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <svg
                      className="w-8 h-8 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h2 className="text-2xl font-bold text-white">
                      Agendamentos
                    </h2>
                  </div>
                  <p className="text-gray-400">
                    Visualizar todos os agendamentos
                  </p>
                </div>
              </Link>

              {/* Usuários Card */}
              <Link href="/admin/users">
                <div className="bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-800 hover:border-red-500/50 hover:shadow-xl transition-all cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <svg
                      className="w-8 h-8 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M12 15H4m12 0h4m0 0a9 9 0 10-18 0h18z"
                      />
                    </svg>
                    <h2 className="text-2xl font-bold text-white">Usuários</h2>
                  </div>
                  <p className="text-gray-400">
                    Gerenciar e visualizar usuários
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
