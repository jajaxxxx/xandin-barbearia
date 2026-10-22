import Image from "next/image";
import Link from "next/link";
import { barbearia } from "@/lib/barbearia";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={barbearia.logo}
            alt={barbearia.nome}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-sm font-bold tracking-wide sm:text-base">
            {barbearia.nome.toUpperCase()}
          </span>
        </Link>

        <Link
          href="/conta"
          className="rounded-full border border-white/20 px-4 py-1.5 text-sm transition hover:bg-white hover:text-black"
        >
          Minha Conta
        </Link>
      </div>
    </header>
  );
}