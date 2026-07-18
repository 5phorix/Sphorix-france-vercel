import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services Sphorix France | web, gestion, suivi d'activité et activités comptables",
  description:
    "Découvrez les services Sphorix France: création de site internet, design UI/UX, développement d'applications web, gestion d'entreprise, suivi d'activité et activités comptables.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services Sphorix France",
    description:
      "Web, gestion, tableaux de bord et activités comptables pour structurer votre activité et accélérer votre acquisition client.",
    url: "/services",
    type: "website",
  },
};

const servicePages = [
  {
    title: "Création de site internet",
    href: "/services/creation-site-internet",
    description:
      "Sites vitrine, pages de vente et structures SEO local pour générer des demandes qualifiées.",
  },
  {
    title: "Design web et UI/UX",
    href: "/services/design-web-ui-ux",
    description:
      "Refonte visuelle, ergonomie et parcours utilisateur pour augmenter la conversion.",
  },
  {
    title: "Applications web sur mesure",
    href: "/services/applications-web-sur-mesure",
    description:
      "Outils métier, automatisations et tableaux de bord personnalisés adaptés à vos process.",
  },
  {
    title: "Gestion d'entreprise",
    href: "/services/gestion-entreprise",
    description:
      "Organisation administrative, suivi opérationnel et structuration des priorités pour gagner en clarté.",
  },
  {
    title: "Tableaux de bord et suivi d'activité",
    href: "/services/tableaux-de-bord-suivi-activite",
    description:
      "Indicateurs, suivi de performance et lecture claire de vos chiffres pour mieux piloter l'activité.",
  },
  {
    title: "Activités comptables",
    href: "/services/activites-comptables",
    description:
      "Préparation, organisation et suivi administratif comptable, sans mission d'expertise comptable.",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-14 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-orange-500">
          Services Sphorix France
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Web, gestion, suivi d&apos;activité et activités comptables
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-600 sm:text-lg">
          Sphorix France vous accompagne sur le développement web, la gestion,
          les tableaux de bord et les activités comptables administratives avec
          des solutions concrètes, lisibles et adaptées à votre activité.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {servicePages.map((service) => (
            <article
              key={service.href}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <h2 className="text-lg font-bold text-slate-900">{service.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {service.description}
              </p>
              <Link
                href={service.href}
                className="mt-4 inline-flex text-sm font-semibold text-blue-900 transition hover:text-orange-500"
              >
                Voir la page détaillée
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/#contact-form"
            className="inline-flex rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
          >
            Démarrer votre projet
          </Link>
        </div>
      </section>
    </main>
  );
}
