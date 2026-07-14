"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Hero() {
  const expertisePoints = [
    "Visualisation claire des performances",
    "Outils numériques adaptés",
    "Accompagnement sur mesure",
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 px-4 pb-14 pt-20 text-white sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-32">
      {/* Animated background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "0s" }} />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,transparent_75%,transparent)] bg-[length:60px_60px] opacity-5" />
      
<div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-yellow-200/10 to-orange-500/20"></div>

      <div className="relative grid w-full items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10 xl:px-14">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="pt-6 overflow-hidden">
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
              <p className="mb-4 text-orange-300 uppercase tracking-[0.2em] text-lg font-bold">
                Pilotez votre entreprise avec des outils de gestion simples, des tableaux de bord clairs et une vision financière fiable.
              </p>
            </motion.div>
          </div>
          <h1 className="mb-4 text-[clamp(1.75rem,3vw,3.3rem)] font-extrabold leading-[1.08] sm:mb-5 lg:text-[clamp(2.3rem,4vw,3.8rem)]">
            Assistant de gestion & transformation digitale pour PME et indépendants en France
          </h1>

          <p className="mb-6 max-w-xl text-base text-slate-200 sm:text-lg lg:text-xl">
            Accompagnement sur mesure à Paris, Orléans, Vierzon et partout en France pour transformer vos chiffres en décisions.
          </p>

          <div className="mb-6">
            <h3 className="mb-3 text-base font-semibold sm:text-lg">Solutions proposées</h3>
            <ul className="space-y-2 text-slate-200">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 mt-1" />
                <span>Suivi de trésorerie</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 mt-1" />
                <span>Tableaux de bord Excel</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 mt-1" />
                <span>Analyse des revenus et des charges</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 mt-1" />
                <span>Suivi budgétaire</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 mt-1" />
                <span>Analyse de rentabilité</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 mt-1" />
                <span>Mise en place d’indicateurs de performance (KPI)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-400 mt-1" />
                <span>Aide à la prise de décision</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#services"
              className="w-full sm:w-auto rounded-full bg-orange-500 px-6 py-3 text-center font-semibold transition hover:bg-orange-600"
            >
              Découvrir nos services
            </a>

            <a
              href="#contact"
              className="w-full sm:w-auto rounded-full border border-white px-6 py-3 text-center font-semibold transition hover:bg-white hover:text-slate-900"
            >
              Nous contacter
            </a>
          </div>
        </motion.div>

        <div className="hidden justify-center md:flex">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-orange-500/20 via-blue-500/10 to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/20 text-lg text-orange-300">
                  ✦
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
                    Expertise digitale
                  </p>
                  <p className="text-sm text-slate-200">
                    Pilotage, automatisation, croissance
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {expertisePoints.map((point, index) => (
                  <motion.div
                    key={point}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/20 px-3 py-2"
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                    <span className="text-sm text-slate-100">{point}</span>
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