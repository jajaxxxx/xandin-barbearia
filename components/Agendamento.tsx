"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { barbearia } from "@/lib/barbearia";

type Servico = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  duration_minutes: number;
};

type Barbeiro = { id: string; name: string };

type Dia = { iso: string; semana: string; dia: string; mes: string };

type Confirmado = {
  servico: string;
  barbeiro: string;
  quando: string;
  preco: number;
  cliente: string;
  telefone: string;
};

type Props = {
  servicos: Servico[];
  barbeiros: Barbeiro[];
  categoriaInicial?: string;
  servicoInicial?: string;
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const semAcento = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function proximosDias(qtd: number): Dia[] {
  const hoje = new Date();
  const lista: Dia[] = [];
  for (let i = 0; i < qtd; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    lista.push({
      iso,
      semana: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      dia: String(d.getDate()).padStart(2, "0"),
      mes: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    });
  }
  return lista;
}

function formatarHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function mascaraTelefone(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

function Passo({ numero, titulo }: { numero: number; titulo: string }) {
  return (
    <h2 className="mb-3 mt-10 flex items-center gap-3 text-lg font-semibold">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-black">
        {numero}
      </span>
      {titulo}
    </h2>
  );
}

export default function Agendamento({
  servicos,
  barbeiros,
  categoriaInicial,
  servicoInicial,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const categorias = useMemo(
    () => [...new Set(servicos.map((s) => s.category ?? "Outros"))],
    [servicos]
  );

  const [categoria, setCategoria] = useState<string>(
    () =>
      categorias.find(
        (c) => semAcento(c) === semAcento(categoriaInicial ?? "")
      ) ?? "Todos"
  );
  const [servicoId, setServicoId] = useState<string>(() =>
    servicoInicial && servicos.some((s) => s.id === servicoInicial)
      ? servicoInicial
      : ""
  );
  const [barbeiroId, setBarbeiroId] = useState<string>(
    barbeiros.length === 1 ? barbeiros[0].id : ""
  );
  const [dias, setDias] = useState<Dia[]>([]);
  const [data, setData] = useState<string>("");
  const [horarios, setHorarios] = useState<string[]>([]);
  const [horario, setHorario] = useState<string>("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string>("");

  // Dados do cliente e envio
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [confirmado, setConfirmado] = useState<Confirmado | null>(null);

  // Se a pessoa está com a conta ligada (null = ainda descobrindo)
  const [logado, setLogado] = useState<boolean | null>(null);

  // Muda para recarregar a lista de horários livres
  const [versao, setVersao] = useState(0);

  // Monta a lista de dias só no navegador
  useEffect(() => {
    setDias(proximosDias(14));
  }, []);

  // Descobre se a pessoa está logada
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLogado(!!data.user));
  }, [supabase]);

  // Busca os horários livres sempre que serviço, barbeiro ou dia mudam
  useEffect(() => {
    if (!servicoId || !barbeiroId || !data) return;

    let cancelado = false;
    setCarregando(true);
    setErro("");
    setHorario("");

    supabase
      .rpc("get_available_slots", {
        p_barber_id: barbeiroId,
        p_service_id: servicoId,
        p_date: data,
      })
      .then(({ data: resultado, error }) => {
        if (cancelado) return;
        if (error) {
          setErro("Não foi possível carregar os horários. Tente novamente.");
          setHorarios([]);
        } else {
          setHorarios([
            ...new Set(
              ((resultado ?? []) as { slot: string }[]).map((r) => r.slot)
            ),
          ]);
        }
        setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [servicoId, barbeiroId, data, supabase, versao]);

  const servicosVisiveis = servicos.filter(
    (s) => categoria === "Todos" || (s.category ?? "Outros") === categoria
  );
  const servicoEscolhido = servicos.find((s) => s.id === servicoId);
  const barbeiroEscolhido = barbeiros.find((b) => b.id === barbeiroId);

  const dataPorExtenso = data
    ? new Date(data + "T12:00:00").toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "";

  async function confirmar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!horario || !servicoEscolhido || enviando) return;

    setEnviando(true);
    setErroEnvio("");

    const { error } = await supabase.rpc("create_appointment", {
      p_barber_id: barbeiroId,
      p_service_id: servicoId,
      p_starts_at: horario,
      p_name: nome,
      p_phone: telefone,
    });

    setEnviando(false);

    if (error) {
      if (error.message.includes("indisponível") || error.code === "23P01") {
        setErroEnvio(
          "Esse horário acabou de ser ocupado. Escolha outro horário."
        );
        setVersao((v) => v + 1); // atualiza a lista de horários livres
      } else if (error.message.includes("inválido")) {
        setErroEnvio("Confira seu nome e seu WhatsApp (com DDD).");
      } else {
        setErroEnvio("Não foi possível confirmar agora. Tente novamente.");
      }
      return;
    }

    setConfirmado({
      servico: servicoEscolhido.name,
      barbeiro: barbeiroEscolhido?.name ?? "",
      quando: `${dataPorExtenso} às ${formatarHora(horario)}`,
      preco: Number(servicoEscolhido.price),
      cliente: nome.trim(),
      telefone,
    });
  }

  // Tela de sucesso
  if (confirmado) {
    const mensagem = [
      "Olá! Acabei de agendar pelo site:",
      "",
      `Serviço: ${confirmado.servico}`,
      `Quando: ${confirmado.quando}`,
      `Nome: ${confirmado.cliente}`,
      `WhatsApp: ${confirmado.telefone}`,
    ].join("\n");

    const linkWhatsapp = `https://wa.me/${
      barbearia.whatsapp
    }?text=${encodeURIComponent(mensagem)}`;

    return (
      <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-8 text-center">
        <p className="text-5xl">✅</p>
        <h2 className="mb-4 mt-3 text-2xl font-bold">
          Agendamento confirmado!
        </h2>
        <p className="font-medium">{confirmado.servico}</p>
        {confirmado.barbeiro && (
          <p className="text-white/70">com {confirmado.barbeiro}</p>
        )}
        <p className="text-white/70">{confirmado.quando}</p>
        <p className="mt-2 font-semibold">{brl.format(confirmado.preco)}</p>

        <p className="mt-8 text-sm text-white/70">
          Para avisar a barbearia, toque no botão abaixo e envie a mensagem no
          WhatsApp.
        </p>
        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-full bg-green-500 px-8 py-3 font-bold text-black transition hover:bg-green-400"
        >
          Avisar a barbearia no WhatsApp
        </a>

        <div className="mt-5 space-y-3">
          {logado ? (
            <Link
              href="/conta"
              className="block text-sm text-amber-400 underline"
            >
              Ver meus agendamentos
            </Link>
          ) : (
            <p className="text-xs text-white/50">
              Este horário não está ligado a nenhuma conta. Para cancelar, fale
              com a barbearia pelo WhatsApp. Da próxima vez, entre na sua conta
              antes de agendar.
            </p>
          )}
          <Link
            href="/"
            className="block text-sm text-white/60 underline hover:text-white"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const botao = (ativo: boolean) =>
    `rounded-xl border p-4 text-left transition ${
      ativo
        ? "border-amber-400 bg-amber-400/10"
        : "border-white/10 bg-white/5 hover:border-white/30"
    }`;

  const campo =
    "w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none";

  return (
    <div>
      {logado === false && (
        <div className="mb-2 rounded-xl border border-amber-400/40 bg-amber-400/5 p-4 text-sm">
          <p className="text-white/80">
            Entre na sua conta antes de agendar para acompanhar e cancelar seus
            horários depois.
          </p>
          <Link
            href="/conta"
            className="mt-2 inline-block font-semibold text-amber-400 underline"
          >
            Entrar ou criar conta
          </Link>
        </div>
      )}

      {/* 1. Serviço */}
      <Passo numero={1} titulo="Escolha o serviço" />

      <div className="mb-4 flex flex-wrap gap-2">
        {["Todos", ...categorias].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoria(c)}
            className={`rounded-full border px-4 py-1 text-sm transition ${
              categoria === c
                ? "border-amber-400 bg-amber-400 text-black"
                : "border-white/20 text-white/70 hover:border-white/50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {servicosVisiveis.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setServicoId(s.id)}
            className={`${botao(servicoId === s.id)} flex w-full items-center justify-between gap-4`}
          >
            <span>
              <span className="block font-medium">{s.name}</span>
              <span className="text-sm text-white/50">
                {s.duration_minutes} min
              </span>
            </span>
            <span className="font-semibold">{brl.format(Number(s.price))}</span>
          </button>
        ))}
        {servicosVisiveis.length === 0 && (
          <p className="text-white/50">Nenhum serviço nesta categoria ainda.</p>
        )}
      </div>

      {/* 2. Barbeiro (só aparece se houver mais de um) */}
      {servicoId && barbeiros.length > 1 && (
        <>
          <Passo numero={2} titulo="Escolha o barbeiro" />
          <div className="grid grid-cols-2 gap-2">
            {barbeiros.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBarbeiroId(b.id)}
                className={botao(barbeiroId === b.id)}
              >
                {b.name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* 3. Dia */}
      {servicoId && barbeiroId && (
        <>
          <Passo numero={barbeiros.length > 1 ? 3 : 2} titulo="Escolha o dia" />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dias.map((d) => (
              <button
                key={d.iso}
                type="button"
                onClick={() => setData(d.iso)}
                className={`${botao(data === d.iso)} min-w-[72px] shrink-0 text-center`}
              >
                <span className="block text-xs uppercase text-white/50">
                  {d.semana}
                </span>
                <span className="block text-xl font-bold">{d.dia}</span>
                <span className="block text-xs uppercase text-white/50">
                  {d.mes}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 4. Horário */}
      {servicoId && barbeiroId && data && (
        <>
          <Passo
            numero={barbeiros.length > 1 ? 4 : 3}
            titulo="Escolha o horário"
          />

          {carregando && <p className="text-white/50">Buscando horários...</p>}
          {erro && <p className="text-red-400">{erro}</p>}
          {!carregando && !erro && horarios.length === 0 && (
            <p className="text-white/50">
              Não há horários livres neste dia. Escolha outro dia.
            </p>
          )}

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {horarios.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorario(h)}
                className={`${botao(horario === h)} text-center font-medium`}
              >
                {formatarHora(h)}
              </button>
            ))}
          </div>
        </>
      )}

      {/* 5. Confirmação */}
      {horario && servicoEscolhido && (
        <>
          <Passo
            numero={barbeiros.length > 1 ? 5 : 4}
            titulo="Seus dados"
          />

          <div className="mb-6 rounded-xl border border-amber-400/50 bg-amber-400/5 p-5">
            <p className="font-medium">{servicoEscolhido.name}</p>
            {barbeiroEscolhido && (
              <p className="text-white/70">com {barbeiroEscolhido.name}</p>
            )}
            <p className="text-white/70">
              {dataPorExtenso} às {formatarHora(horario)}
            </p>
            <p className="mt-2 font-semibold">
              {brl.format(Number(servicoEscolhido.price))}
            </p>
          </div>

          <form onSubmit={confirmar} className="space-y-3">
            <input
              type="text"
              required
              minLength={2}
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={campo}
            />
            <input
              type="tel"
              required
              inputMode="numeric"
              placeholder="WhatsApp com DDD"
              value={telefone}
              onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
              className={campo}
            />

            {erroEnvio && <p className="text-red-400">{erroEnvio}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-full bg-amber-400 px-8 py-3 font-bold text-black transition hover:bg-amber-300 disabled:opacity-50"
            >
              {enviando ? "Confirmando..." : "Confirmar agendamento"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
