"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/axios/calls";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const name = nameRef.current?.value;
      const email = emailRef.current?.value;
      const password = passwordRef.current?.value;
      const confirmPassword = confirmPasswordRef.current?.value;
      if (!name || !email || !password || !confirmPassword) {
        setError("Por favor, preencha todos os campos");
        setIsLoading(false);
        return;
      }

      if (name.length < 3) {
        setError("Nome deve ter pelo menos 3 caracteres");
        setIsLoading(false);
        return;
      }

      if (!email.includes("@")) {
        setError("Por favor, insira um email válido");
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Senha deve ter pelo menos 6 caracteres");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("As senhas não coincidem");
        setIsLoading(false);
        return;
      }
      const response = await register(name, email, password);

      if (response) {
        setSuccess(
          "Cadastro realizado com sucesso! Redirecionando para login...",
        );
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao fazer cadastro";
      console.error("Register error:", err);
      if (
        errorMessage.includes("400") ||
        errorMessage.includes("already exists")
      ) {
        setError("Email já cadastrado ou dados inválidos");
      } else if (
        errorMessage.includes("Network") ||
        errorMessage.includes("ECONNREFUSED")
      ) {
        setError(
          "Erro de conexão com o servidor. Verifique se o backend está rodando.",
        );
      } else {
        setError(errorMessage || "Falha no cadastro. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-800/50">

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 via-white to-red-400 bg-clip-text text-transparent mb-2">
              Click Beard
            </h1>
            <p className="text-gray-400 text-sm">Crie sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                <p className="font-semibold mb-1">❌ Erro</p>
                <p>{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 text-sm">
                <p className="font-semibold mb-1">✓ Sucesso</p>
                <p>{success}</p>
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Nome Completo
              </label>
              <input
                id="name"
                ref={nameRef}
                type="text"
                placeholder="Seu nome"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                ref={emailRef}
                type="email"
                placeholder="seu@email.com"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Senha
              </label>
              <input
                id="password"
                ref={passwordRef}
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                ref={confirmPasswordRef}
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Cadastrando...
                </span>
              ) : (
                "Cadastrar"
              )}
            </button>
          </form>
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-linear-to-r from-gray-800 to-transparent"></div>
            <span className="text-xs text-gray-500">OU</span>
            <div className="flex-1 h-px bg-linear-to-l from-gray-800 to-transparent"></div>
          </div>
          <p className="text-center text-gray-400 text-sm">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Faça login aqui
            </Link>
          </p>
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">
          Sistema seguro com autenticação encriptada
        </p>
      </div>
    </div>
  );
}
