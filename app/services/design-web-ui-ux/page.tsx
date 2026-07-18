import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Design web et UI/UX pour augmenter vos conversions",
  description:
    "Refonte design web et UI/UX: clarifier votre message, simplifier les parcours et augmenter le taux de conversion.",
  alternates: {
    canonical: "/services/design-web-ui-ux",
  },
  openGraph: {
    title: "Design web & UI/UX | Sphorix France",
    description:
      "Des interfaces claires et orientées conversion pour vos visiteurs et clients.",
    url: "/services/design-web-ui-ux",
    type: "article",
  },
};

export default function DesignWebPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-14 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
          Design web & UI/UX
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Un design web cohérent, rassurant et performant
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Nous alignons votre design sur vos objectifs commerciaux: lisibilité,
          crédibilité, expérience utilisateur et conversion.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Interventions frequentes</h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li>Refonte UI/UX de site internet existant</li>
          <li>Création de système visuel et composants cohérents</li>
          <li>Optimisation des parcours et formulaires de contact</li>
          <li>Amélioration de la lisibilité mobile et desktop</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#contact-form"
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Parler de votre design
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
