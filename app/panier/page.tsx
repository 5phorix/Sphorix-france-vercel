"use client";

import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/catalogue-format";

export default function PanierPage() {
  const { items, totalCents, removeItem, updateQuantity } = useCart();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map(({ id, quantity }) => ({ id, quantity })),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error ?? "Paiement indisponible.");
      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Paiement indisponible.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/boutique" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à la boutique
        </Link>
        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Votre sélection</p>
            <h1 className="mt-3 text-5xl font-bold tracking-[-0.04em] text-slate-950">Panier</h1>
          </div>
          <ShoppingBag className="hidden h-10 w-10 text-orange-500 sm:block" aria-hidden="true" />
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[2rem] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Votre panier est vide</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">Ajoutez un outil de gestion depuis la boutique pour préparer votre commande.</p>
            <Link href="/boutique" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900">Explorer la boutique</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
            <div className="space-y-3">
              {items.map((item) => (
                <article key={item.id} className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/boutique/${item.slug}`} className="font-bold text-slate-950 hover:text-orange-700">{item.name}</Link>
                    <p className="mt-1 text-sm text-slate-500">{formatPrice(item.priceCents, item.currency)} l&apos;unité</p>
                  </div>
                  <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 p-1">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Réduire la quantité de ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"><Minus className="h-3.5 w-3.5" aria-hidden="true" /></button>
                      <span className="min-w-5 text-center text-sm font-semibold">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Augmenter la quantité de ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"><Plus className="h-3.5 w-3.5" aria-hidden="true" /></button>
                    </div>
                    <span className="min-w-20 text-right font-bold text-slate-950">{formatPrice(item.priceCents * item.quantity, item.currency)}</span>
                    <button type="button" onClick={() => removeItem(item.id)} aria-label={`Supprimer ${item.name} du panier`} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Récapitulatif</p>
              <div className="mt-6 flex items-center justify-between border-b border-white/10 pb-4 text-sm text-slate-300">
                <span>Sous-total</span>
                <span className="font-bold text-white">{formatPrice(totalCents, items[0]?.currency ?? "EUR")}</span>
              </div>
              <label htmlFor="checkout-email" className="mt-5 block text-xs font-semibold text-slate-300">Email de réception</label>
              <input id="checkout-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@entreprise.fr" className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-300" />
              {error && <p role="alert" className="mt-3 text-xs text-red-300">{error}</p>}
              <button type="button" onClick={handleCheckout} disabled={isLoading || !email} className="mt-6 w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? "Préparation du paiement..." : "Payer avec Stripe"}
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
