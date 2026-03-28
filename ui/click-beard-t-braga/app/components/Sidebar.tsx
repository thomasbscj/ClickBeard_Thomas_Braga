"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Sidebar() {
  const router = useRouter();
  const isAdmin = document.cookie.includes("admin");

  useEffect(() => {
    // Force component to stay visible
    const sidebar = document.querySelector("aside");
    if (sidebar) {
      sidebar.style.display = "flex";
    }
  }, []);

  const handleLogout = () => {
    router.push("/logout");
  };

  return (
    <aside className="w-64 bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 text-white transition-all duration-300 ease-in-out flex flex-col shadow-2xl border-r border-red-700/30">
      {/* Header / Logo Section */}
      <Link
        href="/"
        className="p-6 border-b border-red-700/30 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Click Beard
          </h1>
          <p className="text-xs text-gray-400 mt-1">Barbearia Premium</p>
        </div>
      </Link>

      {/* New Appointment Button */}
      <div className="px-3 py-4 border-b border-red-700/30">
        <a
          href="/appointments"
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Novo Agendamento
        </a>
      </div>

      {/* My Appointments Button */}
      <div className="px-3 py-2 border-b border-red-700/30">
        <a
          href="/appointments/my"
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Meus Agendamentos
        </a>
      </div>

      {/* Admin Panel Button - Only visible for admins */}
      {isAdmin && (
        <div className="px-3 py-2 border-b border-red-700/30">
          <a
            href="/admin"
            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Painel Admin
          </a>
        </div>
      )}
      <div className="flex-1"></div>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-red-700/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12H9m6 0H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}
