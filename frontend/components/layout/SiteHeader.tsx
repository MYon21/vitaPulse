"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "/#how", label: "Product" },
  { href: "/#prevent", label: "Prevent" },
  { href: "/#evidence", label: "Science" },
  { href: "/#company", label: "Company" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const home = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-lock", open);
    return () => document.body.classList.remove("menu-lock");
  }, [open]);

  const linkFor = (href: string) => (home ? href.replace("/", "") : href);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-40 h-16 border-b transition ${
        scrolled ? "border-[#F0E4E7] bg-white/80 backdrop-blur-md" : "border-transparent bg-white/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center gap-6 px-5">
        <Logo href={home ? "/#signal" : "/"} />
        <nav className="ml-auto hidden items-center gap-7 md:flex" aria-label="Page">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={linkFor(link.href)}
              className="text-sm font-medium text-[#101014] transition hover:text-[#FF1724]"
            >
              {link.label}
            </a>
          ))}
          <a
            href={home ? "#how" : "/#how"}
            className="inline-flex items-center rounded-full bg-[#FF1724] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,23,36,0.28)] transition hover:bg-[#D90016]"
          >
            Try VitaPulse
            <span aria-hidden className="ml-1">
              →
            </span>
          </a>
        </nav>
        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#F0E4E7] md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-[#F0E4E7] bg-white px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={linkFor(link.href)}
                className="rounded-xl px-3 py-3 text-base font-medium"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={home ? "#how" : "/#how"}
              className="mt-2 rounded-full bg-[#FF1724] px-4 py-3 text-center font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Try VitaPulse
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
