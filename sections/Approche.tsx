"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AppWindow, ArrowRight, Cable, Search, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Comprendre l’existant",
    summary: "Vos outils, leurs échanges et les points de friction.",
    description: "Cartographier vos logiciels, vos échanges de données et les points de friction du quotidien.",
    icon: Search,
    tone: "bg-[#e8eee8] text-[#355c4b]",
  },
  {
    number: "02",
    title: "Connecter et automatiser",
    summary: "Les flux utiles et les règles adaptées à votre organisation.",
    description: "Relier les outils et automatiser les processus récurrents avec les règles et contrôles adaptés.",
    icon: Cable,
    tone: "bg-[#f8e4d9] text-[#a7492e]",
  },
  {
    number: "03",
    title: "Construire votre application",
    summary: "Vos opérations clés réunies dans un outil lisible.",
    description: "Transformer dépenses, factures et échéances en informations claires pour suivre l’activité et décider.",
    icon: AppWindow,
    tone: "bg-[#e5f1bd] text-[#425521]",
  },
  {
    number: "04",
    title: "Faire évoluer le système",
    summary: "De nouveaux outils et indicateurs selon vos priorités.",
    description: "Ajouter de nouveaux outils et indicateurs au rythme de vos besoins.",
    icon: TrendingUp,
    tone: "bg-[#dce8ed] text-[#396272]",
  },
];

interface ProjectsProps {
  summary?: boolean;
}

export default function Projects({ summary = false }: ProjectsProps) {
  if (summary) {
    return (
      <section className="bg-[#f4f5f0] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="mb-4 text-xs font-bold uppercase text-[#c85332]">La méthode</p>
              <h2 className="max-w-2xl text-4xl font-semibold leading-tight text-[#17231f] sm:text-5xl">
                Un projet clair, de vos outils à vos décisions.
              </h2>
            </div>
            <Link href="/methode" className="inline-flex items-center gap-2 text-sm font-semibold text-[#355c4b] hover:text-[#c85332]">
              Voir notre méthode
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.number} className="border-t border-[#cbd6cc] py-4">
                <p className="text-xs font-bold text-[#df6a43]">{step.number}</p>
                <h3 className="mt-3 text-lg font-semibold text-[#17231f]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#66756c] lg:text-[18px]">{step.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="approche" className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-bold uppercase text-[#c85332]">Notre méthode</p>
            <h2 className="max-w-2xl text-4xl font-semibold leading-tight text-[#17231f] sm:text-5xl">
              Un système fiable se construit à partir du vôtre.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-[#53625b] sm:text-lg lg:text-[18px]">
            Pas de remplacement massif ni de projet opaque. Chaque étape produit un résultat vérifiable et prépare la suivante.
          </p>
        </div>

        <div className="relative mt-10 lg:mt-14">
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-[#cbd6cc] lg:block" />
          <div className="grid lg:grid-cols-4 lg:gap-6">
            {steps.map(({ icon: Icon, tone, ...step }, index) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative grid grid-cols-[4.5rem_1fr] gap-5 pb-9 before:absolute before:bottom-0 before:left-8 before:top-8 before:w-px before:bg-[#cbd6cc] last:pb-0 last:before:hidden lg:block lg:pb-0 lg:before:hidden"
              >
                <motion.div
                  whileHover={{ y: -4, rotate: -3 }}
                  transition={{ duration: 0.2 }}
                  className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-[5px] border-white shadow-[0_0_0_1px_#d5ddd5] ${tone}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </motion.div>
                <div className="pt-1 lg:mt-7 lg:pt-0">
                  <p className="text-xs font-bold tracking-[0.12em] text-[#c85332]">ÉTAPE {step.number}</p>
                  <h3 className="mt-3 text-xl font-semibold leading-snug text-[#17231f]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#66756c] sm:text-base lg:text-[18px]">{step.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-sm leading-relaxed text-[#66756c] sm:text-base lg:text-[18px]">
            Vous gardez la maîtrise de vos outils, de vos données et des priorités du projet.
          </p>
          <Link
            href="/contact#contact-form"
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#172b27] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#355c4b]"
          >
            Échanger sur votre système
          </Link>
        </div>
      </div>
    </section>
  );
}