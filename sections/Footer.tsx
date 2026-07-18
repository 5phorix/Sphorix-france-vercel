"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const quickLinks = [
  { label: "Nos services", href: "#services" },
  { label: "Gestion d'entreprise", href: "/services/gestion-entreprise" },
  { label: "Tableaux de bord et suivi d'activité", href: "/services/tableaux-de-bord-suivi-activite" },
  { label: "Activités comptables", href: "/services/activites-comptables" },
  { label: "Services web", href: "/services" },
  { label: "Création site internet", href: "/services/creation-site-internet" },
  { label: "Design web", href: "/services/design-web-ui-ux" },
  { label: "Notre approche", href: "#projects" },
  { label: "À propos", href: "#about" },
  { label: "Prendre contact", href: "#contact" },
];

const contactLinks = [
  { label: "contact@sphorix.fr", href: "mailto:contact@sphorix.fr" },
  { label: "WhatsApp", href: "https://wa.me/+33781525393", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sphorix?utm_source=share_via&utm_content=profile&utm_medium=member_android", external: true },
];

const activityHighlights = [
  "Saisie de factures",
  "Déclaration TVA",
  "Calcul des coûts",
  "Conception de site web",
  "Tableaux de bord",
  "Suivi d'activité",
  "Facturation",
  "Relance client",
  "Organisation comptable",
  "Rapprochements bancaires",
  "Comptabilité fournisseurs",
  "Comptabilité clients",
  "Gestion des KPI",
  "Suivi de trésorerie",
];

export default function Footer() {
  const openCookiePreferences = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    window.dispatchEvent(new Event("open-cookie-preferences"));
  };

  return (
    <footer className="border-t border-blue-900/40 bg-blue-950 px-4 py-10 text-white sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="flex w-full flex-col gap-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45 }}
            className="max-w-xl"
          >
            <div className="mb-5 flex items-center">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-100/95 p-2 shadow-sm sm:h-14 sm:w-14 lg:h-16 lg:w-16">
                <Image
                  src="/logo/logo.png"
                  alt="Sphorix France"
                  fill
                  sizes="(max-width: 640px) 48px, (max-width: 1024px) 56px, 64px"
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

            <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {activityHighlights.map((activity) => (
                <div
                  key={activity}
                  className="flex items-start gap-2 text-sm leading-relaxed text-slate-200"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                  <span>{activity}</span>
                </div>
              ))}
            </div>
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
            <a href="/politique-confidentialite" className="transition hover:text-orange-400">
              Politique de confidentialité
            </a>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="transition hover:text-orange-400"
            >
              Paramétrer les cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}