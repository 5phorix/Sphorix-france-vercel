"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { RefreshCw } from "lucide-react";

const spiralPath =
  "M 300 67 C 431 48 527 132 508 244 C 490 354 397 425 280 407 C 163 389 91 318 117 228 C 141 146 222 103 305 125 C 375 143 413 193 394 252 C 378 304 328 336 277 317 C 231 300 219 261 238 228 C 255 198 288 187 315 202 C 335 214 344 239 333 258";

const phaseProgress = [0.02, 0.28, 0.54, 1];

const stages = [
  {
    number: "01",
    label: "Échanger",
    title: "Faire le point, simplement",
    detail: "Nous partons de votre besoin réel et de votre façon de travailler.",
    x: 50,
    y: 13.4,
  },
  {
    number: "02",
    label: "Comprendre",
    title: "Poser le bon diagnostic",
    detail: "Nous identifions les priorités avant de choisir les bons outils.",
    x: 84.7,
    y: 49,
  },
  {
    number: "03",
    label: "Mettre en place",
    title: "Organiser et équiper",
    detail: "Nous partons de votre outil existant ou concevons une solution adaptée à votre besoin.",
    x: 46.7,
    y: 81.4,
  },
  {
    number: "04",
    label: "Faire durer",
    title: "Suivre et ajuster",
    detail: "Le suivi nourrit une nouvelle analyse : on ajuste, puis on repart.",
    x: 19.5,
    y: 45.8,
  },
];

interface MethodSpiralProps {
  phases: Array<{
    number: string;
    label: string;
    title: string;
    summary: string;
  }>;
}

export default function MethodSpiral({ phases }: MethodSpiralProps) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const stage = stages[active];

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * 600;
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * 500;
    let nearestIndex = -1;
    let nearestDistance = Infinity;

    stages.forEach((item, index) => {
      const x = (item.x / 100) * 600;
      const y = (item.y / 100) * 500;
      const distance = Math.hypot(pointerX - x, pointerY - y);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestDistance <= 76 && nearestIndex !== active) setActive(nearestIndex);
  };

  return (
    <aside
      aria-label="Le parcours d’accompagnement en quatre temps"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#18332c] p-4 shadow-2xl shadow-black/25 sm:p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#d7f280]/10 blur-3xl"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7f280]">Notre fil conducteur</p>
          <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Un parcours qui progresse</h2>
        </div>
        <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-[#d1ddd5]">
        4 temps · un même cap
        </span>
      </div>
      <p className="relative mt-2 text-xs text-[#b9c9c0]">
        Déplacez la souris sur une étape pour suivre le parcours.
      </p>

      <div className="relative mt-1 aspect-[6/5]" onPointerMove={handlePointerMove}>
        <svg
          aria-hidden="true"
          viewBox="0 0 600 500"
          className="absolute inset-0 h-full w-full overflow-visible"
          fill="none"
        >
          <defs>
            <radialGradient id="spiral-glow">
              <stop stopColor="#d7f280" stopOpacity=".16" />
              <stop offset="1" stopColor="#d7f280" stopOpacity="0" />
            </radialGradient>
            <marker
              id="spiral-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="5"
              refY="4"
              orient="auto"
            >
              <path d="M1 1 6 4 1 7" stroke="#d7f280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          <circle cx="300" cy="250" r="151" fill="url(#spiral-glow)" />
          <path
            d={spiralPath}
            stroke="white"
            strokeOpacity=".12"
            strokeWidth="2"
            strokeDasharray="3 9"
          />
          <motion.path
            d={spiralPath}
            pathLength={1}
            stroke="#d7f280"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd="url(#spiral-arrow)"
            initial={false}
            animate={{ pathLength: phaseProgress[active], opacity: 0.85 }}
            transition={{ duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
          />
          <circle cx="333" cy="258" r="5" fill="#d7f280" />
        </svg>

        <div className="absolute left-1/2 top-1/2 z-10 flex h-[19.2%] w-[16%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#d7f280]/35 bg-[#10201d] text-[#d7f280] shadow-[0_0_28px_rgba(215,242,128,0.2)]">
          <motion.span
            key={active}
            initial={reduceMotion ? false : { rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: reduceMotion ? 0 : 0.65, ease: "easeInOut" }}
          >
            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </motion.span>
          {!reduceMotion && (
            <motion.span
              key={`pulse-${active}`}
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-[#d7f280]/60"
              initial={{ scale: 0.85, opacity: 0.65 }}
              animate={{ scale: 1.65, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          )}
        </div>

        {stages.map((item, index) => {
          const phase = phases[index];
          const isActive = index === active;

          return (
            <button
              key={item.number}
              type="button"
              onClick={() => setActive(index)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setActive(index);
              }}
              aria-label={`Phase ${item.number} : ${item.label} — ${phase.title}`}
              aria-pressed={isActive}
              className="group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-xl p-1.5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7f280] focus-visible:ring-offset-2 focus-visible:ring-offset-[#18332c]"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              <span
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition duration-300 sm:h-12 sm:w-12 ${
                  isActive
                    ? "scale-110 border-[#d7f280] bg-[#d7f280] text-[#172b27] shadow-[0_0_24px_rgba(215,242,128,0.4)]"
                    : "border-white/30 bg-[#172b27] text-white group-hover:border-[#d7f280]/70 group-hover:text-[#d7f280]"
                }`}
              >
                {item.number}
                {isActive && !reduceMotion && (
                  <motion.span
                    key={`stage-${active}`}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border border-[#d7f280]"
                    initial={{ scale: 0.85, opacity: 0.7 }}
                    animate={{ scale: 1.65, opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                )}
              </span>
              <span
                className={`whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold transition sm:text-xs ${
                  isActive ? "bg-white/10 text-[#d7f280]" : "text-[#d1ddd5] group-hover:text-white"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="relative min-h-[8.5rem] rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage.number}
            initial={reduceMotion ? false : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -7 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d7f280]">
              Phase {stage.number} · {stage.label}
            </p>
            <p className="mt-1 font-semibold text-white">{stage.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-[#d1ddd5]">{stage.detail}</p>
          </motion.div>
        </AnimatePresence>
        <p className="mt-3 border-t border-white/10 pt-2 text-sm leading-relaxed text-[#b9c9c0]">
          Le suivi relance le mouvement : votre organisation s’ajuste avec votre activité.
        </p>
      </div>
    </aside>
  );
}
