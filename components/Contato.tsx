import { barbearia } from "@/lib/barbearia";

export default function Contato() {
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    barbearia.endereco
  )}`;

  return (
    <section id="localizacao" className="bg-neutral-900 px-4 py-16 text-center">
      <h2 className="mb-6 text-2xl font-bold">Localização</h2>
      <p className="text-white/80">{barbearia.endereco}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
        <a
          href={mapa}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/20 px-5 py-2 hover:bg-white hover:text-black"
        >
          Ver no mapa
        </a>
        <a
          href={`https://wa.me/${barbearia.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/20 px-5 py-2 hover:bg-white hover:text-black"
        >
          WhatsApp {barbearia.telefone}
        </a>
      </div>
    </section>
  );
}