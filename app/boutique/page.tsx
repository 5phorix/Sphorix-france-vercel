import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

import CatalogueGrid from "@/components/catalogue/CatalogueGrid";
import { getCatalogue } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Boutique | Outils de gestion pour artisans et PME | Sphorix France",
  description:
    "Découvrez les outils numériques, tableaux de bord et modèles de gestion Sphorix pour structurer votre activité.",
  alternates: { canonical: "/boutique" },
};

export const dynamic = "force-dynamic";

export default async function BoutiquePage() {
  const { products, categories } = await getCatalogue();

  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">Boutique Sphorix</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-slate-950 sm:text-6xl">
              Des outils prêts à utiliser pour mieux lire votre activité.
            </h1>
          </div>
          <div className="max-w-xl lg:pb-2">
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Des modèles conçus pour les artisans, indépendants et PME qui veulent structurer leurs données sans ajouter de complexité.
            </p>
            <Link href="/demande-devis" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-orange-700">
              Besoin d&apos;un outil personnalisé ?
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <section className="mt-12 rounded-[2rem] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8 lg:mt-16 lg:p-10">
          {products.length === 0 ? (
            <div className="py-12 text-center">
              <LockKeyhole className="mx-auto h-8 w-8 text-orange-500" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-bold text-slate-950">Le catalogue arrive bientôt</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-600">
                Les premiers tableaux de trésorerie, dépenses et suivi d&apos;activité sont en préparation. Contactez-nous pour être accompagné dès maintenant.
              </p>
              <Link href="/demande-devis" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900">
                Demander un accompagnement
              </Link>
            </div>
          ) : (
            <CatalogueGrid
              products={products}
              categorySlugs={categories.map(({ name, slug }) => ({ name, slug }))}
            />
          )}
        </section>
      </div>
    </main>
  );
}
