import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer id="company" className="border-t border-[#F0E4E7] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-start md:justify-between">
        <Logo href="/" />
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-[#101014]">Company</p>
          <p className="mt-2 text-sm leading-relaxed text-[#667085]">
            VitaPulse is a product preview for heart-disease awareness. It is not a medical device and it does not provide a diagnosis. The try-it score comes from a model trained on synthetic data.
          </p>
        </div>
        <p className="text-sm text-[#98A2B3]">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
