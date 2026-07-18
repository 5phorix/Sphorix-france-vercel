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
      "Nous mettons en place des outils simples pour vous permettre de suivre votre activité et prendre de meilleures décisions.",
    points: ["Tableaux de bord personnalisés", "Suivi des indicateurs clés (KPI)", "Aide au suivi financier et opérationnel"],
  },
  {
    title: "Accélérer votre transformation digitale",
    description:
      "Nous vous accompagnons dans l’intégration d’outils numériques adaptés à vos besoins pour gagner en efficacité.",
    points: ["Digitalisation des tâches administratives", "Optimisation des outils de travail", "Automatisation des processus répétitifs"],
  },
];

const domains = [
  {
    title: "Gestion & organisation",
    description: "Structuration administrative et amélioration des méthodes de travail.",
  },
  {
    title: "Finance & pilotage",
    description: "Suivi des indicateurs, tableaux de bord et aide à la décision.",
  },
  {
    title: "Transformation digitale",
    description: "Solutions numériques pour simplifier et optimiser votre activité.",
  },
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
            Un accompagnement adapté pour structurer et optimiser votre activité.
          </h2>

          <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Nous plaçons l&apos;écoute et l&apos;analyse au cœur de notre démarche afin de proposer des solutions adaptées à chaque organisation.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7 lg:p-8"
            >
              <h3 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                {step.title}
              </h3>

              <p className="mb-5 text-sm leading-relaxed text-slate-600 sm:text-base">
                {step.description}
              </p>

              <ul className="space-y-3">
                {step.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="flex items-start gap-3 text-slate-700">
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
          <h3 className="mb-6 text-2xl font-bold">
            Nos domaines d’intervention
          </h3>

          <div className="grid gap-5 md:grid-cols-3">
            {domains.map((domain, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5"
              >
                <h4 className="mb-2 font-semibold text-white">
                  {domain.title}
                </h4>
                <p className="text-sm leading-relaxed text-slate-300">
                  {domain.description}
                </p>
              </motion.div>
            ))}
          </div>

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
