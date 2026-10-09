"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Database, Link2, ShieldCheck } from "lucide-react";

const principles = [
  {
    icon: Link2,
    title: "Votre existant reste en place",
    description: "Nous connectons les outils que vos équipes utilisent déjà.",
  },
  {
    icon: Database,
    title: "La donnée devient exploitable",
    description: "Les données deviennent des informations utiles pour suivre l’activité et décider.",
  },
  {
    icon: ShieldCheck,
    title: "Chaque étape reste traçable",
    description: "Les règles et les échanges sont conçus pour être vérifiables.",
  },
];

interface AboutProps {
  summary?: boolean;
}

export default function About({ summary = false }: AboutProps) {
  if (summary) {
    return (
      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="mb-4 text-xs font-bold uppercase text-[#c85332]">Notre vision</p>
            <h2 className="max-w-xl text-4xl font-semibold leading-tight text-[#17231f] sm:text-5xl">
              On ne remplace pas ce qui fonctionne. On le connecte.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#53625b] lg:text-[18px]">
              Sphorix relie vos logiciels, automatise les échanges et rend vos données plus utiles pour votre activité.
            </p>
            <Link href="/a-propos" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#355c4b] hover:text-[#c85332]">
              Découvrir notre vision
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="border-y border-[#dce3dc]">
            {principles.map(({ icon: Icon, title, description }) => (
              <div key={title} className="grid gap-3 border-b border-[#dce3dc] py-5 last:border-b-0 sm:grid-cols-[2.5rem_1fr] sm:gap-4">
                <Icon className="h-5 w-5 text-[#df6a43]" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-semibold text-[#17231f]">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#66756c] lg:text-[18px]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="sphorix" className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 text-xs font-bold uppercase text-[#c85332]">La vision Sphorix</p>
          <h2 className="max-w-xl text-4xl font-semibold leading-tight text-[#17231f] sm:text-5xl">
            On ne remplace pas ce qui fonctionne. On le connecte.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#53625b] sm:text-lg lg:text-[18px]">
            Les PME s’appuient déjà sur des plateformes, des logiciels métier et leur banque. Sphorix les connecte, automatise les processus entre ces outils et transforme les données en informations utiles à la décision.
          </p>
          <Link href="/services" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#355c4b] hover:text-[#c85332]">
            Comprendre l’architecture
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>

        <div className="border-y border-[#dce3dc]">
          {principles.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="grid gap-3 border-b border-[#dce3dc] py-5 last:border-b-0 sm:grid-cols-[2.5rem_1fr] sm:gap-4 sm:py-6"
            >
              <Icon className="h-5 w-5 text-[#df6a43]" aria-hidden="true" />
              <div>
                <h3 className="text-lg font-semibold text-[#17231f]">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#66756c] sm:text-base lg:text-[18px]">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}