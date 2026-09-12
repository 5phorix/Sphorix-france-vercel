import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileSpreadsheet, LockKeyhole, Package, Sparkles } from "lucide-react";

import { getProductBySlug } from "@/lib/catalogue";
import { formatPrice, jsonList } from "@/lib/catalogue-format";
import AddToCartButton from "@/components/cart/AddToCartButton";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produit introuvable | Sphorix France" };
  }

  return {
    title: product.seo_title ?? `${product.name} | Sphorix France`,
    description: product.seo_description ?? product.short_description,
    alternates: { canonical: `/boutique/${product.slug}` },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f4f0e9] px-4 py-32 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Boutique</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-950">Produit introuvable</h1>
        <p className="mx-auto mt-4 max-w-md text-slate-600">Ce produit n&apos;est pas disponible ou n&apos;existe plus.</p>
        <Link href="/boutique" className="mt-7 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Retour à la boutique</Link>
      </main>
    );
  }

  const Icon = product.kind === "pack" ? Package : FileSpreadsheet;
  const features = jsonList(product.features);
  const includedItems = jsonList(product.included_items);

  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/boutique" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à la boutique
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div className="flex min-h-[24rem] items-center justify-center rounded-[2rem] bg-slate-950 p-10 text-white shadow-[0_22px_70px_rgba(15,23,42,0.16)]">
            <div className="text-center">
              {product.preview_image_path ? (
                <Image
                  src={product.preview_image_path}
                  alt={`Aperçu de ${product.name}`}
                  width={1200}
                  height={900}
                  className="rounded-2xl"
                  priority
                />
              ) : (
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-400/15 text-orange-300">
                <Icon className="h-10 w-10" aria-hidden="true" />
              </span>
              )}
              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Aperçu produit</p>
              <p className="mt-2 text-lg font-semibold">{product.format} · {product.kind === "pack" ? "Pack" : "Outil individuel"}</p>
            </div>
          </div>

          <article>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">{product.categories?.name ?? "Outil de gestion"}</p>
            <h1 className="mt-4 text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-slate-950 sm:text-6xl">{product.name}</h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">{product.short_description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="text-3xl font-bold text-slate-950">{formatPrice(product.price_cents, product.currency)}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-600">
                <LockKeyhole className="h-4 w-4 text-orange-600" aria-hidden="true" />
                Téléchargement sécurisé
              </span>
            </div>
            <AddToCartButton
              id={product.id}
              slug={product.slug}
              name={product.name}
              priceCents={product.price_cents}
              currency={product.currency}
            />

            <div className="mt-12 grid gap-8 border-t border-slate-200 pt-8 sm:grid-cols-2">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-slate-950"><Sparkles className="h-4 w-4 text-orange-600" aria-hidden="true" />Ce que vous allez obtenir</h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                  {features.map((feature) => <li key={feature} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />{feature}</li>)}
                </ul>
              </div>
              <div>
                <h2 className="font-bold text-slate-950">Contenu inclus</h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                  {includedItems.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />{item}</li>)}
                </ul>
              </div>
            </div>

            <div className="mt-10 rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600">
              {product.description}
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
