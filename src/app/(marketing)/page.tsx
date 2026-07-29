import { Faq } from "@/components/Faq";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { FooterCta } from "@/components/FooterCta";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <Faq />
      <FooterCta />
      <Footer />
    </main>
  );
}
