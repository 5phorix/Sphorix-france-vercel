"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function EInvoicing() {
  return (
    <section className="bg-white px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c85332]">
            Facturation électronique
          </p>
          <h2 className="mt-3 text-xl font-semibold leading-snug text-[#17231f] sm:text-2xl lg:text-3xl">
            Transformez vos factures en outils de pilotage.
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#53625b]">
            Classement, sauvegarde et archivage de vos factures électroniques.
            Exploitation de vos données d&apos;achat et de vente pour suivre vos
            dépenses, comprendre vos résultats et mieux anticiper vos besoins.
          </p>
          <p className="mt-6 max-w-3xl border-l-4 border-[#df6a43] pl-5 text-lg font-semibold italic leading-relaxed text-[#17231f]">
            Moins de temps consacré à l&apos;administratif, une meilleure
            visibilité sur votre activité et des décisions plus éclairées pour
            développer votre entreprise.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#d8e0d9] bg-[#f4f5f0] shadow-[0_20px_60px_rgba(23,43,39,0.12)]">
          <Image
            src="/accueil/facturation.webp"
            alt="Tableau de bord de suivi des factures : chiffre d'affaires, achats et résultat"
            width={1400}
            height={789}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="h-auto w-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
