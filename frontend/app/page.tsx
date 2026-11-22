import { EvidenceSection } from "@/components/evidence/EvidenceSection";
import { ChallengeSection } from "@/components/challenge/ChallengeSection";
import { PreventionSection } from "@/components/prevention/PreventionSection";
import { HowItWorks } from "@/components/cardiome/HowItWorks";
import { HeroSection } from "@/components/hero/HeroSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function HomePage() {
  return (
    <div className="bg-white text-[#101014]">
      <a className="skip" href="#signal">
        Skip to content
      </a>
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <PreventionSection />
        <ChallengeSection />
        <EvidenceSection />
      </main>
      <Footer />
    </div>
  );
}
