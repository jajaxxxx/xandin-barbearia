import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MinhaConta from "@/components/MinhaConta";

export const metadata = {
  title: "Minha Conta | Xandin Barbearia",
};

export default function ContaPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <MinhaConta />
      </main>
      <Footer />
    </>
  );
}