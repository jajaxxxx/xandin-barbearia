"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Item = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  price: number;
  barber_name: string;
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Data de hoje no horário de Brasília, no formato AAAA-MM-DD
const hojeSP = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });

function somarDias(iso: string, n: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("sv-SE");
}

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function telefoneBonito(digitos: string) {
  const n = digitos.replace(/\D/g, "");
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return digitos;
}

export default function AgendaDia() {
  const supabase = useMemo(() => createClient(), []);

  const [data, setData] = useState("");
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [cancelando, setCancelando] = useState("");
  const [versao, setVersao] = useState(0);

  // Começa no dia de hoje (calculado só no navegador)
  useEffect(() => {
    setData(hojeSP());
  }, []);

  // Carrega a agenda sempre que o dia muda (ou depois de cancelar)
  useEffect(() => {
    if (!data) return;

    let cancelado = false;
    setCarregando(true);
    setErro("");

    supabase
      .rpc("admin_get_agenda", { p_date: data })
      .then(({ data: resultado, error }) => {
        if (cancelado) return;
        if (error) {
          setErro("Não foi possível carregar a agenda.");
          setItens([]);
        } else {
          setItens((resultado ?? []) as Item[]);
        }
        setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [data, versao, supabase]);

  async function cancelar(item: Item) {
    const ok = window.confirm(
      `Cancelar o horário de ${item.client_name} às ${hora(item.starts_at)}?`
    );
    if (!ok) return;

    setCancelando(item.id);
    setErro("");

    const { error } = await supabase.rpc("admin_cancel_appointment", {
      p_id: item.id,
    });

    setCancelando("");

    if (error) {
      setErro("Não foi possível cancelar. Tente novamente.");
      return;
    }
    setVersao((v) => v + 1);
  }

  const ativos = itens.filter((i) => i.status !== "cancelled");
  const total = ativos.reduce((soma, i) => soma + Number(i.price), 0);

  const dataPorExtenso = data
    ? new Date(data + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "";

  const botaoNav =
    "rounded-full border border-white/20 px-4 py-1.5 text-sm transition hover:bg-white hover:text-black";

  return (
    <div>
      {/* Navegação entre os dias */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => data && setData(somarDias(data, -1))}
          className={botaoNav}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => setData(hojeSP())}
          className={botaoNav}
        >
          Hoje
        </button>
        <button
          type="button"
          onClick={() => data && setData(somarDias(data, 1))}
          className={botaoNav}
        >
          →
        </button>
        <input
          type="date"
          value={data}
          onChange={(e) => e.target.value && setData(e.target.value)}
          className="rounded-lg border border-white/20 bg-black px-3 py-1.5 text-sm [color-scheme:dark]"
        />
      </div>

      <h2 className="text-xl font-semibold first-letter:uppercase">
        {dataPorExtenso}
      </h2>
      <p className="mb-6 mt-1 text-sm text-white/50">
        {ativos.length}{" "}
        {ativos.length === 1 ? "agendamento" : "agendamentos"} ·{" "}
        {brl.format(total)}
      </p>

      {erro && <p className="mb-4 text-red-400">{erro}</p>}
      {carregando && <p className="text-white/50">Carregando agenda...</p>}

      {!carregando && !erro && itens.length === 0 && (
        <p className="text-white/50">Nenhum agendamento neste dia.</p>
      )}

      <ul className="space-y-3">
        {itens.map((item) => {
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
                    className={`text-lg font-bold ${
                      cancelado ? "line-through" : "text-amber-400"
                    }`}
                  >
                    {hora(item.starts_at)} – {hora(item.ends_at)}
                  </p>
                  <p className="mt-1 font-medium">{item.client_name}</p>
                  <p className="text-sm text-white/70">
                    {item.service_name} · {brl.format(Number(item.price))}
                  </p>
                  <p className="text-sm text-white/50">
                    com {item.barber_name}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {cancelado ? (
                    <span className="text-sm text-red-400">Cancelado</span>
                  ) : (
                    <button
                      type="button"
                      disabled={cancelando === item.id}
                      onClick={() => cancelar(item)}
                      className="rounded-full border border-red-400/60 px-4 py-1.5 text-sm text-red-400 transition hover:bg-red-400 hover:text-black disabled:opacity-50"
                    >
                      {cancelando === item.id ? "Cancelando..." : "Cancelar"}
                    </button>
                  )}
                  <a
                    href={`https://wa.me/55${item.client_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/70 underline hover:text-white"
                  >
                    {telefoneBonito(item.client_phone)}
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}