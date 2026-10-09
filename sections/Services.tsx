"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AppWindow, Boxes, Cable, Database, Pause, Play } from "lucide-react";

const layers = [
  {
    number: "01",
    title: "Vos logiciels existants",
    description: "Conservez les outils déjà utilisés par vos équipes et reliez leurs données utiles.",
    items: ["Logiciel comptable", "Banque", "Facturation", "Outils métier"],
    icon: Boxes,
    className: "border-[#d5ddd5] bg-white text-[#17231f]",
    markerClassName: "bg-[#e8eee8] text-[#355c4b]",
  },
  {
    number: "02",
    title: "Sphorix Connect",
    description: "La couche d’intégration qui relie vos logiciels à Sadesk et automatise les échanges.",
    items: ["API et webhooks", "Imports de fichiers", "Contrôles de synchronisation", "Suivi des erreurs"],
    icon: Cable,
    className: "border-[#e7c8ba] bg-[#fff8f4] text-[#35251f]",
    markerClassName: "bg-[#f8e4d9] text-[#a7492e]",
  },
  {
    number: "03",
    title: "Le moteur commun de données",
    description: "Des données rapprochées et fiabilisées pour produire des informations utiles.",
    items: ["Normalisation", "Détection des doublons", "Contrôles", "Traçabilité"],
    icon: Database,
    className: "border-[#c9d99a] bg-[#e5f1bd] text-[#243126]",
    markerClassName: "bg-[#d3e99a] text-[#355c4b]",
  },
  {
    number: "04",
    title: "Sadesk Compta",
    description: "Le poste de travail pour importer, traiter et suivre les opérations de votre entreprise.",
    items: ["Importer les factures", "Facturer et comptabiliser", "Suivre les échéances", "Piloter l’activité"],
    icon: AppWindow,
    className: "border-[#29483f] bg-[#172b27] text-white",
    markerClassName: "bg-white/10 text-[#d7f280]",
  },
];

interface ServicesProps {
  summary?: boolean;
}

export default function Services({ summary = false }: ServicesProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (summary || !isPlaying || isHovered || isFocused || prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      const track = carouselRef.current;
      if (!track) return;

      const nextLayer = (activeLayer + 1) % layers.length;
      const nextSlide = track.querySelector<HTMLElement>(`[data-solution-index="${nextLayer}"]`);
      if (!nextSlide) return;

      const nextPosition = nextSlide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
      track.scrollTo({ left: nextPosition, behavior: "smooth" });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [activeLayer, isFocused, isHovered, isPlaying, prefersReducedMotion, summary]);

  const updateActiveLayer = () => {
    const track = carouselRef.current;
    const firstSlide = track?.querySelector<HTMLElement>("[data-solution-slide]");
    if (!track || !firstSlide) return;

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    setActiveLayer(Math.min(layers.length - 1, Math.round(track.scrollLeft / (firstSlide.offsetWidth + gap))));
  };

  const moveCarousel = (direction: -1 | 1) => {
    const track = carouselRef.current;
    const firstSlide = track?.querySelector<HTMLElement>("[data-solution-slide]");
    if (!track || !firstSlide) return;

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const nextLayer = Math.max(0, Math.min(layers.length - 1, activeLayer + direction));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    track.scrollTo({
      left: nextLayer * (firstSlide.offsetWidth + gap),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  if (summary) {
    return (
      <section id="solutions" className="bg-[#f4f5f0] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="mb-4 text-xs font-bold uppercase text-[#c85332]">Nos solutions</p>
              <h2 className="max-w-2xl text-4xl font-semibold leading-tight text-[#17231f] sm:text-5xl">
                De vos outils à une application utile au quotidien.
              </h2>
            </div>
            <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-[#355c4b] hover:text-[#c85332]">
              Découvrir nos solutions
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {layers.map(({ number, title, description, icon: Icon }, index) => (
              <motion.article
                key={number}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="rounded-lg border border-[#d5ddd5] bg-white p-5"
              >
                <div className="flex items-center justify-between text-[#355c4b]">
                  <span className="text-xs font-bold">{number}</span>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#17231f]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#66756c] lg:text-[18px]">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="solutions"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocused(false);
      }}
      className="bg-[#f4f5f0] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-bold uppercase text-[#c85332]">Nos solutions</p>
            <h2 className="max-w-2xl text-4xl font-semibold leading-tight text-[#17231f] sm:text-5xl">
              De vos logiciels à Sadesk Compta.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-[#53625b] sm:text-lg lg:text-[18px]">
            Nous connectons vos outils, automatisons vos processus et transformons vos données en informations utiles pour piloter votre activité.
          </p>
        </div>

        <div
          ref={carouselRef}
          role="region"
          aria-label="Les étapes de la solution Sphorix"
          aria-roledescription="carrousel"
          onScroll={updateActiveLayer}
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#355c4b] lg:mt-14"
        >
          {layers.map(({ number, title, description, items, icon: Icon, className, markerClassName }, index) => (
            <motion.article
              key={title}
              data-solution-slide
              data-solution-index={index}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${index + 1} sur ${layers.length}`}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className={`w-[88%] shrink-0 snap-start rounded-lg border p-5 sm:p-6 md:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.667rem)] xl:min-h-[380px] ${className}`}
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-bold ${markerClassName}`}>
                  {number}
                </span>
                <Icon className="h-5 w-5 opacity-75" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-semibold leading-snug">{title}</h3>
              <p className="mt-3 min-h-12 text-sm leading-relaxed opacity-75 lg:text-[18px]">{description}</p>
              <ul className="mt-5 space-y-2 border-t border-current/15 pt-4">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm leading-relaxed lg:text-[18px]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#df6a43]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p aria-live="off" className="text-sm font-semibold text-[#66756c]">
            {String(activeLayer + 1).padStart(2, "0")} / {String(layers.length).padStart(2, "0")}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={prefersReducedMotion ? "Rotation automatique désactivée selon votre préférence" : isPlaying ? "Mettre le carrousel en pause" : "Reprendre le carrousel"}
              aria-pressed={prefersReducedMotion || !isPlaying}
              title={prefersReducedMotion ? "Désactivé selon votre préférence de mouvement réduit" : isPlaying ? "Mettre en pause" : "Reprendre"}
              disabled={prefersReducedMotion ?? false}
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                  return;
                }
                setIsPlaying(true);
                setIsHovered(false);
                setIsFocused(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-[#cbd6cc] text-[#355c4b] transition hover:border-[#355c4b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              aria-label="Solution précédente"
              title="Solution précédente"
              disabled={activeLayer === 0}
              onClick={() => moveCarousel(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-[#cbd6cc] text-[#355c4b] transition hover:border-[#355c4b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Solution suivante"
              title="Solution suivante"
              disabled={activeLayer === layers.length - 1}
              onClick={() => moveCarousel(1)}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-[#cbd6cc] text-[#355c4b] transition hover:border-[#355c4b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}