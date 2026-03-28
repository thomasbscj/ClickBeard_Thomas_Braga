"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAllBarbers,
  createBarber,
  deleteBarber,
  getAllSpecialties,
} from "@/axios/calls";

interface Barber {
  id: number;
  name: string;
  bornAt: string;
  hiredAt: string;
  specialties: Array<{ name: string }>;
}

interface Specialty {
  name: string;
  description?: string;
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bornAt: "",
    hiredAt: "",
    specialties: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [barbersData, specialtiesData] = await Promise.all([
        getAllBarbers(100, 0),
        getAllSpecialties(100, 0),
      ]);
      setBarbers(barbersData.data);
      setSpecialties(specialtiesData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        formData.name &&
        formData.bornAt &&
        formData.hiredAt &&
        formData.specialties.length > 0
      ) {
        await createBarber({
          name: formData.name,
          bornAt: parseInt(formData.bornAt.split("-")[0]), // Extract year from date
          hiredAt: new Date(formData.hiredAt).toISOString(),
          specialties: formData.specialties,
        });
        setSuccessMessage("Barbeiro criado com sucesso!");
        setFormData({
          name: "",
          bornAt: "",
          hiredAt: "",
          specialties: [],
        });
        setShowForm(false);
        await fetchData();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Preencha todos os campos");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar barbeiro");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este barbeiro?")) {
      try {
        await deleteBarber(id);
        setSuccessMessage("Barbeiro deletado com sucesso!");
        await fetchData();
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao deletar barbeiro",
        );
      }
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
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
              Gerenciar Barbeiros
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
          >
            {showForm ? "Cancelar" : "Novo Barbeiro"}
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
                Criar Novo Barbeiro
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 outline-none"
                      placeholder="Nome do barbeiro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.bornAt}
                      onChange={(e) =>
                        setFormData({ ...formData, bornAt: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Data de Contratação
                  </label>
                  <input
                    type="date"
                    value={formData.hiredAt}
                    onChange={(e) =>
                      setFormData({ ...formData, hiredAt: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Especialidades
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {specialties.map((specialty) => (
                      <label
                        key={specialty.name}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(
                            specialty.name,
                          )}
                          onChange={() => toggleSpecialty(specialty.name)}
                          className="w-4 h-4 rounded bg-gray-800 border-gray-700"
                        />
                        <span className="text-gray-300">{specialty.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
                >
                  Criar Barbeiro
                </button>
              </form>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-400 mt-4">Carregando barbeiros...</p>
            </div>
          )}

          {/* Barbers List */}
          {!isLoading && barbers.length > 0 && (
            <div className="space-y-4">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800"
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {barber.name}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>Ano de Nascimento: {barber.bornAt}</p>
                        <p>
                          Contratado em:{" "}
                          {new Date(barber.hiredAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {barber.specialties.map((spec) => (
                          <span
                            key={spec.name}
                            className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs rounded-full"
                          >
                            {spec.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(barber.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && barbers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">
                Nenhum barbeiro cadastrado
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
