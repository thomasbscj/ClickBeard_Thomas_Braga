"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "@/axios/calls";

interface User {
  id: number;
  Name: string;
  email: string;
  Role: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

interface UsersData {
  users: User[];
  isLoading: boolean;
  totalUsers: number;
}

export default function UsersPage() {
  const [data, setData] = useState<UsersData>({
    users: [],
    isLoading: true,
    totalUsers: 0,
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers(itemsPerPage, currentPage);
        setData({
          users: response.data || [],
          isLoading: false,
          totalUsers: response.pagination?.total || response.count || 0,
        });
      } catch (error) {
        console.error("Error fetching users:", error);
        setData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchUsers();
  }, [currentPage, itemsPerPage]);

  const handleDeleteUser = async (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja deletar o usuário ${name}?`)) {
      try {
        await deleteUser(id);
        setData((prev) => ({
          ...prev,
          users: prev.users.filter((u) => u.id !== id),
          totalUsers: prev.totalUsers - 1,
        }));
        alert("Usuário deletado com sucesso!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Erro ao deletar usuário");
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === "admin"
      ? "bg-red-900/30 text-red-400 border border-red-500/30"
      : "bg-blue-900/30 text-blue-400 border border-blue-500/30";
  };

  const getRoleLabel = (role: string) => {
    return role === "admin" ? "Administrador" : "Usuário";
  };

  const totalPages = Math.ceil(data.totalUsers / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-red-700/30 shadow-md ml-64">
        <div className="px-10 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Gerenciamento de Usuários
            </h1>
            <p className="text-gray-300 mt-2">
              Visualize e gerencie todos os usuários do sistema
            </p>
          </div>
          <Link
            href="/admin"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 py-16 px-8">
        <div className="w-full max-w-7xl">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Users */}
            <div className="bg-linear-to-br from-blue-900/30 to-blue-800/10 rounded-xl shadow-lg p-6 border border-blue-500/30">
              <p className="text-gray-400 text-sm font-medium mb-2">
                Total de Usuários
              </p>
              <p className="text-3xl font-bold text-blue-400">
                {data.isLoading ? "..." : data.totalUsers}
              </p>
            </div>

            {/* Admins Count */}
            <div className="bg-linear-to-br from-red-900/30 to-red-800/10 rounded-xl shadow-lg p-6 border border-red-500/30">
              <p className="text-gray-400 text-sm font-medium mb-2">
                Administradores
              </p>
              <p className="text-3xl font-bold text-red-400">
                {data.isLoading
                  ? "..."
                  : data.users.filter((u) => u.Role === "admin").length}
              </p>
            </div>

            {/* Regular Users Count */}
            <div className="bg-linear-to-br from-green-900/30 to-green-800/10 rounded-xl shadow-lg p-6 border border-green-500/30">
              <p className="text-gray-400 text-sm font-medium mb-2">
                Usuários Comuns
              </p>
              <p className="text-3xl font-bold text-green-400">
                {data.isLoading
                  ? "..."
                  : data.users.filter((u) => u.Role === "user").length}
              </p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Função
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <p className="text-gray-400">Carregando usuários...</p>
                      </td>
                    </tr>
                  ) : data.users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <p className="text-gray-400">
                          Nenhum usuário encontrado
                        </p>
                      </td>
                    </tr>
                  ) : (
                    data.users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                          #{user.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium">
                          {user.Name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                              user.Role,
                            )}`}
                          >
                            {getRoleLabel(user.Role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(user.id, user.Name)}
                            disabled={user.Role === "admin"}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              user.Role === "admin"
                                ? "bg-gray-800/30 text-gray-500 border border-gray-600/30 cursor-not-allowed"
                                : "bg-red-900/30 hover:bg-red-800/50 text-red-400 border border-red-500/30 cursor-pointer"
                            }`}
                            title={
                              user.Role === "admin"
                                ? "Não é possível deletar administradores"
                                : ""
                            }
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded-lg transition-all"
              >
                Anterior
              </button>

              <div className="text-gray-400">
                Página {currentPage + 1} de {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded-lg transition-all"
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
