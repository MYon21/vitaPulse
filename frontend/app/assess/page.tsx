import type { Metadata } from "next";
import { Assess } from "@/components/Assess";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Try a reading — VitaPulse",
  description:
    "Enter sex, age, blood pressure, blood sugar, alcohol status, and drug use for a simulated heart-disease chance.",
};

export default function AssessPage() {
  return (
    <div className="page">
      <a className="skip" href="#reading">
        Skip to content
      </a>
      <Header />
      <main>
        <Assess />
      </main>
      <Footer />
    </div>
  );
}
