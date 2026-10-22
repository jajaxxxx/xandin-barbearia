"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BotaoSair() {
  const router = useRouter();

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={sair}
      className="rounded-full border border-white/20 px-4 py-1.5 text-sm transition hover:bg-white hover:text-black"
    >
      Sair
    </button>
  );
}