"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Comprendre votre activité",
    description:
      "Chaque entreprise a ses propres enjeux. Nous analysons votre organisation, vos outils et vos objectifs afin d’identifier les priorités.",
    points: ["Analyse de vos besoins", "Identification des points d’amélioration", "Compréhension de vos processus actuels"],
  },
  {
    title: "Structurer votre organisation",
    description:
      "Nous vous aidons à mettre en place une organisation plus claire et des méthodes de travail plus efficaces.",
    points: ["Processus mieux définis", "Organisation administrative optimisée", "Meilleure gestion de l’information"],
  },
  {
    title: "Améliorer votre pilotage",
    description:
      "Nous mettons en place des outils simples pour suivre votre activité et prendre de meilleures décisions.",
    points: ["Tableaux de bord personnalisés", "Suivi des indicateurs clés (KPI)", "Aide au suivi financier et opérationnel"],
  },
  {
    title: "Simplifier vos outils",
    description:
      "Nous intégrons des outils numériques adaptés à vos besoins pour gagner en efficacité.",
    points: ["Digitalisation des tâches administratives", "Optimisation des outils de travail", "Automatisation des processus répétitifs"],
  },
];

const desktopCards = [
  { top: "5%", left: "7%", className: "translate-x-0" },
  { top: "9%", left: "94%", className: "-translate-x-full" },
  { top: "61%", left: "94%", className: "-translate-x-full" },
  { top: "57%", left: "7%", className: "translate-x-0" },
];

const desktopNodes = [
  { cx: 500, cy: 100 },
  { cx: 785, cy: 282 },
  { cx: 588, cy: 575 },
  { cx: 235, cy: 408 },
];

export default function Projects() {
  return (
    <section id="projects" className="bg-slate-100 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center sm:mb-14 lg:mb-16">
          <p className="mb-3 font-semibold tracking-widest text-orange-500">
            NOTRE APPROCHE
          </p>

          <h2 className="page-title">
            Des solutions pensées à partir de votre métier.
          </h2>

          <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Nous prenons le temps de comprendre votre fonctionnement afin de créer des outils simples, pertinents et réellement adaptés à votre quotidien.
          </p>
        </div>

        <div className="relative hidden rounded-[36px] border border-slate-200 bg-white p-10 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:block">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
            <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />
            <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
            <motion.div
              className="absolute left-[42%] top-[37%] h-60 w-60 rounded-full border border-blue-200/70"
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute left-[36%] top-[31%] h-80 w-80 rounded-full border border-orange-200/60"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="relative h-[780px]">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1000 780"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="approachSpiral" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.75" />
                </linearGradient>
              </defs>

              <motion.path
                d="M 500 95 C 655 125 760 185 800 280 C 850 395 760 530 610 585 C 455 645 265 610 185 485 C 125 390 160 285 250 225 C 315 180 390 165 465 170"
                fill="none"
                stroke="url(#approachSpiral)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray="14 18"
                initial={{ pathLength: 0, opacity: 0.35 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />

              <motion.path
                d="M 500 95 C 655 125 760 185 800 280 C 850 395 760 530 610 585 C 455 645 265 610 185 485 C 125 390 160 285 250 225 C 315 180 390 165 465 170"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1 20"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.9 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1.9, delay: 0.2, ease: "easeOut" }}
              />

              {desktopNodes.map((node, index) => (
                <g key={`node-${node.cx}-${node.cy}`}>
                  <motion.circle
                    cx={node.cx}
                    cy={node.cy}
                    r="18"
                    fill="#f97316"
                    fillOpacity="0.14"
                    initial={{ scale: 0.4, opacity: 0 }}
                    whileInView={{ scale: [0.6, 1.2, 0.9], opacity: [0, 0.8, 0.45] }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.8, delay: 0.35 + index * 0.14 }}
                  />
                  <motion.circle
                    cx={node.cx}
                    cy={node.cy}
                    r="8"
                    fill="#2563eb"
                    initial={{ scale: 0.2, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5, delay: 0.45 + index * 0.14 }}
                  />
                </g>
              ))}
            </svg>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="absolute left-1/2 top-1/2 z-10 w-56 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white/95 p-4 text-center shadow-lg"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">Système connecté</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Comprendre → Structurer → Améliorer → Simplifier</p>
            </motion.div>

            {steps.map((step, index) => {
              const cardPosition = desktopCards[index];
              const stepNumber = String(index + 1).padStart(2, "0");

              return (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0, y: 26, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, delay: index * 0.12 }}
                  whileHover={{ y: -8, scale: 1.02, zIndex: 60 }}
                  className={`absolute z-20 w-[330px] rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_50px_rgba(30,41,59,0.12)] backdrop-blur transition-shadow duration-300 hover:shadow-[0_26px_60px_rgba(30,41,59,0.2)] ${cardPosition.className}`}
                  style={{ top: cardPosition.top, left: cardPosition.left, zIndex: 20 + index }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <motion.span
                      animate={{ boxShadow: ["0 0 0 0 rgba(249,115,22,0.45)", "0 0 0 12px rgba(249,115,22,0)"] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.25 }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-blue-600 text-sm font-bold text-white shadow-md"
                    >
                      {stepNumber}
                    </motion.span>
                    <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  </div>

                  <p className="mb-4 text-sm leading-relaxed text-slate-600">{step.description}</p>

                  <ul className="space-y-2.5">
                    {step.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-700"
                      >
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="space-y-5 lg:hidden">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="relative rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="absolute left-[19px] top-12 h-[calc(100%-3.2rem)] w-px bg-gradient-to-b from-orange-300 via-orange-200 to-transparent" />

              <div className="mb-3 flex items-center gap-3">
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.9, repeat: Infinity, delay: index * 0.18 }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-blue-600 text-xs font-bold text-white"
                >
                  {String(index + 1).padStart(2, "0")}
                </motion.span>
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{step.title}</h3>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-slate-600 sm:text-base">
                {step.description}
              </p>

              <ul className="space-y-3">
                {step.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-slate-700">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mt-10 rounded-[32px] bg-slate-900 p-6 text-white shadow-lg sm:p-8 lg:p-10"
        >
          <h3 className="mb-3 text-2xl font-bold">Un parcours clair et progressif</h3>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Cette méthode en 4 étapes vous permet d avancer avec une vision structurée : comprendre, organiser, améliorer et simplifier. Chaque phase prépare la suivante pour construire un système plus fluide et plus performant.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="mt-8"
          >
            <a
              href="#contact-form"
              onClick={(event) => {
                event.preventDefault();
                window.dispatchEvent(new Event("open-contact-form"));
              }}
              className="inline-flex rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-400"
            >
              Discutons de votre projet
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
