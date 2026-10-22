import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Servicos from "@/components/Servicos";
import Instagram from "@/components/Instagram";
import Contato from "@/components/Contato";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Servicos />
        <Instagram />
        <Contato />
      </main>
      <Footer />
    </>
  );
}