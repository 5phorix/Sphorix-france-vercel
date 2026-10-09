import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CircleAlert, Download, FileSpreadsheet, FlaskConical } from "lucide-react";

import { productLabEntries } from "@/lib/product-lab";

export const metadata: Metadata = {
  title: "Laboratoire produits | Sphorix France",
  robots: { index: false, follow: false },
};

export default function ProductLabPage() {
  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour au site
        </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Espace de développement</p>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">Laboratoire produits</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
              Testez les livrables en cours de développement sans créer de panier ni passer par le paiement.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 bg-white px-5 py-4 text-sm leading-relaxed text-slate-600">
            Les fichiers disponibles sont des prototypes internes. Ils ne constituent pas encore les versions commercialisables.
          </div>
        </div>

        <section className="mt-12 grid gap-5 md:grid-cols-2">
          {productLabEntries.map((product) => (
            <article key={product.slug} className="flex min-h-72 flex-col border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-slate-950 text-orange-300">
                  <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-orange-700">
                  {product.status}
                </span>
              </div>
              <h2 className="mt-6 text-xl font-bold text-slate-950">{product.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{product.summary}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {product.testPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-orange-600" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <span className="text-sm font-bold text-slate-950">Prix cible : {product.priceLabel}</span>
                {product.appPath ? (
                  <Link
                    href={product.appPath}
                    className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-900"
                  >
                    <FlaskConical className="h-4 w-4" aria-hidden="true" />
                    Ouvrir l&apos;application
                  </Link>
                ) : product.fileName ? (
                  <a
                    href={`/api/laboratoire-produits/${product.slug}`}
                    className="inline-flex items-center gap-2 bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-900"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Tester
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
                    <CircleAlert className="h-4 w-4" aria-hidden="true" />
                    À produire
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}