import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Activités comptables administratives pour PME et indépendants",
  description:
    "Organisation et suivi des activités comptables administratives: pièces, rapprochements, préparation et coordination, sans mission d'expertise comptable.",
  alternates: {
    canonical: "/services/activites-comptables",
  },
  openGraph: {
    title: "Activités comptables | Sphorix France",
    description:
      "Un accompagnement sur les activités comptables administratives, sans mission d'expertise comptable.",
    url: "/services/activites-comptables",
    type: "article",
  },
};

export default function ActivitesComptablesPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-14 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
          Activités comptables
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Un appui administratif comptable clair, sans mission d&apos;expertise comptable
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Sphorix France vous accompagne sur les tâches administratives comptables
          nécessaires au suivi quotidien de votre activité, sans se substituer à
          un expert-comptable.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Exemples d&apos;activités accompagnées</h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li>Organisation des pièces et des justificatifs</li>
          <li>Préparation des éléments pour transmission</li>
          <li>Suivi des factures, règlements et relances</li>
          <li>Rapprochements et contrôles administratifs courants</li>
        </ul>

        <p className="mt-6 text-sm leading-relaxed text-slate-500">
          Cet accompagnement ne constitue pas une mission d&apos;expertise comptable,
          d&apos;attestation ou de certification.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#contact-form"
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Demander un échange
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