"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, BarChart3, Globe2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const signals = [
  { icon: BarChart3, label: "Suivi d’activité", value: "Décider" },
  { icon: Sparkles, label: "Outils simples", value: "Avancer" },
  { icon: Globe2, label: "Présence en ligne", value: "Développer" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f4f0e9] px-4 pb-14 pt-28 text-slate-950 sm:px-6 sm:pb-20 sm:pt-36 lg:px-8 lg:pb-24 lg:pt-44">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.72),transparent_40%,rgba(249,115,22,0.08))]" />
      <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full border border-orange-300/50 sm:h-[28rem] sm:w-[28rem]" />
      <div className="pointer-events-none absolute -right-10 top-34 h-56 w-56 rounded-full border border-blue-300/50 sm:h-80 sm:w-80" />

      <div className="relative mx-auto grid max-w-7xl items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-4 text-xl font-extrabold uppercase tracking-tight text-orange-600 sm:text-2xl lg:text-3xl"
          >
            Outils numériques &amp; gestion financière sur mesure
          </motion.h2>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06 }}
            className="max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-8xl"
          >
            Vos données deviennent des décisions plus claires.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-7 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg lg:text-xl"
          >
            Sphorix conçoit des outils numériques, tableaux de bord et applications de gestion sur mesure pour les artisans et les PME.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-900"
            >
              Découvrir les services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#boutique"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/70 px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:border-orange-400 hover:text-orange-700"
            >
              Explorer les outils
            </Link>
          </motion.div>

          <div className="mt-12 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <ArrowDown className="h-4 w-4 text-orange-500" aria-hidden="true" />
            Une expertise de gestion, des outils réellement adaptés
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="relative min-h-[23rem] overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_26px_80px_rgba(15,23,42,0.18)] sm:p-8 lg:min-h-[30rem] lg:p-10"
        >
          <div className="absolute right-[-4rem] top-[-4rem] h-56 w-56 rounded-full border border-orange-400/30" />
          <div className="absolute bottom-[-5rem] left-[-3rem] h-48 w-48 rounded-full border border-blue-400/25" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">L’expertise Sphorix</p>
              <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                Structurer, mesurer et mieux comprendre votre activité.
              </h2>
            </div>

            <div className="mt-10 space-y-3">
              {signals.map(({ icon: Icon, label, value }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 + index * 0.1 }}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3"
                >
                  <span className="flex items-center gap-3 text-sm text-slate-300">
                    <Icon className="h-4 w-4 text-orange-300" aria-hidden="true" />
                    {label}
                  </span>
                  <span className="text-sm font-semibold text-white">{value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
