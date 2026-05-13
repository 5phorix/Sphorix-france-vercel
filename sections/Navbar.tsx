"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo/logo.png"
            alt="Sphorix France"
            width={42}
            height={42}
            className="rounded-lg transition hover:scale-105"
          />

          <h1 className="text-2xl font-bold text-slate-900">
            Sphorix
            <span className="text-orange-500"> France</span>
          </h1>
        </div>

        {/* MENU DESKTOP */}
        <nav className="hidden gap-8 md:flex">
          <a href="#about" className="transition hover:text-orange-500">
            À propos
          </a>

          <a href="#services" className="transition hover:text-orange-500">
            Services
          </a>

          <a href="#projects" className="transition hover:text-orange-500">
            Projets
          </a>

          <a href="#contact" className="transition hover:text-orange-500">
            Contact
          </a>
        </nav>

        {/* CTA */}
        <a
          href="#contact"
          className="hidden rounded-full bg-orange-500 px-5 py-2 text-white transition hover:bg-orange-600 md:block"
        >
          Consultation
        </a>

        {/* MENU MOBILE */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-slate-200 bg-white p-6 md:hidden">
          
          <div className="flex flex-col gap-5">
            
            <a href="#about" onClick={() => setOpen(false)}>
              À propos
            </a>

            <a href="#services" onClick={() => setOpen(false)}>
              Services
            </a>

            <a href="#projects" onClick={() => setOpen(false)}>
              Projets
            </a>

            <a href="#contact" onClick={() => setOpen(false)}>
              Contact
            </a>

            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="rounded-full bg-orange-500 px-5 py-3 text-center text-white transition hover:bg-orange-600"
            >
              Consultation
            </a>
          </div>
        </div>
      )}
    </header>
  );
}