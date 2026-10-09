"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { useMemo, useState } from "react";

import type { Product } from "@/lib/catalogue-types";
import { formatPrice } from "@/lib/catalogue-format";
import AddToCartButton from "@/components/cart/AddToCartButton";

interface CatalogueGridProps {
  products: Product[];
  categorySlugs: { name: string; slug: string }[];
}

type ProductCardProfile = {
  card: string;
  icon: string;
  tag: string;
  eyebrow: string;
  hint: string;
  hintIcon: string;
  action: string;
};

const defaultProfile: ProductCardProfile = {
  card: "border-slate-300 border-t-8 bg-slate-50 hover:border-slate-500",
  icon: "bg-slate-100 text-slate-700",
  tag: "bg-white text-slate-700",
  eyebrow: "text-slate-600",
  hint: "text-slate-600",
  hintIcon: "text-slate-600",
  action: "hover:text-slate-700",
};

const productProfiles: Record<string, ProductCardProfile> = {
  "sadesk-devis": {
    card: "border-[#2457d6] border-t-8 bg-[#dbe7ff] hover:border-[#193a8a]",
    icon: "bg-[#193a8a] text-white",
    tag: "bg-[#b9ceff] text-[#193a8a]",
    eyebrow: "text-[#193a8a]",
    hint: "text-[#193a8a]",
    hintIcon: "text-[#2457d6]",
    action: "hover:text-[#2457d6]",
  },
  "sadesk-facturation": {
    card: "border-[#16866b] border-t-8 bg-[#d9f1e5] hover:border-[#12614f]",
    icon: "bg-[#12614f] text-white",
    tag: "bg-[#b9e4d2] text-[#12614f]",
    eyebrow: "text-[#12614f]",
    hint: "text-[#12614f]",
    hintIcon: "text-[#16866b]",
    action: "hover:text-[#16866b]",
  },
  "sadesk-budget": {
    card: "border-[#d96c2c] border-t-8 bg-[#ffe4cf] hover:border-[#a9521f]",
    icon: "bg-[#a9521f] text-white",
    tag: "bg-[#ffc99f] text-[#873e18]",
    eyebrow: "text-[#873e18]",
    hint: "text-[#873e18]",
    hintIcon: "text-[#d96c2c]",
    action: "hover:text-[#d96c2c]",
  },
  "sadesk-depenses-tresorerie": {
    card: "border-[#177d78] border-t-8 bg-[#d7f0ee] hover:border-[#176b68]",
    icon: "bg-[#176b68] text-white",
    tag: "bg-[#b6dfdc] text-[#176b68]",
    eyebrow: "text-[#176b68]",
    hint: "text-[#176b68]",
    hintIcon: "text-[#177d78]",
    action: "hover:text-[#177d78]",
  },
  "sadesk-tableaux-de-bord": {
    card: "border-[#7651b8] border-t-8 bg-[#e6d9ff] hover:border-[#5c3a91]",
    icon: "bg-[#5c3a91] text-white",
    tag: "bg-[#d0baff] text-[#4b2f7c]",
    eyebrow: "text-[#4b2f7c]",
    hint: "text-[#4b2f7c]",
    hintIcon: "text-[#7651b8]",
    action: "hover:text-[#7651b8]",
  },
};

const productCardCopy: Record<string, { eyebrow: string; hint: string }> = {
  "sadesk-devis": { eyebrow: "Ventes & propositions", hint: "Pour transformer vos opportunités en devis suivis." },
  "sadesk-facturation": { eyebrow: "Factures & règlements", hint: "Pour émettre, suivre et relancer vos factures." },
  "sadesk-budget": { eyebrow: "Prévision & pilotage", hint: "Pour comparer vos objectifs à vos dépenses réelles." },
  "sadesk-depenses-tresorerie": { eyebrow: "Flux & liquidités", hint: "Pour comprendre vos dépenses et vos disponibilités." },
  "sadesk-tableaux-de-bord": { eyebrow: "Indicateurs & décision", hint: "Pour lire les signaux essentiels de votre activité." },
};

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
            const profile = productProfiles[product.slug] ?? defaultProfile;
            const copy = productCardCopy[product.slug] ?? {
              eyebrow: product.categories?.name ?? "Outil de gestion",
              hint: product.short_description,
            };
            return (
              <article key={product.id} className={`group relative grid overflow-hidden rounded-[1.5rem] border shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:grid-cols-[42%_58%] ${profile.card}`}>
                {product.preview_image_path && <div className="relative min-h-56 overflow-hidden border-b border-black/10 bg-white p-4 md:min-h-full md:border-b-0 md:border-r"><Image src={product.preview_image_path} alt={`Couverture de ${product.name}`} fill sizes="(min-width: 1280px) 15vw, (min-width: 768px) 25vw, 100vw" quality={75} className="object-contain p-4" /></div>}
                <div className="flex min-w-0 flex-col p-5">
                <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${profile.eyebrow}`}>
                  {copy.eyebrow}
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{product.name}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{product.short_description}</p>
                <p className={`mt-4 flex items-center gap-2 text-xs font-semibold ${profile.hint}`}><BadgeCheck className={`h-4 w-4 ${profile.hintIcon}`} aria-hidden="true" />{copy.hint}</p>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Tarification</p><span className="text-lg font-bold text-slate-950">{formatPrice(product.price_cents, product.currency)}</span></div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Link href={`/boutique/${product.slug}`} className={`inline-flex items-center gap-2 text-sm font-semibold text-slate-950 ${profile.action}`}>
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
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
