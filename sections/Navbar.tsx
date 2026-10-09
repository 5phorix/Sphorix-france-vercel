"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${
      scrolled
        ? "border-b border-slate-200/50 bg-white/95 shadow-lg shadow-blue-500/5 backdrop-blur-xl"
        : "border-b border-slate-200/30 bg-white/80 backdrop-blur-md"
    }`}>
      
   <div className="flex w-full items-center justify-between gap-2 px-4 py-2 sm:px-6 sm:py-3 lg:px-10 lg:py-4 xl:px-14">
        
        {/* LOGO */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="group flex min-w-0 shrink-0 items-center gap-3 py-1 text-left transition"
          aria-label="Sphorix France - Accueil"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-sm transition-all duration-300 group-hover:border-orange-400/60 group-hover:shadow-md sm:h-11 sm:w-11 md:h-12 md:w-12">
            <Image
              src="/logo/logo.png"
              alt="Logo Sphorix France"
              width={48}
              height={48}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>

          <div className="min-w-0">
            <span className="block text-lg font-bold leading-tight tracking-tight text-slate-950 sm:text-xl md:text-2xl">
              <span className="text-[#172b27]">Sphorix</span>{" "}
              <span className="text-[#df6a43]">France</span>
            </span>
          </div>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden flex-1 justify-center gap-6 md:flex">
          {[
            { label: "Nos solutions", href: "/services" },
            { label: "Notre vision", href: "/a-propos" },
            { label: "Méthode", href: "/methode" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative rounded-md px-3 py-2 font-medium text-[#34443b] transition hover:bg-[#eef3ed] hover:text-[#c85332] md:text-[18px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/contact#contact-form"
            className="hidden shrink-0 items-center gap-2 rounded-md bg-[#df6a43] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c85332] md:flex md:text-[18px]"
          >
            Parler de votre système
          </Link>
        </div>
        {/* MENU MOBILE */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-xl p-4 text-sm sm:p-6 md:hidden animate-fade-in-down">
          
        <div className="flex flex-col gap-4 sm:gap-5">
            {[
              { label: "Nos solutions", href: "/services" },
              { label: "Notre vision", href: "/a-propos" },
              { label: "Méthode", href: "/methode" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 font-medium text-[#34443b] transition hover:bg-[#eef3ed] hover:text-[#c85332]"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/contact#contact-form"
              onClick={() => setOpen(false)}
              className="rounded-md bg-[#df6a43] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#c85332] sm:px-5 sm:py-3"
            >
              Parler de votre système
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

