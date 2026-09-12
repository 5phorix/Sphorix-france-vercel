"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import CartButton from "@/components/cart/CartButton";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleOpenContactForm = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent("open-contact-form"));
    setOpen(false);
  };

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
              <span className="text-blue-950">Sphorix</span>{" "}
              <span className="text-orange-500">France</span>
            </span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:block md:text-xs">
              Solutions digitales &amp; gestion
            </span>
          </div>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden flex-1 justify-center gap-6 md:flex">
          {[
            { label: "À propos", href: "/#about" },
            { label: "Nos Services", href: "/services" },
            { label: "La boutique", href: "/boutique" },
            { label: "Notre approche", href: "/#projects" },
            { label: "Contact", href: "/#contact" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-2 rounded-lg text-slate-700 font-medium transition-all duration-300 hover:text-orange-500 hover:bg-orange-50 relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-900 to-orange-500 rounded-full group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <CartButton />
          <Link
            href="/compte"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-700 lg:inline-flex"
          >
            Espace client
          </Link>
          <Link
            href="/demande-devis"
            className="hidden shrink-0 items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-800 hover:shadow-lg whitespace-nowrap md:flex"
          >
            Demander un devis
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
              { label: "À propos", href: "/#about" },
              { label: "Nos Services", href: "/services" },
              { label: "La boutique", href: "/boutique" },
              { label: "Notre approche", href: "/#projects" },
              { label: "Contact", href: "/#contact" },
              { label: "Espace client", href: "/compte" },
              { label: "Demander un devis", href: "/demande-devis" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-900 font-medium transition-all duration-300 hover:text-orange-500 hover:bg-orange-50"
              >
                {item.label}
              </Link>
            ))}

            <a
              href="#contact-form"
              onClick={handleOpenContactForm}
              className="rounded-full bg-gradient-to-r from-blue-900 to-orange-500 px-4 py-2 text-center text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg sm:px-5 sm:py-3"
            >
              Consultation
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

