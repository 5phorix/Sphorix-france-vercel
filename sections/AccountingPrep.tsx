"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const FLIP_DELAY = 7000;

const steps = [
  {
    src: "/accueil/pieces.webp",
    alt: "Vos pièces : factures d'achat, classeurs achats, ventes et dépenses",
    title: "Vos pièces",
    text: "Achats, ventes et dépenses classés, pièce par pièce.",
  },
  {
    src: "/accueil/recapitulatif.webp",
    alt: "Récapitulatif organisé : achats, ventes, dépenses et valeur du stock",
    title: "Un récapitulatif organisé",
    text: "Achats, ventes, dépenses et valeur du stock réunis dans un tableau clair.",
  },
  {
    src: "/accueil/cabinet.webp",
    alt: "Dossier complet prêt à transmettre au cabinet comptable",
    title: "Un dossier prêt à transmettre",
    text: "Votre cabinet comptable reçoit un dossier complet.",
  },
];

export default function AccountingPrep({
  detailed = false,
}: {
  detailed?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setFlipped((f) => !f), FLIP_DELAY);
    return () => clearTimeout(timer);
  }, [flipped, paused]);

  return (
    <section className="bg-white px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl rounded-3xl bg-[#f4f5f0] p-6 sm:p-10">
        <h2 className="text-xl font-semibold leading-snug text-[#17231f] sm:text-2xl lg:text-3xl">
          Des documents prêts pour votre expert-comptable.
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#53625b]">
          Nous classons vos pièces et préparons des récapitulatifs clairs. Votre
          cabinet reçoit un dossier complet, vous gagnez du temps.
        </p>

        <ol
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="mt-10 grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]"
        >
          {steps.flatMap((step, i) => {
            const card = (
              <motion.li
                key={step.src}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative min-w-0 [perspective:1200px]"
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{
                    duration: 1.6,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                  onClick={() => setFlipped((f) => !f)}
                  className="relative grid h-full w-full min-w-0 cursor-pointer grid-cols-[minmax(0,1fr)] [transform-style:preserve-3d]"
                >
                  <div className="col-start-1 row-start-1 aspect-[3/2] rounded-2xl border border-[#e0e6e0] bg-white p-2 shadow-lg shadow-[#172b27]/10 [backface-visibility:hidden]">
                    <div className="relative h-full w-full overflow-hidden rounded-xl">
                      <Image
                        src={step.src}
                        alt={step.alt}
                        fill
                        sizes="(min-width: 768px) 30vw, 90vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div
                    aria-hidden={!flipped}
                    className="col-start-1 row-start-1 flex min-h-full flex-col items-center justify-center break-words rounded-2xl bg-[#172b27] p-4 text-center text-white sm:p-6 shadow-lg shadow-[#172b27]/20 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  >
                    <h3 className="text-lg font-semibold leading-snug lg:text-xl">{step.title}</h3>
                    <p className="mt-2 text-base leading-snug text-[#d1ddd5] md:text-base">{step.text}</p>
                  </div>
                </motion.div>
              </motion.li>
            );
            return i < steps.length - 1
              ? [card, <Arrow key={`arrow-${i}`} />]
              : [card];
          })}
        </ol>

        {detailed ? (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[#66756c]">
            Nous ne tenons pas votre comptabilité et n&apos;émettons pas vos
            factures : ces missions restent celles de votre expert-comptable et
            de votre outil de facturation. Nous vous aidons à lui transmettre
            des informations claires, dans les limites réglementaires
            applicables.
          </p>
        ) : (
          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-[#355c4b] hover:text-[#c85332]"
          >
            Voir le détail
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <li className="flex items-center justify-center" aria-hidden="true">
      <motion.span
        animate={{ x: [0, 6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-12 w-12 rotate-90 items-center justify-center rounded-full bg-[#df6a43] text-white shadow-lg shadow-[#df6a43]/40 ring-4 ring-white md:rotate-0"
      >
        <ArrowRight className="h-6 w-6" strokeWidth={2.5} />
      </motion.span>
    </li>
  );
}
