import { barbearia } from "@/lib/barbearia";

export default function Instagram() {
  return (
    <section className="bg-black px-4 py-16 text-center">
      <h2 className="mb-4 text-2xl font-bold">Instagram</h2>
      <p className="mb-6 text-white/70">
        Veja o que está rolando em nosso Instagram
      </p>
      <a
        href={barbearia.instagram}
        target="_blank"
        rel="noreferrer"
        className="inline-block rounded-full border border-amber-400 px-6 py-2 text-amber-400 transition hover:bg-amber-400 hover:text-black"
      >
        Acessar perfil
      </a>
    </section>
  );
}