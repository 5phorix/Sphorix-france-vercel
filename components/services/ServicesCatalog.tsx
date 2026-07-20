"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brush,
  Code2,
  FileText,
  MonitorSmartphone,
  SlidersHorizontal,
} from "lucide-react";

const servicePages = [
  {
    title: "Création de site internet",
    href: "/services/creation-site-internet",
    description:
      "Sites vitrine et pages de vente pensés pour être simples, rapides et lisibles.",
    icon: MonitorSmartphone,
    tone: "from-blue-500/15 to-cyan-500/10",
  },
  {
    title: "Design web et UI/UX",
    href: "/services/design-web-ui-ux",
    description:
      "Refonte visuelle, ergonomie et parcours utilisateur pour rendre l'usage plus fluide.",
    icon: Brush,
    tone: "from-orange-500/15 to-amber-500/10",
  },
  {
    title: "Applications web sur mesure",
    href: "/services/applications-web-sur-mesure",
    description:
      "Outils métier, automatisations et interfaces adaptées à vos besoins.",
    icon: Code2,
    tone: "from-slate-900/10 to-blue-500/10",
  },
  {
    title: "Organisation d'entreprise",
    href: "/services/gestion-entreprise",
    description:
      "Organisation administrative, priorités et méthodes de suivi pour gagner en clarté.",
    icon: FileText,
    tone: "from-emerald-500/15 to-teal-500/10",
  },
  {
    title: "Tableaux de bord et suivi",
    href: "/services/tableaux-de-bord-suivi-activite",
    description:
      "Indicateurs et lecture synthétique des chiffres pour suivre l'activité sans surcharge.",
    icon: BarChart3,
    tone: "from-violet-500/15 to-fuchsia-500/10",
  },
  {
    title: "Activités comptables",
    href: "/services/activites-comptables",
    description:
      "Préparation, organisation et suivi administratif comptable.",
    icon: SlidersHorizontal,
    tone: "from-slate-900/10 to-orange-500/10",
  },
];

export default function ServicesCatalog() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 px-4 py-14 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-950/10 via-orange-500/5 to-transparent" />
      <div className="absolute left-0 top-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute right-0 top-40 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl" />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
      >
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300"
            >
              Services Sphorix France
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Web, outils sur mesure, organisation et comptabilité
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="mt-4 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg"
            >
              Une offre structurée autour de quatre besoins: présence en ligne, outils adaptés, organisation interne et suivi comptable.
            </motion.p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {[
                ["6", "pages détaillées"],
                ["2", "familles d'offres"],
                ["1", "point d'entrée clair"],
              ].map(([value, label], index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="mt-1 text-sm text-slate-300">{label}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#contact-form"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Démarrer votre projet
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-900"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid gap-4 sm:grid-cols-2">
              {servicePages.map((service, index) => (
                <motion.article
                  key={service.href}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-xl"
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${service.tone} text-slate-900`}>
                    <service.icon className="h-6 w-6" />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">{service.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {service.description}
                  </p>

                  <Link
                    href={service.href}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-900 transition group-hover:text-orange-500"
                  >
                    Voir la page détaillée
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}