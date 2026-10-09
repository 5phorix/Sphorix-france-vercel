"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Banknote,
  Boxes,
  FileSpreadsheet,
  Landmark,
} from "lucide-react";
import { motion } from "framer-motion";

const sources = [
  { icon: Boxes, label: "Plateforme A" },
  { icon: Boxes, label: "Plateforme B" },
  { icon: FileSpreadsheet, label: "Logiciel comptable" },
  { icon: Landmark, label: "Banque" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#eef3ed] px-4 pb-16 pt-28 text-[#17231f] sm:px-6 sm:pb-20 sm:pt-36 lg:px-8 lg:pb-24 lg:pt-40">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] bg-[linear-gradient(rgba(23,35,31,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(23,35,31,0.035)_1px,transparent_1px)] bg-[size:36px_36px] lg:block" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-5 flex items-center gap-3 text-sm font-semibold text-[#355c4b]"
          >
            <span className="h-px w-8 bg-[#df6a43]" aria-hidden="true" />
            Systèmes numériques pour PME
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="max-w-2xl text-3xl font-semibold leading-[1.04] text-[#17231f] sm:text-4xl lg:text-5xl"
          >
            <span className="block">Connectez vos outils.</span>
            <span className="block text-[#355c4b]">Décidez sereinement.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-7 max-w-xl text-base leading-relaxed text-[#53625b] sm:text-lg lg:text-[19px]"
          >
            Nous concevons des applications qui connectent vos outils, automatisent vos processus et transforment vos données en informations utiles pour piloter votre activité et prendre de meilleures décisions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="#solutions"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#df6a43] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#c85332] lg:text-[15px]"
            >
              Voir nos solutions
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center rounded-md border border-[#bdc9be] bg-white/60 px-5 py-3.5 text-sm font-semibold text-[#26382f] transition hover:border-[#355c4b] lg:text-[15px]"
            >
              Parler de votre projet
            </Link>
          </motion.div>

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold uppercase text-[#607168]">
            <span>API</span>
            <span className="h-1 w-1 rounded-full bg-[#df6a43]" />
            <span>Webhooks</span>
            <span className="h-1 w-1 rounded-full bg-[#df6a43]" />
            <span>Imports de fichiers</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="relative mx-auto w-full max-w-xl rounded-xl bg-[#172b27] p-5 text-white shadow-[0_28px_80px_rgba(23,43,39,0.18)] sm:p-7"
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase text-[#b9c9bd]">Architecture Sphorix</p>
              <p className="mt-1 text-sm font-semibold">De vos outils à des décisions mieux éclairées</p>
            </div>
            <Banknote className="h-5 w-5 shrink-0 text-[#d7f280]" aria-hidden="true" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {sources.map(({ icon: Icon, label }) => (
              <div key={label} className="flex min-h-12 items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-[#e1e9e1] sm:text-sm lg:text-[15px]">
                <Icon className="h-4 w-4 shrink-0 text-[#d7f280]" aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="relative ml-5 h-8 border-l border-dashed border-[#94aa9d]">
            <ArrowDown className="absolute -bottom-1 -left-[9px] h-4 w-4 text-[#d7f280]" aria-hidden="true" />
          </div>

          <div className="rounded-md border border-[#61766a] bg-[#223a34] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase text-[#b9c9bd]">Sphorix Connect</p>
            <p className="mt-1 text-sm font-medium lg:text-[15px]">API · Webhooks · Imports</p>
          </div>

          <div className="relative ml-5 h-8 border-l border-dashed border-[#94aa9d]">
            <ArrowDown className="absolute -bottom-1 -left-[9px] h-4 w-4 text-[#d7f280]" aria-hidden="true" />
          </div>

          <div className="rounded-md bg-[#d7f280] px-4 py-3 text-[#172b27]">
            <p className="text-[10px] font-bold uppercase">Moteur commun de données</p>
            <p className="mt-1 text-sm font-semibold">Normaliser · Contrôler · Tracer</p>
          </div>

          <div className="relative ml-5 h-8 border-l border-dashed border-[#94aa9d]">
            <ArrowDown className="absolute -bottom-1 -left-[9px] h-4 w-4 text-[#d7f280]" aria-hidden="true" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white px-4 py-3 text-[#172b27]">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#607168]">Sadesk Compta</p>
              <p className="mt-1 text-sm font-semibold lg:text-[15px]">Importer · Facturer · Comptabiliser · Suivre</p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#df6a43]" aria-hidden="true" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}