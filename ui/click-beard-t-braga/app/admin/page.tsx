"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-red-700/30 shadow-md ml-64">
        <div className="px-10 py-8">
          <h1 className="text-4xl font-bold text-white">
            Painel Administrativo
          </h1>
          <p className="text-gray-300 mt-2">
            Gerencie barbeiros, especialidades e agendamentos
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 py-16 px-8">
        <div className="w-full max-w-6xl">
          <p className="text-gray-400 text-lg">
            Painel de administração em desenvolvimento...
          </p>
        </div>
      </main>
    </div>
  );
}
