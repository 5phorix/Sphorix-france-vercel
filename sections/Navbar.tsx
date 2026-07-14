"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

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
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 group cursor-pointer shrink-0 pr-2 sm:pr-3 lg:pr-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-orange-500 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
            <div className="logo-highlight">
              <div className="logo-inner">
                <Image
                  src="/logo/logo.png"
                  alt="Sphorix France"
                  width={48}
                  height={48}
                  className="relative rounded-md transition-transform duration-300 hover:scale-110 sm:h-[52px] sm:w-[52px] md:h-[64px] md:w-[64px]"
                />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-[0.95rem] font-extrabold tracking-tight text-slate-900 sm:text-xl md:text-2xl lg:text-3xl">
              <span className="text-blue-900">Sphorix</span>{" "}
              <span className="text-orange-500">France</span>
            </h1>
            <p className="hidden max-w-[22rem] text-sm font-medium text-slate-500 sm:block md:text-base">
              Assistant de gestion & Transformation digitale des PME et indépendants
            </p>
          </div>
        </div>

        {/* MENU DESKTOP */}
        <nav className="hidden flex-1 justify-center gap-6 md:flex">
          {[
            { label: "À propos", href: "#about" },
            { label: "Nos Services", href: "#services" },
            { label: "Notre Approche", href: "#projects" },
            { label: "Contact", href: "#contact" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-4 py-2 rounded-lg text-slate-700 font-medium transition-all duration-300 hover:text-orange-500 hover:bg-orange-50 relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-900 to-orange-500 rounded-full group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="/demande-devis"
          className="hidden shrink-0 md:flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-800 hover:shadow-lg whitespace-nowrap"
        >
          Demander un devis
        </a>
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
              { label: "À propos", href: "#about" },
              { label: "Nos Services", href: "#services" },
              { label: "Notre Approche", href: "#projects" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-900 font-medium transition-all duration-300 hover:text-orange-500 hover:bg-orange-50"
              >
                {item.label}
              </a>
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

