import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Click Beard - Agendamentos de Barbearia",
  description: "Sistema de agendamento de barbearia premium",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
