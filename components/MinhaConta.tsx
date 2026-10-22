"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Item = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  service_name: string;
  price: number;
  barber_name: string;
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function quando(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export default function MinhaConta() {
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const [itens, setItens] = useState<Item[]>([]);
  const [carregandoItens, setCarregandoItens] = useState(false);
  const [agora, setAgora] = useState(0);
  const [cancelando, setCancelando] = useState("");
  const [versao, setVersao] = useState(0);

  // Descobre se já existe alguém logado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setCarregandoSessao(false);
    });

    const { data: escuta } = supabase.auth.onAuthStateChange(
      (_evento, sessao) => {
        setUser(sessao?.user ?? null);
      }
    );

    return () => escuta.subscription.unsubscribe();
  }, [supabase]);

  // Carrega os agendamentos de quem está logado
  useEffect(() => {
    if (!user) {
      setItens([]);
      return;
    }

    let cancelado = false;
    setCarregandoItens(true);
    setAgora(Date.now());

    supabase.rpc("my_appointments").then(({ data, error }) => {
      if (cancelado) return;
      if (error) {
        setErro("Não foi possível carregar seus agendamentos.");
        setItens([]);
      } else {
        setItens((data ?? []) as Item[]);
      }
      setCarregandoItens(false);
    });

    return () => {
      cancelado = true;
    };
  }, [user, versao, supabase]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    setAviso("");

    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) setErro("E-mail ou senha incorretos.");
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
      });
      if (error) {
        const m = error.message.toLowerCase();
        if (m.includes("already")) {
          setErro("Este e-mail já tem conta. Use a aba Entrar.");
        } else if (m.includes("password")) {
          setErro("A senha precisa ter pelo menos 6 caracteres.");
        } else {
          setErro("Não foi possível criar a conta. Confira o e-mail.");
        }
      } else if (!data.session) {
        setAviso("Conta criada! Confira seu e-mail para confirmar o cadastro.");
      }
    }

    setEnviando(false);
  }

  async function cancelar(item: Item) {
    if (!window.confirm(`Cancelar seu horário de ${quando(item.starts_at)}?`)) {
      return;
    }

    setCancelando(item.id);
    setErro("");

    const { error } = await supabase.rpc("cancel_my_appointment", {
      p_id: item.id,
    });

    setCancelando("");

    if (error) {
      setErro(
        error.message.includes("antecedência")
          ? error.message
          : "Não foi possível cancelar. Tente novamente."
      );
      return;
    }
    setVersao((v) => v + 1);
  }

  async function sair() {
    await supabase.auth.signOut();
    setErro("");
    setAviso("");
  }

  const proximos = itens
    .filter(
      (i) =>
        i.status !== "cancelled" && new Date(i.ends_at).getTime() > agora
    )
    .reverse();
  const anteriores = itens.filter((i) => !proximos.includes(i));

  const campo =
    "w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none";

  function cartao(item: Item, podeCancelar: boolean) {
    const cancelado = item.status === "cancelled";
    return (
      <li
        key={item.id}
        className={`rounded-xl border p-4 ${
          cancelado
            ? "border-white/5 bg-white/5 opacity-50"
            : "border-white/10 bg-neutral-900"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`font-semibold first-letter:uppercase ${
                cancelado ? "line-through" : "text-amber-400"
              }`}
            >
              {quando(item.starts_at)}
            </p>
            <p className="mt-1 font-medium">{item.service_name}</p>
            <p className="text-sm text-white/70">
              {brl.format(Number(item.price))} · com {item.barber_name}
            </p>
          </div>

          {cancelado ? (
            <span className="text-sm text-red-400">Cancelado</span>
          ) : podeCancelar ? (
            <button
              type="button"
              disabled={cancelando === item.id}
              onClick={() => cancelar(item)}
              className="rounded-full border border-red-400/60 px-4 py-1.5 text-sm text-red-400 transition hover:bg-red-400 hover:text-black disabled:opacity-50"
            >
              {cancelando === item.id ? "Cancelando..." : "Cancelar"}
            </button>
          ) : null}
        </div>
      </li>
    );
  }

  if (carregandoSessao) {
    return <p className="text-white/50">Carregando...</p>;
  }

  // Tela de entrar / criar conta
  if (!user) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold">Minha Conta</h1>
        <p className="mb-6 text-center text-sm text-white/50">
          Acompanhe e cancele seus horários
        </p>

        <div className="mb-6 grid grid-cols-2 rounded-full border border-white/10 p-1 text-sm">
          {(["entrar", "criar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setModo(m);
                setErro("");
                setAviso("");
              }}
              className={`rounded-full py-2 transition ${
                modo === m
                  ? "bg-amber-400 font-bold text-black"
                  : "text-white/70"
              }`}
            >
              {m === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} className="space-y-3">
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
            minLength={6}
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            placeholder="Senha (mínimo 6 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={campo}
          />

          {erro && <p className="text-sm text-red-400">{erro}</p>}
          {aviso && <p className="text-sm text-green-400">{aviso}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-full bg-amber-400 px-8 py-3 font-bold text-black transition hover:bg-amber-300 disabled:opacity-50"
          >
            {enviando
              ? "Aguarde..."
              : modo === "entrar"
              ? "Entrar"
              : "Criar conta"}
          </button>
        </form>
      </div>
    );
  }

  // Tela logada
  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Minha Conta</h1>
          <p className="truncate text-sm text-white/50">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={sair}
          className="shrink-0 rounded-full border border-white/20 px-4 py-1.5 text-sm transition hover:bg-white hover:text-black"
        >
          Sair
        </button>
      </div>

      <Link
        href="/agendar"
        className="mb-8 inline-block rounded-full bg-amber-400 px-6 py-2.5 font-bold text-black transition hover:bg-amber-300"
      >
        Agendar novo horário
      </Link>

      {erro && <p className="mb-4 text-red-400">{erro}</p>}
      {carregandoItens && <p className="text-white/50">Carregando...</p>}

      {!carregandoItens && itens.length === 0 && (
        <p className="text-white/50">
          Você ainda não tem agendamentos. Os horários marcados com a sua conta
          ligada aparecem aqui.
        </p>
      )}

      {proximos.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">
            Próximos
          </h2>
          <ul className="mb-8 space-y-3">
            {proximos.map((i) => cartao(i, true))}
          </ul>
        </>
      )}

      {anteriores.length > 0 && (
        <>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/50">
            Anteriores
          </h2>
          <ul className="space-y-3">
            {anteriores.map((i) => cartao(i, false))}
          </ul>
        </>
      )}
    </div>
  );
}