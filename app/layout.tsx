import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xandin Barbearia",
  description: "Agende seu horário on-line. Leva menos de 1 minuto!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.className} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}