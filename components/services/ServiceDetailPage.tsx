"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  CheckSquare,
  ClipboardList,
  LayoutDashboard,
  Settings,
} from "lucide-react";

type HighlightItem =
  | string
  | {
      title: string;
      description: string;
    };

type ExtraSection = {
  title: string;
  paragraphs: string[];
};

type ResultPoint = {
  label: string;
  text: string;
};

const highlightIcons = [
  Bot,
  Settings,
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  CheckSquare,
];

interface ServiceDetailPageProps {
  eyebrow: string;
  title: string;
  description: string;
  highlightsTitle: string;
  highlights: HighlightItem[];
  extraSections?: ExtraSection[];
  primaryCtaLabel: string;
  primaryHref?: string;
  secondaryCtaLabel: string;
  secondaryHref: string;
  resultEyebrow?: string;
  resultTitle?: string;
  resultDescription?: string;
  resultPoints?: ResultPoint[];
  ctaLead?: string;
  ctaEmphasis?: string;
  theme: {
    pageAccent: string;
    orbLeft: string;
    orbRight: string;
    heroGradient: string;
    eyebrowClassName: string;
    highlightDot: string;
    asideGradient: string;
    asideBorder: string;
    noteClassName?: string;
  };
  note?: string;
}

export default function ServiceDetailPage({
  eyebrow,
  title,
  description,
  highlightsTitle,
  highlights,
  extraSections,
  primaryCtaLabel,
  primaryHref = "/demande-devis",
  secondaryCtaLabel,
  secondaryHref,
  resultEyebrow = "Résultat attendu",
  resultTitle = "Une page plus lisible, un message plus direct",
  resultDescription = "La structure met en avant l'offre, les bénéfices et la prochaine action, sans surcharge visuelle.",
  resultPoints = [
    {
      label: "Présentation",
      text: "Hero animé et hiérarchie claire.",
    },
    {
      label: "Contenu",
      text: "Points clés, pas de bloc plaqué.",
    },
    {
      label: "Action",
      text: "CTA visible et naturel.",
    },
  ],
  ctaLead,
  ctaEmphasis,
  theme,
  note,
}: ServiceDetailPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 px-4 py-14 sm:px-6 lg:px-8">
      <div className={`absolute inset-x-0 top-0 h-72 bg-gradient-to-b ${theme.pageAccent} to-transparent`} />
      <div className={`absolute left-0 top-24 h-56 w-56 rounded-full ${theme.orbLeft} blur-3xl`} />
      <div className={`absolute right-0 top-40 h-56 w-56 rounded-full ${theme.orbRight} blur-3xl`} />

      <motion.article
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
      >
        <div className={`relative overflow-hidden bg-gradient-to-br ${theme.heroGradient} px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10`}>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-[38%] opacity-25">
            <Image
              src="/images/hero-illustration.png"
              alt="Illustration métier"
              fill
              sizes="(max-width: 1024px) 0px, 360px"
              className="object-contain object-right"
              priority
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className={`relative z-10 text-sm font-semibold uppercase tracking-[0.18em] ${theme.eyebrowClassName}`}
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="relative z-10 mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="relative z-10 mt-4 max-w-3xl text-base leading-relaxed text-slate-200 sm:text-lg"
          >
            {description}
          </motion.p>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:p-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6"
            >
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {highlightsTitle}
              </h2>

              <ul className="mt-4 space-y-3 text-slate-700">
                {highlights.map((item, index) => (
                  <motion.li
                    key={typeof item === "string" ? item : item.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    {(() => {
                      const Icon = highlightIcons[index % highlightIcons.length];
                      return (
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                          <Icon className="h-4 w-4 text-slate-700" aria-hidden="true" />
                        </span>
                      );
                    })()}
                    {typeof item === "string" ? (
                      <span className="pt-1">{item}</span>
                    ) : (
                      <div className="pt-0.5">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                      </div>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {extraSections?.map((section, index) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.42, delay: 0.06 + index * 0.07 }}
                className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </motion.section>
            ))}

            {note && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className={`mt-5 rounded-2xl p-5 text-sm leading-relaxed ${theme.noteClassName ?? "border border-amber-200 bg-amber-50 text-amber-950"}`}
              >
                {note}
              </motion.p>
            )}
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className={`rounded-3xl border p-6 text-white shadow-lg sm:p-7 ${theme.asideBorder} bg-gradient-to-br ${theme.asideGradient}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
              {resultEyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              {resultTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              {resultDescription}
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">Tendance d'activité</p>
              <svg viewBox="0 0 260 88" className="mt-3 h-20 w-full" role="img" aria-label="Graphe de progression">
                <polyline
                  points="8,70 52,56 95,60 138,42 181,47 224,24 252,18"
                  fill="none"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line x1="8" y1="74" x2="252" y2="74" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <rect x="22" y="46" width="16" height="28" rx="4" fill="rgba(255,255,255,0.2)" />
                <rect x="66" y="39" width="16" height="35" rx="4" fill="rgba(255,255,255,0.25)" />
                <rect x="110" y="31" width="16" height="43" rx="4" fill="rgba(255,255,255,0.35)" />
                <rect x="154" y="24" width="16" height="50" rx="4" fill="rgba(255,255,255,0.42)" />
              </svg>
            </div>

            <div className="mt-6 grid gap-3">
              {resultPoints.map((point) => (
                <div key={point.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{point.label}</p>
                  <p className="mt-1 text-sm text-slate-300">{point.text}</p>
                </div>
              ))}
            </div>

            {(ctaLead || ctaEmphasis) && (
              <div className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                {ctaLead && <p className="text-sm text-slate-300">{ctaLead}</p>}
                {ctaEmphasis && <p className="text-base font-semibold text-white">{ctaEmphasis}</p>}
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                {primaryCtaLabel}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-900"
              >
                {secondaryCtaLabel}
              </Link>
            </div>
          </motion.aside>
        </div>
      </motion.article>
    </main>
  );
}