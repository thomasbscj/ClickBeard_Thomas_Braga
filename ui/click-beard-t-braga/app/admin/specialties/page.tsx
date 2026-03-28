"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAllSpecialties,
  createSpecialty,
  deleteSpecialty,
} from "@/axios/calls";

interface Specialty {
  name: string;
  description?: string;
}

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      setIsLoading(true);
      const data = await getAllSpecialties(100, 0);
      setSpecialties(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar especialidades",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.name && formData.description) {
        await createSpecialty({
          name: formData.name,
          description: formData.description,
        });
        setSuccessMessage("Especialidade criada com sucesso!");
        setFormData({
          name: "",
          description: "",
        });
        setShowForm(false);
        await fetchSpecialties();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Preencha todos os campos");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar especialidade",
      );
    }
  };

  const handleDelete = async (name: string) => {
    if (confirm("Tem certeza que deseja deletar esta especialidade?")) {
      try {
        await deleteSpecialty(name);
        setSuccessMessage("Especialidade deletada com sucesso!");
        await fetchSpecialties();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao deletar especialidade",
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-red-700/30 shadow-md ml-64">
        <div className="px-10 py-8 flex justify-between items-center">
          <div>
            <Link
              href="/admin"
              className="text-sm text-gray-400 hover:text-white mb-2 inline-block"
            >
              ← Voltar
            </Link>
            <h1 className="text-4xl font-bold text-white">
              Gerenciar Especialidades
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all"
          >
            {showForm ? "Cancelar" : "Nova Especialidade"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 py-16 px-8">
        <div className="w-full max-w-6xl">
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

          {/* Form */}
          {showForm && (
            <div className="bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-800 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Criar Nova Especialidade
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Nome da Especialidade
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 outline-none"
                    placeholder="Ex: Corte Tradicional"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 outline-none"
                    placeholder="Descrição da especialidade"
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
                >
                  Criar Especialidade
                </button>
              </form>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400 mt-4">Carregando especialidades...</p>
            </div>
          )}

          {/* Specialties Grid */}
          {!isLoading && specialties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialties.map((specialty) => (
                <div
                  key={specialty.name}
                  className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800"
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {specialty.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {specialty.description || "Sem descrição"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(specialty.name)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all whitespace-nowrap"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && specialties.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">
                Nenhuma especialidade cadastrada
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
