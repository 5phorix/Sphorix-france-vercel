"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import AccountingPrep from "./AccountingPrep";
import Audience from "./Audience";
import EInvoicing from "./EInvoicing";

const deliverables = [
  {
    tab: "Inventaire",
    title: "Un comptage physique, produit par produit",
    text: "Nous comptons votre stock réel et identifions chaque article, même sans code-barres.",
    image: "/accueil/inventaire.webp",
  },
  {
    tab: "Référencement",
    title: "Un fichier de stock adapté à votre commerce",
    text: "Vos produits sont référencés et organisés dans un fichier clair, à votre image.",
    image: "/accueil/referencement.webp",
  },
  {
    tab: "Suivi",
    title: "Un outil simple pour suivre et décider",
    text: "Mouvements, écarts, produits à surveiller : l'essentiel, facile à tenir à jour.",
    image: "/accueil/suivi.webp",
  },
];

const keywords = ["Inventaire", "Référencement", "Écarts de stock", "Suivi des mouvements", "Valorisation", "Réapprovisionnement", "Sur place ou à distance"];

// Renseigner ces listes quand de vraies références clients existeront : les sections ne s'affichent qu'alors.
const clientLogos: { name: string; src: string }[] = [];
const caseStudies: { client: string; title: string; text: string; quote?: string; author?: string }[] = [];

const AUTO_DELAY = 5000;

export default function HomeShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = deliverables[active];

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % deliverables.length), AUTO_DELAY);
    return () => clearTimeout(timer);
  }, [active, paused]);

  return (
    <>
      <section className="overflow-hidden border-y border-[#e0e6e0] bg-[#172b27] py-4" aria-hidden="true">
        <div className="sphorix-marquee flex w-max gap-10 whitespace-nowrap text-sm font-semibold uppercase tracking-wider text-[#d1ddd5]">
          {[...keywords, ...keywords, ...keywords, ...keywords].map((word, i) => (
            <span key={i} className="flex items-center gap-10">
              {word}
              <span className="h-1.5 w-1.5 rounded-full bg-[#df6a43]" />
            </span>
          ))}
        </div>
      </section>

      {clientLogos.length > 0 && (
        <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
          <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-10">
            {clientLogos.map((logo) => (
              <li key={logo.name}>
                <Image src={logo.src} alt={logo.name} width={140} height={48} className="h-10 w-auto opacity-70" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c85332]">Ce que nous livrons</p>

          <div role="tablist" className="mt-6 flex flex-wrap gap-2">
            {deliverables.map((item, i) => (
              <button
                key={item.tab}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={`relative overflow-hidden rounded-full px-5 py-2 text-sm font-semibold transition ${
                  i === active ? "bg-[#172b27] text-white" : "bg-[#f4f5f0] text-[#355c4b] hover:bg-[#e8eee8]"
                }`}
              >
                {i === active && (
                  <motion.span
                    key={`${active}-${paused}`}
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[#df6a43]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: paused ? 0 : 1 }}
                    transition={{ duration: AUTO_DELAY / 1000, ease: "linear" }}
                  />
                )}
                {item.tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.tab}
              role="tabpanel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="mt-8 grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14"
            >
              <div className="relative mx-auto aspect-[3/2] w-full max-w-xl overflow-hidden rounded-2xl border border-[#e0e6e0] bg-[#f4f5f0] p-3">
                <div className="relative h-full w-full overflow-hidden rounded-xl">
                  <Image src={current.image} alt={current.title} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-contain" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold leading-snug text-[#17231f] sm:text-3xl">{current.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-[#53625b]">{current.text}</p>
                <Link href="/services" className="mt-6 inline-flex items-center gap-2 font-semibold text-[#355c4b] hover:text-[#c85332]">
                  Voir toute l&apos;offre
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <EInvoicing />
      <AccountingPrep />
      <Audience />

      {caseStudies.length > 0 && (
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c85332]">Études de cas</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {caseStudies.map((study) => (
                <article key={study.client} className="rounded-2xl border border-[#e0e6e0] bg-[#f4f5f0] p-6">
                  <p className="text-sm font-semibold text-[#c85332]">{study.client}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[#17231f]">{study.title}</h3>
                  <p className="mt-3 text-[#53625b]">{study.text}</p>
                  {study.quote && (
                    <blockquote className="mt-4 border-l-2 border-[#df6a43] pl-4 text-[#17231f]">
                      « {study.quote} »
                      <footer className="mt-1 text-sm text-[#66756c]">{study.author}</footer>
                    </blockquote>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
