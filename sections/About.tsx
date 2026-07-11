"use client";

import { motion } from "framer-motion";

const expertiseCards = [
  {
    title: "Gestion financière",
    description: "Pilotage de trésorerie, bilan prévisionnel et maîtrise des marges.",
  },
  {
    title: "Tableaux de bord",
    description: "KPI personnalisés et reporting clair pour suivre l’essentiel.",
  },
  {
    title: "Transformation digitale",
    description: "Outils numériques adaptés, automatisation et performance opérationnelle.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="bg-slate-100 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 font-semibold text-orange-500">À PROPOS</p>

          <h2 className="page-title">Assistant de gestion pour PME et indépendants</h2>

          <p className="mb-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            Sphorix France aide les dirigeants à structurer leur gestion, maîtriser leur trésorerie et piloter leur activité avec des outils performants, que vous soyez à Paris, à Orléans, à Vierzon ou ailleurs en France.
          </p>

          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Nous intervenons sur le management financier, la digitalisation des processus et l’aide à la décision pour une gestion plus sereine, mieux contrôlée et plus performante.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl bg-slate-100 p-6 shadow-lg sm:rounded-3xl sm:p-8 lg:p-10"
        >
          
          <h3 className="mb-8 text-xl font-bold text-slate-900 sm:text-2xl">
            Domaines de compétences
          </h3>

          <div className="space-y-5">
            {expertiseCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <h4 className="mb-2 font-semibold text-slate-900">{card.title}</h4>
                <p className="text-slate-600">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}