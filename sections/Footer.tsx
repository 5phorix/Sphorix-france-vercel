"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const quickLinks = [
  { label: "Nos services", href: "#services" },
  { label: "Notre approche", href: "#projects" },
  { label: "À propos", href: "#about" },
  { label: "Prendre contact", href: "#contact" },
];

const contactLinks = [
  { label: "contact@sphorixfrance.fr", href: "mailto:contact@sphorixfrance.fr" },
  { label: "WhatsApp", href: "https://wa.me/+33781525393", external: true },
  { label: "LinkedIn", href: "#", external: true },
];

export default function Footer() {
  return (
    <footer className="border-t border-blue-900/40 bg-blue-950 px-4 py-10 text-white sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="max-w-xl"
          >
            <div className="mb-5 flex items-center">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-100/95 p-2 shadow-sm sm:h-16 sm:w-16 lg:h-20 lg:w-20">
                <Image
                  src="/logo/logo.png"
                  alt="Sphorix France"
                  fill
                  className="object-contain grayscale brightness-95 contrast-105"
                  priority
                />
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Assistant de gestion & transformation digitale
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
              Nous accompagnons les PME et indépendants à Paris, Orléans, Vierzon et partout en France pour structurer leur gestion, clarifier leurs indicateurs et améliorer leur efficacité avec des solutions simples, fiables et concrètes.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Prendre contact
              </a>
              <a
                href="#services"
                className="rounded-full border border-blue-800 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-orange-400 hover:text-orange-400"
              >
                Voir les services
              </a>
            </div>
          </motion.div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Navigation
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition hover:text-orange-400">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="transition hover:text-orange-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Zone d’intervention
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Accompagnement sur mesure pour les PME et indépendants en France.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-blue-900/50 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-400">
            © 2026 Sphorix France — Tous droits réservés.
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <a
              href="#contact-form"
              onClick={(event) => {
                event.preventDefault();
                window.dispatchEvent(new Event("open-contact-form"));
              }}
              className="transition hover:text-orange-400"
            >
              Planifier un échange
            </a>
            <a href="#services" className="transition hover:text-orange-400">
              Services
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}