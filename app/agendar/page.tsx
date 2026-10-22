import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Agendamento from "@/components/Agendamento";
import { connection } from "next/server";

type Props = {
  searchParams: Promise<{ categoria?: string; servico?: string }>;
};

async function Dados({ searchParams }: Props) {
  await connection();

  const { categoria, servico } = await searchParams;
  const supabase = await createClient();

  const [servicosRes, barbeirosRes] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, category, price, duration_minutes")
      .eq("active", true)
      .order("category")
      .order("name"),
    supabase
      .from("barbers")
      .select("id, name")
      .eq("active", true)
      .order("name"),
  ]);

  if (servicosRes.error || barbeirosRes.error) {
    return (
      <p className="text-red-400">Não foi possível carregar os dados.</p>
    );
  }

  return (
    <Agendamento
      servicos={servicosRes.data ?? []}
      barbeiros={barbeirosRes.data ?? []}
      categoriaInicial={categoria}
      servicoInicial={servico}
    />
  );
}

export default function AgendarPage({ searchParams }: Props) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← Voltar
        </Link>
        <h1 className="mb-8 mt-4 text-3xl font-bold">Agendar horário</h1>
        <Suspense fallback={<p className="text-white/50">Carregando...</p>}>
          <Dados searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}