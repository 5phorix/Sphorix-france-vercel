import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Création de site internet pour PME et indépendants",
  description:
    "Création de site internet vitrine et acquisition: architecture SEO, contenu, design, performance et conversion.",
  alternates: {
    canonical: "/services/creation-site-internet",
  },
  openGraph: {
    title: "Création de site internet | Sphorix France",
    description:
      "Un site internet conçu pour être trouvé sur Google et transformer vos visiteurs en prospects.",
    url: "/services/creation-site-internet",
    type: "article",
  },
};

export default function CreationSiteInternetPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-14 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
          Création de site internet
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Un site internet pensé pour la visibilité et la conversion
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          Nous créons des sites internet rapides, lisibles et optimisés SEO pour
          vous aider à obtenir plus de demandes qualifiées.
        </p>

        <h2 className="mt-8 text-xl font-bold text-slate-900">Ce qui est inclus</h2>
        <ul className="mt-4 space-y-2 text-slate-700">
          <li>Architecture SEO des pages et intentions de recherche</li>
          <li>Design responsive mobile et desktop</li>
          <li>Textes orientés conversion et appels à l’action</li>
          <li>Optimisation performance et indexation Google</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#contact-form"
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Demander un site internet
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
          >
            Voir toutes les offres
          </Link>
        </div>
      </article>
    </main>
  );
}
