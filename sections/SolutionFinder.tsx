"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Globe2, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const solutions = [
  {
    id: "web",
    label: "Développer ma présence en ligne",
    description: "Un site clair, crédible et pensé pour transformer les visites en prises de contact.",
    icon: Globe2,
    href: "/services/creation-site-internet",
    cta: "Voir les services web",
  },
  {
    id: "activity",
    label: "Mieux suivre mon activité",
    description: "Des tableaux de bord simples pour lire les ventes, dépenses et indicateurs essentiels.",
    icon: BarChart3,
    href: "/services/tableaux-de-bord-suivi-activite",
    cta: "Découvrir le suivi",
  },
  {
    id: "custom",
    label: "Créer une solution personnalisée",
    description: "Un outil métier, une automatisation ou un accompagnement adapté à votre fonctionnement.",
    icon: SlidersHorizontal,
    href: "/demande-devis",
    cta: "Parler de mon besoin",
  },
];

export default function SolutionFinder() {
  const [selectedId, setSelectedId] = useState(solutions[0].id);
  const selected = solutions.find((solution) => solution.id === selectedId) ?? solutions[0];
  const Icon = selected.icon;

  return (
    <section id="solution" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:gap-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">Trouver la bonne direction</p>
          <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight tracking-[-0.03em] text-slate-950 sm:text-5xl">
            Commencez par votre besoin, pas par la technologie.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
            Quelques choix suffisent pour vous orienter vers le service, l’outil ou l’échange le plus pertinent.
          </p>
        </div>

        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {solutions.map(({ id, label, icon: SolutionIcon }) => {
              const isSelected = id === selectedId;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedId(id)}
                  aria-pressed={isSelected}
                  className={`min-h-32 rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white shadow-lg"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  <SolutionIcon className={`h-5 w-5 ${isSelected ? "text-orange-300" : "text-orange-600"}`} aria-hidden="true" />
                  <span className="mt-6 block text-sm font-semibold leading-snug">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-5 rounded-3xl border border-orange-200 bg-orange-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-slate-950">{selected.label}</p>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">{selected.description}</p>
              </div>
            </div>
            <Link href={selected.href} className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-slate-950 hover:text-orange-700">
              {selected.cta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
