import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Applications web sur mesure pour vos process métier",
  description:
    "Développement d'applications web sur mesure: outils internes, automatisations, tableaux de bord et connecteurs adaptés à votre activité.",
  alternates: {
    canonical: "/services/applications-web-sur-mesure",
  },
  openGraph: {
    title: "Applications web sur mesure | Sphorix France",
    description:
      "Concevez vos outils métier pour gagner du temps, fiabiliser vos processus et piloter votre activité.",
    url: "/services/applications-web-sur-mesure",
    type: "article",
  },
};

export default function ApplicationsWebSurMesurePage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-14 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
          Applications web sur mesure
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Des outils métier adaptés à votre organisation
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Nous développons des applications web sur mesure pour digitaliser vos
          processus et offrir une vision claire de vos opérations.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Exemples de solutions</h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li>Portails internes et espaces clients</li>
          <li>Automatisation de tâches récurrentes</li>
          <li>Tableaux de bord de suivi en temps réel</li>
          <li>Connexions entre vos outils existants</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#contact-form"
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Démarrer un projet sur mesure
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
          >
            Retour aux services
          </Link>
        </div>
      </article>
    </main>
  );
}
