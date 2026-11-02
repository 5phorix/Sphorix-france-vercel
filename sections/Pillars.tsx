"use client";

import { motion } from "framer-motion";
import { Boxes, Gauge, TrendingUp } from "lucide-react";

const pillars = [
  {
    headline: "Maîtrisez vos stocks.",
    icon: Boxes,
    title: "Organiser",
    text: "Structurer les produits, référencer les articles et fiabiliser les stocks.",
  },
  {
    headline: "Pilotez votre commerce.",
    icon: Gauge,
    title: "Piloter",
    text: "Suivre les mouvements, identifier les écarts et mieux comprendre son activité.",
  },
  {
    headline: "Développez votre activité.",
    icon: TrendingUp,
    title: "Développer",
    text: "Prendre de meilleures décisions et consacrer plus de temps à la croissance de son commerce.",
  },
];

export default function Pillars() {
  return (
    <section className="bg-[#f4f5f0] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map(({ headline, icon: Icon, title, text }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col"
            >
              <h2 className="mb-4 text-xl font-semibold leading-snug text-[#17231f] sm:text-2xl">{headline}</h2>
              <div className="flex-1 rounded-2xl border border-[#e0e6e0] bg-white p-6 sm:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#172b27] text-[#d7f280]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-2xl font-semibold uppercase tracking-wide text-[#17231f]">{title}</h3>
                <p className="mt-3 text-base leading-relaxed text-[#53625b]">{text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
