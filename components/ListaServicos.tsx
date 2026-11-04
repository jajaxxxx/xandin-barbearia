import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Servico = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  duration_minutes: number;
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function ListaServicos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, name, category, price, duration_minutes")
    .eq("active", true)
    .order("category")
    .order("name");

  if (error) {
    return (
      <p className="text-red-400">Não foi possível carregar os serviços.</p>
    );
  }

  
  const grupos = new Map<string, Servico[]>();
  for (const s of (data ?? []) as Servico[]) {
    const categoria = s.category ?? "Outros";
    grupos.set(categoria, [...(grupos.get(categoria) ?? []), s]);
  }

  return (
    <div className="space-y-10">
      {[...grupos.entries()].map(([categoria, itens]) => (
        <div key={categoria}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-amber-400">
            {categoria}
          </h3>
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
            {itens.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-white/50">
                    {s.duration_minutes} min
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    {brl.format(Number(s.price))}
                  </span>
                  <Link
                    href={`/agendar?servico=${s.id}`}
                    className="rounded-full border border-amber-400 px-4 py-1.5 text-sm text-amber-400 transition hover:bg-amber-400 hover:text-black"
                  >
                    Agendar
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}