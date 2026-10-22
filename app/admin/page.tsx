import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import BotaoSair from "@/components/BotaoSair";
import AgendaDia from "@/components/AgendaDia";

export const metadata = {
  title: "Painel | Xandin Barbearia",
  robots: { index: false },
};

async function Painel() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: equipe } = await supabase
    .from("staff")
    .select("role, barber_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!equipe) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">
          Este usuário não tem permissão para acessar o painel.
        </p>
        <BotaoSair />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-sm text-white/50">
            {user.email} ·{" "}
            {equipe.role === "owner" ? "Administrador" : "Barbeiro"}
          </p>
        </div>
        <BotaoSair />
      </div>

      <AgendaDia />
    </div>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Suspense fallback={<p className="text-white/50">Carregando...</p>}>
        <Painel />
      </Suspense>
    </main>
  );
}