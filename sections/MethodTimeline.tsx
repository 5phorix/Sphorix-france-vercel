"use client";

import { motion, useReducedMotion } from "framer-motion";

interface MethodTimelineProps {
  phases: Array<{
    number: string;
    label: string;
    title: string;
    summary: string;
    steps: Array<{ title: string; detail: string }>;
  }>;
}

export default function MethodTimeline({ phases }: MethodTimelineProps) {
  const reduceMotion = useReducedMotion();

  return (
    <ol className="relative mt-12">
      <motion.span
        aria-hidden="true"
        className="absolute bottom-8 left-[19px] top-8 w-px origin-top bg-gradient-to-b from-[#df6a43] via-[#d8e1d8] to-[#d8e1d8] sm:left-[23px]"
        initial={reduceMotion ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
      />

      {phases.map(({ number, label, title, summary, steps }, phaseIndex) => (
        <motion.li
          key={number}
          className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-5 pb-12 last:pb-0 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-x-8 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-x-12"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : phaseIndex * 0.08 }}
        >
          <motion.span
            className="relative z-10 mt-0.5 flex h-10 w-10 items-center justify-center rounded-full border border-[#cbd6cc] bg-white font-mono text-sm font-bold text-[#355c4b] ring-4 ring-white sm:h-12 sm:w-12 sm:text-base"
            initial={reduceMotion ? false : { scale: 0.82 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : phaseIndex * 0.08 + 0.12 }}
          >
            {number}
          </motion.span>

          <div className="min-w-0 border-b border-[#e4e9e3] pb-10 last:border-0 last:pb-0 lg:grid lg:grid-cols-[minmax(12rem,0.75fr)_minmax(0,1.25fr)] lg:gap-x-10">
            <header className="pb-5 lg:pb-0">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#c85332]">
                Phase {number} <span aria-hidden="true">·</span> {label}
              </p>
              <h3 className="mt-2 text-2xl font-semibold leading-snug text-[#17231f] sm:text-3xl">
                {title}
              </h3>
              <p className="mt-3 max-w-md text-base leading-relaxed text-[#66756c] sm:text-lg">{summary}</p>
            </header>

            <ol className="border-t border-[#e4e9e3] lg:mt-1">
              {steps.map((step, stepIndex) => (
                <motion.li
                  key={step.title}
                  className="grid gap-1 border-b border-[#e4e9e3] py-4 last:border-b-0 sm:grid-cols-[minmax(12rem,0.8fr)_minmax(0,1fr)] sm:gap-6 sm:py-5"
                  initial={reduceMotion ? false : { opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.4,
                    delay: reduceMotion ? 0 : phaseIndex * 0.08 + stepIndex * 0.1 + 0.14,
                  }}
                >
                  <h4 className="text-base font-semibold leading-relaxed text-[#17231f] sm:text-lg">
                    <span className="mr-3 font-mono text-sm font-bold text-[#c85332] sm:text-base">
                      {number}.{stepIndex + 1}
                    </span>
                    {step.title}
                  </h4>
                  <p className="text-base leading-relaxed text-[#66756c]">{step.detail}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
