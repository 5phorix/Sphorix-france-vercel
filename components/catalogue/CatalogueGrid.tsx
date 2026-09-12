"use client";

import Link from "next/link";
import { ArrowRight, FileSpreadsheet, Package } from "lucide-react";
import { useMemo, useState } from "react";

import type { Product } from "@/lib/catalogue-types";
import { formatPrice } from "@/lib/catalogue-format";
import AddToCartButton from "@/components/cart/AddToCartButton";

interface CatalogueGridProps {
  products: Product[];
  categorySlugs: { name: string; slug: string }[];
}

export default function CatalogueGrid({ products, categorySlugs }: CatalogueGridProps) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = category === "all" || product.categories?.slug === category;
      const matchesQuery = !normalizedQuery || [product.name, product.short_description]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === "all" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700"}`}
          >
            Tous les outils
          </button>
          {categorySlugs.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setCategory(item.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === item.slug ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="catalogue-search">Rechercher un outil</label>
        <input
          id="catalogue-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un outil"
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-400"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="font-semibold text-slate-900">Aucun outil ne correspond à votre recherche.</p>
          <p className="mt-2 text-sm text-slate-500">Essayez une autre catégorie ou revenez à la liste complète.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const Icon = product.kind === "pack" ? Package : FileSpreadsheet;
            return (
              <article key={product.id} className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {product.format}
                  </span>
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">
                  {product.categories?.name ?? "Outil de gestion"}
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{product.name}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{product.short_description}</p>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-lg font-bold text-slate-950">{formatPrice(product.price_cents, product.currency)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Link href={`/boutique/${product.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-orange-700">
                    Voir le produit
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <AddToCartButton
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    priceCents={product.price_cents}
                    currency={product.currency}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
