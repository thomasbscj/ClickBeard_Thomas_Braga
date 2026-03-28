"use client";

import { useEffect, useState } from "react";
import {
  getMyAppointments,
  getAllBarbers,
  getAllSpecialties,
} from "@/axios/calls";

interface DashboardStats {
  upcomingAppointments: number;
  barbers: number;
  specialties: number;
  isLoading: boolean;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    barbers: 0,
    specialties: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data with limit 1 and offset 0 to get just the count
        const [appointmentsData, barbersData, specialtiesData] =
          await Promise.all([
            getMyAppointments(1, 0),
            getAllBarbers(1, 0),
            getAllSpecialties(1, 0),
          ]);

        setStats({
          upcomingAppointments:
            appointmentsData.pagination?.total || appointmentsData.count || 0,
          barbers: barbersData.pagination?.total || barbersData.count || 0,
          specialties:
            specialtiesData.pagination?.total || specialtiesData.count || 0,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-red-700/30 shadow-md ml-64">
        <div className="px-10 py-8">
          <h1 className="text-4xl font-bold text-white">
            Bem-vindo ao Click Beard
          </h1>
          <p className="text-gray-300 mt-2">Sistema de Agendamento Premium</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 py-16 px-8">
        <div className="w-full max-w-6xl space-y-24">
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Card 1 - Upcoming Appointments */}
            <div className="bg-gray-900 rounded-xl shadow-lg p-10 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-300">
                  Próximos Agendamentos
                </h2>
              </div>
              <p className="text-4xl font-bold text-blue-400 mb-2">
                {stats.isLoading ? "..." : stats.upcomingAppointments}
              </p>
              <p className="text-sm text-gray-500">
                {stats.isLoading
                  ? "Carregando informações..."
                  : `Você tem ${stats.upcomingAppointments} agendamento${
                      stats.upcomingAppointments !== 1 ? "s" : ""
                    } programado${stats.upcomingAppointments !== 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Card 2 - Barbers */}
            <div className="bg-gray-900 rounded-xl shadow-lg p-10 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-300">
                  Barbeiros
                </h2>
              </div>
              <p className="text-4xl font-bold text-red-400 mb-2">
                {stats.isLoading ? "..." : stats.barbers}
              </p>
              <p className="text-sm text-gray-500">
                {stats.isLoading
                  ? "Carregando informações..."
                  : `${stats.barbers} barbeiro${
                      stats.barbers !== 1 ? "s" : ""
                    } disponív${stats.barbers !== 1 ? "eis" : "el"}`}
              </p>
            </div>

            {/* Card 3 - Specialties */}
            <div className="bg-gray-900 rounded-xl shadow-lg p-10 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-300">
                  Especialidades
                </h2>
              </div>
              <p className="text-4xl font-bold text-white mb-2">
                {stats.isLoading ? "..." : stats.specialties}
              </p>
              <p className="text-sm text-gray-500">
                {stats.isLoading
                  ? "Carregando informações..."
                  : `${stats.specialties} especialidade${
                      stats.specialties !== 1 ? "s" : ""
                    } disponív${stats.specialties !== 1 ? "eis" : "el"}`}
              </p>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-xl shadow-lg p-12 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-white">Bem-vindo!</h2>

            <p className="text-gray-300 mb-10 leading-relaxed max-w-2xl">
              Você está conectado ao sistema de agendamento Click Beard. Use o
              menu lateral para navegar entre as diferentes seções e gerenciar
              seus agendamentos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 mt-2 rounded-full bg-blue-400"></div>
                <div>
                  <p className="font-semibold text-white text-lg">
                    Agendamento Fácil
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Reserve seus horários com poucos cliques
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-3 h-3 mt-2 rounded-full bg-red-400"></div>
                <div>
                  <p className="font-semibold text-white text-lg">
                    Profissionais Experientes
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Conheça nossos barbeiros especializados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
