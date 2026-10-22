import Image from "next/image";
import Link from "next/link";
import { barbearia } from "@/lib/barbearia";

export default function Hero() {
  return (
    <section className="flex flex-col items-center px-4 py-20 text-center">
      <Image
        src={barbearia.logo}
        alt={barbearia.nome}
        width={160}
        height={160}
        priority
        unoptimized
        className="mb-6 h-40 w-40 object-contain"
      />
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
        {barbearia.nome.toUpperCase()}
      </h1>
      <p className="mt-3 text-lg text-white/70">{barbearia.slogan}</p>
      <Link
        href="/agendar"
        className="mt-8 rounded-full bg-amber-400 px-8 py-3 font-bold text-black transition hover:bg-amber-300"
      >
        Agendar Horário
      </Link>
    </section>
  );
}