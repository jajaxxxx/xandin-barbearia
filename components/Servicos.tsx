import Image from "next/image";
import Link from "next/link";

type Categoria = {
  nome: string;
  slug: string;
  foto?: string;
};


const categorias: Categoria[] = [
    { nome: "Cabelo", slug: "cabelo", foto: "/servicos/cabelo-novo.jpeg" },
  { nome: "Química", slug: "quimica", foto: "/servicos/quimica.jpeg" },
    { nome: "Combos", slug: "combos", foto: "/servicos/combos.jpeg" },
];

export default function Servicos() {
  return (
    <section id="servicos" className="bg-neutral-900 px-4 py-16">
      <h2 className="mb-10 text-center text-2xl font-bold">Serviços</h2>

      <div className="mx-auto grid max-w-md grid-cols-3 gap-4 sm:gap-8">
        {categorias.map((c) => (
          <Link
            key={c.slug}
            href={`/agendar?categoria=${c.slug}`}
            className="group flex flex-col items-center gap-3"
          >
            <span className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-amber-400 bg-neutral-800 sm:h-28 sm:w-28">
              {c.foto && (
                <Image
                  src={c.foto}
                  alt={c.nome}
                  fill
                  sizes="112px"
                  className="object-cover transition duration-300 group-hover:scale-110"
                />
              )}
            </span>
            <span className="text-sm font-semibold uppercase tracking-widest">
              {c.nome}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}