import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gestion d'entreprise pour PME et indépendants",
  description:
    "Organisation, suivi administratif, structuration des priorités et appui à la gestion d'entreprise pour PME et indépendants.",
  alternates: {
    canonical: "/services/gestion-entreprise",
  },
  openGraph: {
    title: "Gestion d'entreprise | Sphorix France",
    description:
      "Un accompagnement concret pour structurer la gestion d'entreprise, fluidifier l'organisation et gagner en lisibilité.",
    url: "/services/gestion-entreprise",
    type: "article",
  },
};

export default function GestionEntreprisePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-14 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
          Gestion d&apos;entreprise
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Une gestion plus claire pour mieux organiser votre activité
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Sphorix France vous aide à structurer votre gestion d&apos;entreprise,
          clarifier vos priorités et mieux suivre vos opérations quotidiennes.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Ce que nous pouvons mettre en place</h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li>Organisation administrative et suivi des tâches clés</li>
          <li>Structuration des process internes</li>
          <li>Suivi des échéances, documents et flux courants</li>
          <li>Vision plus lisible des priorités de gestion</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#contact-form"
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Demander un accompagnement
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