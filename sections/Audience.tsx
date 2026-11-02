"use client";

import { motion } from "framer-motion";
import { Boxes, Hammer, Store } from "lucide-react";

const audiences = [
  {
    icon: Hammer,
    title: "Artisans",
    text: "Des matières, des produits finis et des pièces à organiser pour mieux produire et mieux vendre.",
  },
  {
    icon: Store,
    title: "Petites boutiques",
    text: "Des articles référencés, une activité suivie et des documents prêts pour votre cabinet.",
  },
  {
    icon: Boxes,
    title: "Commerces indépendants",
    text: "Une organisation claire et des indicateurs simples pour décider avec des chiffres.",
  },
];

export default function Audience() {
  return (
    <section
      className="bg-[#172b27] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="audience-title"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f08a66]">
          Pour qui
        </p>
        <h2
          id="audience-title"
          className="mt-3 max-w-3xl text-2xl font-semibold leading-snug text-white sm:text-3xl lg:text-4xl"
        >
          Organiser et améliorer la gestion de votre petite entreprise
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#d1ddd5]">
          Sphorix France accompagne les artisans, les petites boutiques et les
          commerces indépendants en France : diagnostic, organisation de vos
          données et outils adaptés à votre activité.
        </p>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {audiences.map(({ icon: Icon, title, text }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d7f280] text-[#172b27]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-[#d1ddd5]">{text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
