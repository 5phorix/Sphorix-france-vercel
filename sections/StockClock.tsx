"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const items = [
  {
    title: "Comptage physique des stocks",
    pitch: "Vous savez enfin ce que vous avez vraiment en stock.",
    need: "Entre les chiffres du logiciel, les cartons non ouverts et les ventes non enregistrées, personne ne sait vraiment ce qu'il reste. Vous commandez à l'aveugle, vous immobilisez de la trésorerie.",
    why: "Nous venons compter produit par produit : vous partez enfin d'une base réelle, sans y passer vos week-ends.",
    x: 49.7,
    y: 3.7,
  },
  {
    title: "Identification et référencement",
    pitch: "Chaque article est nommé, classé et retrouvable.",
    need: "Produits sans code-barres, références en doublon, noms différents selon les fournisseurs : impossible de s'y retrouver ou de déléguer.",
    why: "Nous identifions et référençons tout, même sans code-barres, pour que vous ou vos équipes retrouviez chaque article en quelques secondes.",
    x: 85.2,
    y: 22.2,
  },
  {
    title: "Fichier de stock sur mesure",
    pitch: "Un fichier à votre image, pas un modèle générique.",
    need: "Les modèles Excel trouvés en ligne ne ressemblent pas à votre commerce : on les abandonne au bout de deux semaines.",
    why: "Nous construisons un fichier adapté à vos produits, vos fournisseurs et votre façon de travailler. Vous l'utilisez parce qu'il vous ressemble.",
    x: 75.5,
    y: 64,
  },
  {
    title: "Repérage des écarts",
    pitch: "Vous voyez où vous perdez de l'argent : ruptures, surstocks, pertes.",
    need: "Une rupture sur un best-seller, un rayon qui dort, de la démarque inconnue : ces pertes silencieuses grignotent votre marge sans alerte.",
    why: "Nous comparons le réel et le théorique pour vous montrer, en priorité, les produits qui coûtent le plus cher.",
    x: 30,
    y: 64.8,
  },
  {
    title: "Outil simple de suivi",
    pitch: "Vous gardez la main au quotidien, nous restons disponibles.",
    need: "Un inventaire fait une fois puis oublié ne vaut plus rien trois mois plus tard. Il vous faut un suivi que vous tenez vraiment.",
    why: "Nous mettons en place avec vous un outil simple, vous formons, et restons disponibles pour ajuster. Votre stock reste fiable dans la durée.",
    x: 16.3,
    y: 27.6,
  },
];

const INTERVAL = 6000;

// Centre du cercle de l'image (en %), pivot de l'aiguille.
const CENTER = { x: 49.8, y: 52.5 };

export default function StockClock() {
  const [active, setActive] = useState(0);
  const [pointerOver, setPointerOver] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const reduceMotion = useReducedMotion();

  const select = (i: number) => setActive(i);

  useEffect(() => {
    if (pointerOver || focusWithin) return;
    if (reduceMotion) return;
    const id = window.setTimeout(() => setActive((current) => (current + 1) % items.length), INTERVAL);
    return () => window.clearTimeout(id);
  }, [active, focusWithin, pointerOver, reduceMotion]);

  const item = items[active];
  // Angle en degrés, 0° = vers le haut, sens horaire (comme une aiguille).
  const angle = (Math.atan2((item.x - CENTER.x) * 539, -(item.y - CENTER.y) * 463) * 180) / Math.PI;

  return (
    <div
      className="mt-8 grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12"
      onMouseEnter={() => setPointerOver(true)}
      onMouseLeave={() => setPointerOver(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
          setFocusWithin(false);
        }
      }}
    >
      <div className="relative mx-auto w-full max-w-[540px] [container-type:inline-size]">
        <Image
          src="/accueil/gestion-stocks.png"
          alt="Gestion de vos stocks en 5 étapes : comptage, référencement, fichier sur mesure, repérage des écarts, outil de suivi"
          width={539}
          height={463}
          sizes="(min-width: 1024px) 540px, 90vw"
          className="h-auto w-full"
          style={{
            maskImage: `radial-gradient(circle at ${CENTER.x}% ${CENTER.y}%, transparent 0, transparent 15.4cqw, #000 15.8cqw)`,
            WebkitMaskImage: `radial-gradient(circle at ${CENTER.x}% ${CENTER.y}%, transparent 0, transparent 15.4cqw, #000 15.8cqw)`,
          }}
        />
        <motion.div
          className="pointer-events-none absolute z-10 h-0 w-0"
          style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%` }}
          animate={{ rotate: angle }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 18 }}
          aria-hidden="true"
        >
          <span
            className="absolute -left-[3px] block w-[6px] rounded-full bg-[#df6a43] shadow-md"
            style={{ bottom: "-1.5cqw", height: "25cqw" }}
          />
          <span className="absolute -left-[8px] -top-[8px] block h-4 w-4 rounded-full bg-[#df6a43] shadow-md" />
        </motion.div>
        {items.map((it, i) => (
          <button
            key={it.title}
            type="button"
            onClick={() => select(i)}
            aria-label={`Étape ${i + 1} : ${it.title}`}
            aria-pressed={i === active}
            className={`absolute z-20 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full transition motion-reduce:transition-none ${
              i === active ? "ring-4 ring-[#df6a43] ring-offset-2" : "hover:ring-4 hover:ring-[#df6a43]/50"
            }`}
            style={{ left: `${it.x}%`, top: `${it.y}%` }}
          />
        ))}
      </div>

      <div aria-live="polite" className="rounded-2xl border border-[#cbd6cc] bg-white p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.24 }}
          >
            <p className="text-sm font-bold uppercase text-[#c85332]">
              Étape {active + 1} sur {items.length}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#17231f]">{item.title}</h3>
            <p className="mt-3 text-lg font-medium text-[#355c4b]">{item.pitch}</p>

            <p className="mt-5 text-sm font-bold uppercase text-[#17231f]">Votre besoin</p>
            <p className="mt-1 text-[#66756c]">{item.need}</p>

            <p className="mt-5 text-sm font-bold uppercase text-[#17231f]">Pourquoi travailler avec nous</p>
            <p className="mt-1 text-[#66756c]">{item.why}</p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex gap-2" role="group" aria-label="Choisir une étape">
            {items.map((it, i) => (
              <button
                key={it.title}
                type="button"
                onClick={() => select(i)}
                aria-label={`Étape ${i + 1}`}
                aria-pressed={i === active}
                className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                  i === active
                    ? "bg-[#df6a43] text-white"
                    : "bg-[#f4f5f0] text-[#17231f] hover:bg-[#e0e6e0]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Link
            href="/contact#contact-form"
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#172b27] px-5 py-2.5 font-semibold text-white transition hover:bg-[#355c4b]"
          >
            En parler
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
