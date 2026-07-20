"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const expertiseCards = [
  {
    title: "Suivi financier",
    description: "Trésorerie, vision prévisionnelle et lecture des marges.",
  },
  {
    title: "Tableaux de bord",
    description: "Indicateurs personnalisés et reporting clair pour suivre l’essentiel.",
  },
  {
    title: "Outils numériques",
    description: "Automatisation et organisation plus fluide au quotidien.",
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

          <h2 className="page-title">Solutions pour mieux structurer votre activité</h2>

          <p className="mb-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            Sphorix France aide les dirigeants à structurer leur organisation, clarifier leur trésorerie et suivre leur activité avec des outils simples, que vous soyez à Paris, à Orléans, à Vierzon ou ailleurs en France.
          </p>

          <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
            Nous intervenons sur le suivi financier, l'organisation et les outils numériques pour une activité plus lisible et plus fluide.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
          className="rounded-2xl bg-slate-100 p-4 shadow-lg sm:rounded-3xl sm:p-5 lg:p-6"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white">
            <Image
              src="/photos/2.png"
              alt="Doua Konate en tenue professionnelle"
              fill
              sizes="(max-width: 640px) 100vw, 420px"
              className="object-contain p-3"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, delay: 0.16 }}
          className="mt-6 rounded-2xl bg-slate-100 p-6 shadow-lg sm:rounded-3xl sm:p-8 lg:p-10"
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