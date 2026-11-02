"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

const series = [42, 55, 48, 63, 58, 72, 68, 81, 77, 90, 86, 96, 64, 70, 84, 61, 92, 78, 88, 99, 73, 82, 94, 87];

const products = [
  { name: "Café en grains 1 kg", start: 82, step: 3 },
  { name: "Huile d'olive 75 cl", start: 58, step: 5 },
  { name: "Pâtes artisanales 500 g", start: 34, step: 7 },
];

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");

function levelState(level: number) {
  if (level > 50) return "bg-[#7fb89a]";
  if (level > 25) return "bg-[#e0b04a]";
  return "bg-[#df6a43]";
}

export default function Hero() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((t) => t + 1), 1800);
    return () => window.clearInterval(timer);
  }, []);

  const sales = Array.from({ length: 12 }, (_, i) => series[(tick + i) % series.length]);
  const kpis = [
    { label: "Valeur du stock", value: `${fmt(18450 - (tick % 9) * 85)} €`, trend: "Valorisé au coût d'achat" },
    { label: "Références comptées", value: fmt(412 + (tick % 12) * 3), trend: "Inventaire en cours" },
    { label: "Écarts repérés", value: fmt(3 + (tick % 5)), trend: "À vérifier" },
  ];
  const stock = products.map((p) => ({
    name: p.name,
    // le niveau baisse à chaque vente puis remonte au réapprovisionnement
    level: Math.max(8, 100 - ((100 - p.start + tick * p.step) % 92)),
  }));

  return (
    <section className="relative overflow-hidden bg-[#10201d] px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8 lg:pb-28 lg:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[#df6a43]/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
            Une gestion <span className="text-[#d7f280]">plus claire</span>
            <span className="mt-3 block text-2xl font-medium tracking-normal text-[#e4ece7] sm:text-3xl">
              pour les petits commerces et indépendants
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-xl font-semibold leading-snug text-white">
            Combien de produits avez-vous réellement en stock ? Quels produits vous rapportent le plus ?
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#b9c9c0] sm:text-lg">
            Nous prenons en charge le référencement de vos produits, vos inventaires et le suivi de vos stocks. Nous analysons vos données pour vous aider à mieux gérer votre activité, prendre les bonnes décisions et saisir de nouvelles opportunités.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact#contact-form"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#df6a43] px-6 py-3.5 font-semibold text-white transition hover:bg-[#ee8059]"
            >
              Nous contacter
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/methode"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/25 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              <PlayCircle className="h-5 w-5" aria-hidden="true" />
              Voir la démo
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="rounded-2xl border border-white/10 bg-[#f7f8f4] p-4 text-[#17231f] shadow-[0_40px_80px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex items-center justify-between border-b border-[#e0e6e0] pb-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#df6a43]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#e0b04a]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#7fb89a]" />
              </div>
              <p className="flex items-center gap-2 text-xs font-semibold text-[#66756c]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2f7a55] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2f7a55]" />
                </span>
                Tableau de bord
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-[#e0e6e0] bg-white p-3">
                  <p className="text-[11px] text-[#66756c] sm:text-xs">{kpi.label}</p>
                  <motion.p
                    key={kpi.value}
                    initial={{ opacity: 0.3, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-1 text-lg font-semibold tabular-nums sm:text-2xl"
                  >
                    {kpi.value}
                  </motion.p>
                  <p className="text-xs font-semibold text-[#2f7a55]">{kpi.trend}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_1fr]">
              <div className="rounded-lg border border-[#e0e6e0] bg-white p-4">
                <p className="text-xs font-semibold text-[#66756c]">Mouvements de stock (12 semaines)</p>
                <div className="mt-4 flex h-32 items-end gap-1.5">
                  {sales.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.8, delay: tick === 0 ? 0.4 + i * 0.05 : 0 }}
                      className={`flex-1 rounded-t ${i === sales.length - 1 ? "bg-[#df6a43]" : "bg-[#355c4b]"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#e0e6e0] bg-white p-4">
                <p className="text-xs font-semibold text-[#66756c]">Niveaux de stock</p>
                <ul className="mt-4 space-y-3">
                  {stock.map((item) => (
                    <li key={item.name}>
                      <div className="flex justify-between text-xs">
                        <span>{item.name}</span>
                        <span className="font-semibold tabular-nums">{item.level} %</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-[#e8eee8]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.level}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full transition-colors duration-700 ${levelState(item.level)}`}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
