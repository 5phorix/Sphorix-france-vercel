import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tableaux de bord et suivi d'activité pour PME et indépendants",
  description:
    "Mise en place de tableaux de bord, suivi d'activité, indicateurs et lecture des performances pour PME et indépendants.",
  alternates: {
    canonical: "/services/tableaux-de-bord-suivi-activite",
  },
  openGraph: {
    title: "Tableaux de bord et suivi d'activité | Sphorix France",
    description:
      "Des indicateurs clairs et un suivi d'activité lisible pour prendre de meilleures décisions.",
    url: "/services/tableaux-de-bord-suivi-activite",
    type: "article",
  },
};

export default function TableauxDeBordSuiviActivitePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-14 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
          Tableaux de bord et suivi d&apos;activité
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Des indicateurs simples pour suivre votre activité avec plus de recul
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Nous concevons des tableaux de bord clairs pour vous aider à suivre
          vos chiffres, comprendre vos écarts et orienter vos décisions.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Exemples de suivi</h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li>Suivi du chiffre d&apos;affaires, des charges et de la marge</li>
          <li>Tableaux de bord mensuels ou hebdomadaires</li>
          <li>Indicateurs de performance adaptés à votre activité</li>
          <li>Aide à la lecture et à l&apos;interprétation des données</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#contact-form"
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Mettre en place un tableau de bord
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
          >
            Voir tous les services
          </Link>
        </div>
      </article>
    </main>
  );
}