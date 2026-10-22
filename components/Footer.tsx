import { barbearia } from "@/lib/barbearia";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-6 text-center text-sm text-white/50">
      © {barbearia.nome}. Todos os direitos reservados.
    </footer>
  );
}