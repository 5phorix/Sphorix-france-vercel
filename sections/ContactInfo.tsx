"use client";

import { motion } from "framer-motion";

interface ContactInfoProps {
  onOpenForm: () => void;
}

export default function ContactInfo({ onOpenForm }: ContactInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col justify-center"
    >
      <p className="mb-3 font-semibold tracking-[0.2em] text-orange-400">
        CONTACT
      </p>

      <h2 className="mb-4 text-[clamp(1.75rem,2.6vw,2.8rem)] font-bold tracking-tight text-white">
        Échangeons sur vos besoins
      </h2>

      <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
        Vous souhaitez améliorer votre organisation, optimiser votre gestion
        ou faire évoluer vos outils numériques ? Échangeons sur vos objectifs
        et identifions ensemble les solutions adaptées à votre activité,
        partout en France, y compris à Paris, Orléans et Vierzon.
      </p>

      <div className="mb-8 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
        <div className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-5">
          <h3 className="mb-2 font-semibold text-white">
            Gestion & organisation
          </h3>

          <p className="leading-relaxed">
            Structuration des activités, amélioration des processus
            et optimisation des méthodes de travail.
          </p>
        </div>

        <div className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-5">
          <h3 className="mb-2 font-semibold text-white">
            Transformation digitale
          </h3>

          <p className="leading-relaxed">
            Intégration d’outils numériques pour simplifier
            et améliorer votre efficacité.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="#contact-form"
          onClick={(event) => {
            event.preventDefault();
            onOpenForm();
          }}
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          Prendre contact
        </a>

        <a
          href="https://wa.me/+33781525393"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-blue-800/70 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-orange-400 hover:text-orange-400"
        >
          Échanger sur WhatsApp
        </a>
      </div>
    </motion.div>
  );
}