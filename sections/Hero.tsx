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
  const managementSolutions = [
    "Suivi de trésorerie",
    "Tableaux de bord Excel",
    "Analyse des revenus et des charges",
    "Suivi budgétaire",
    "Analyse de rentabilité",
    "Indicateurs de performance (KPI)",
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

  const handleOpenServices = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const servicesSection = document.getElementById("services");
    servicesSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleOpenContactForm = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    window.dispatchEvent(new Event("open-contact-form"));
    window.location.hash = "contact-form";
  };

  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 px-4 pb-16 pt-24 text-white sm:px-6 sm:pb-24 sm:pt-28 lg:min-h-screen lg:px-8 lg:pb-32 lg:pt-36">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-float" style={{ animationDelay: "0s" }} />
      <div className="pointer-events-none absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,transparent_75%,transparent)] bg-[length:60px_60px] opacity-5" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-900/20 via-yellow-200/10 to-orange-500/20" />

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

      <div className="relative mx-auto grid w-full max-w-[92rem] items-center gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:gap-14 xl:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-8 lg:p-12 xl:p-14"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_28%)]" />

          <div className="relative pt-1 sm:pt-2">
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
                  Nous concevons des solutions sur mesure qui répondent à vos besoins d'aujourd'hui et évoluent avec votre entreprise.
                </p>
              </motion.div>
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-extrabold leading-[1.1] sm:mb-5 sm:text-5xl lg:text-[clamp(2.6rem,4.6vw,4.6rem)]">
            Développez votre entreprise avec des solutions sur mesure.
          </h1>

          <p className="mb-7 max-w-2xl text-sm text-slate-200 sm:text-base lg:text-xl">
            Sites internet, outils de gestion personnalisés, design et automatisation pour simplifier votre activité au quotidien. Des solutions simples à Paris, Orléans, Vierzon et partout en France, pensées pour faire grandir votre entreprise.
          </p>

          <div className="mb-7 max-w-3xl">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200 sm:text-sm">
              Solutions proposées
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-900/35 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-orange-300">
                  Suivi d’activité
                </p>
                <ul className="space-y-2 text-slate-200">
                  {managementSolutions.map((solution) => (
                    <li key={solution} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                      <span className="text-sm leading-snug">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/35 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-orange-300">
                  Présence en ligne
                </p>
                <ul className="space-y-2 text-slate-200">
                  {webSolutions.map((solution) => (
                    <li key={solution} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                      <span className="text-sm leading-snug">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#services"
              onClick={handleOpenServices}
              className="w-full rounded-full bg-orange-500 px-6 py-3 text-center font-semibold transition hover:bg-orange-600 sm:w-auto"
            >
              Découvrir nos services
            </a>

            <a
              href="#contact-form"
              onClick={handleOpenContactForm}
              className="w-full rounded-full border border-white px-6 py-3 text-center font-semibold transition hover:bg-white hover:text-slate-900 sm:w-auto"
            >
              Nous contacter
            </a>
          </div>
        </motion.div>

        <div className="hidden justify-center lg:flex lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex w-full max-w-2xl items-center justify-center"
          >
            <div className="relative flex min-h-[28rem] items-center justify-center px-4 py-10 sm:px-8 lg:min-h-[36rem]">
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-96 w-96 xl:h-[30rem] xl:w-[30rem]"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-white/15"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-10 rounded-full border border-white/10"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-20 rounded-full border border-blue-300/20"
                />

                <motion.div
                  animate={{ scale: [1, 1.11, 1] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 shadow-[0_0_56px_rgba(251,146,60,0.38)]"
                />

                <motion.div
                  animate={{ x: [0, 14, 0], y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-[12%] top-[16%] h-20 w-20 rounded-full bg-cyan-300/80 blur-[1px] shadow-[0_0_34px_rgba(103,232,249,0.35)]"
                />
                <motion.div
                  animate={{ x: [0, -14, 0], y: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-[10%] top-[22%] h-16 w-16 rounded-full bg-orange-300/80 shadow-[0_0_30px_rgba(253,186,116,0.3)]"
                />
                <motion.div
                  animate={{ x: [0, 10, 0], y: [0, -12, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-[16%] left-[16%] h-18 w-18 rounded-full bg-emerald-300/80 shadow-[0_0_30px_rgba(110,231,183,0.3)]"
                />
                <motion.div
                  animate={{ x: [0, -10, 0], y: [0, 8, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-[12%] right-[16%] h-14 w-14 rounded-full bg-blue-300/80 shadow-[0_0_28px_rgba(147,197,253,0.3)]"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}