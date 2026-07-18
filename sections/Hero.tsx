"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

function getParisDateTime(now: Date) {
  const time = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const compactTime = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const date = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);

  return { time, compactTime, date };
}

export default function Hero() {
  const expertisePoints = [
    "Visualisation claire des performances",
    "Outils numériques adaptés",
    "Accompagnement sur mesure",
  ];
  const managementSolutions = [
    "Suivi de trésorerie",
    "Tableaux de bord Excel",
    "Analyse des revenus et des charges",
    "Suivi budgétaire",
    "Analyse de rentabilité",
    "Mise en place d’indicateurs de performance (KPI)",
    "Aide à la prise de décision",
  ];
  const webSolutions = [
    "Création de site web vitrine",
    "Refonte design web & UI/UX",
    "Applications web sur mesure",
    "Pages de conversion optimisées",
    "Optimisation SEO technique",
    "Automatisations métier",
  ];
  const [parisNow, setParisNow] = useState({
    time: "--:--:--",
    compactTime: "--:--",
    date: "",
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setParisNow(getParisDateTime(new Date()));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 px-4 pb-14 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-32">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "0s" }} />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,transparent_75%,transparent)] bg-[length:60px_60px] opacity-5" />

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-yellow-200/10 to-orange-500/20" />

        <div className="pointer-events-none fixed right-3 top-20 z-[80] sm:right-5 sm:top-24 lg:right-8 lg:top-28">
        <div className="rounded-2xl border border-white/20 bg-slate-950/55 px-3 py-2 text-right shadow-lg backdrop-blur-md sm:px-4 sm:py-2.5">
          <div className="flex items-center justify-end gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-orange-300" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-300 sm:text-xs">
              Heure de Paris
            </p>
          </div>
          <p className="text-base font-bold leading-tight text-white sm:text-lg">
            <span className="sm:hidden">{parisNow.compactTime}</span>
            <span className="hidden sm:inline">{parisNow.time}</span>
          </p>
          <p className="text-[11px] capitalize text-slate-200 sm:text-xs">
            {parisNow.date || "France"}
          </p>
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="pt-4 sm:pt-6">
            <div className="mt-3 hidden overflow-hidden sm:block lg:mt-6">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: "-100%" }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="whitespace-nowrap"
              >
                <p className="mb-4 text-base font-bold uppercase tracking-[0.18em] text-orange-300 lg:text-lg">
                  Gérez votre entreprise avec des outils simples, des tableaux de bord clairs et une vision financière fiable.
                </p>
              </motion.div>
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-extrabold leading-[1.1] sm:mb-5 sm:text-5xl lg:text-[clamp(2.3rem,4vw,3.8rem)]">
            Assistant de gestion & transformation digitale pour PME et indépendants en France
          </h1>

          <p className="mb-6 max-w-xl text-sm text-slate-200 sm:text-base lg:text-xl">
            Accompagnement sur mesure à Paris, Orléans, Vierzon et partout en France pour transformer vos chiffres en décisions.
          </p>

          <div className="mb-6 max-w-3xl">
            <h3 className="mb-3 text-base font-semibold sm:text-lg">Solutions proposées</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/25 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-orange-300">
                  Gestion & pilotage
                </p>
                <ul className="space-y-2 text-slate-200">
                  {managementSolutions.map((solution) => (
                    <li key={solution} className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-orange-400" />
                      <span className="text-sm">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/25 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-orange-300">
                  Solutions web
                </p>
                <ul className="space-y-2 text-slate-200">
                  {webSolutions.map((solution) => (
                    <li key={solution} className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-orange-400" />
                      <span className="text-sm">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#services"
              className="w-full rounded-full bg-orange-500 px-6 py-3 text-center font-semibold transition hover:bg-orange-600 sm:w-auto"
            >
              Découvrir nos services
            </a>

            <a
              href="#contact"
              className="w-full rounded-full border border-white px-6 py-3 text-center font-semibold transition hover:bg-white hover:text-slate-900 sm:w-auto"
            >
              Nous contacter
            </a>
          </div>
        </motion.div>

        <div className="hidden justify-center sm:flex lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-md"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-500/30 via-blue-500/10 to-transparent blur-3xl" />
            <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-white/25 via-white/5 to-transparent" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-white/15 via-white/10 to-white/5 p-7 shadow-2xl backdrop-blur-xl">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-orange-400/10 blur-2xl" />

              <div className="relative mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-300/25 bg-orange-500/20 text-lg text-orange-300">
                  ✦
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
                      Expertise digitale
                    </p>
                    <p className="text-sm text-slate-200">
                      Gestion, automatisation, croissance
                    </p>
                  </div>
                </div>

                <div className="rounded-full border border-white/15 bg-slate-900/35 px-3 py-1 text-xs font-semibold text-slate-200">
                  3 axes
                </div>
              </div>

              <div className="mb-4 h-px w-full bg-gradient-to-r from-white/25 via-white/10 to-transparent" />

              <div className="space-y-2.5">
                {expertisePoints.map((point, index) => (
                  <motion.div
                    key={point}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/25 px-3 py-2.5 transition hover:border-orange-300/40 hover:bg-slate-900/35"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.65)]" />
                    <span className="text-sm font-medium text-slate-100">{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}