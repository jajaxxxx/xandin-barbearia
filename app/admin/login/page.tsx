"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErro("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha incorretos.");
      setEnviando(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const campo =
    "w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-neutral-900 p-8"
      >
        <h1 className="text-center text-2xl font-bold">Painel da barbearia</h1>
        <p className="text-center text-sm text-white/50">
          Acesso restrito à equipe
        </p>

        <input
          type="email"
          required
          autoComplete="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={campo}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className={campo}
        />

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-full bg-amber-400 px-8 py-3 font-bold text-black transition hover:bg-amber-300 disabled:opacity-50"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}