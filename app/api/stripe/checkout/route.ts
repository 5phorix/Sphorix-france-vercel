import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY manquante.");
  return new Stripe(secretKey);
}

type CartInput = {
  id: string;
  quantity: number;
};

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ success: false, error: "Stripe n'est pas configuré." }, { status: 503 });
    }

    const stripe = getStripe();

    const body = await request.json() as { email?: unknown; items?: unknown };
    const email = body.email;
    const rawItems = body.items;

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Adresse email invalide." }, { status: 400 });
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 20) {
      return NextResponse.json({ success: false, error: "Panier invalide." }, { status: 400 });
    }

    const items = rawItems.filter((item): item is CartInput => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<CartInput>;
      return typeof candidate.id === "string"
        && typeof candidate.quantity === "number"
        && Number.isInteger(candidate.quantity)
        && candidate.quantity >= 1
        && candidate.quantity <= 10;
    });

    if (items.length !== rawItems.length) {
      return NextResponse.json({ success: false, error: "Lignes de panier invalides." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const productIds = items.map((item) => item.id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, slug, price_cents, currency, is_active")
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError) throw productsError;
    if (!products || products.length !== new Set(productIds).size) {
      return NextResponse.json({ success: false, error: "Un produit du panier n'est plus disponible." }, { status: 400 });
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const totalCents = items.reduce((total, item) => {
      const product = productById.get(item.id);
      return total + (product?.price_cents ?? 0) * item.quantity;
    }, 0);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: email,
        total_cents: totalCents,
        currency: "EUR",
        status: "pending",
        user_id: null,
      })
      .select("id")
      .single();

    if (orderError || !order) throw orderError ?? new Error("Commande introuvable.");

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => {
        const product = productById.get(item.id);
        if (!product) throw new Error("Produit introuvable.");
        return {
          order_id: order.id,
          product_id: product.id,
          product_name: product.name,
          unit_price_cents: product.price_cents,
          quantity: item.quantity,
        };
      })
    );

    if (itemsError) throw itemsError;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: items.map((item) => {
        const product = productById.get(item.id);
        if (!product) throw new Error("Produit introuvable.");
        return {
          quantity: item.quantity,
          price_data: {
            currency: product.currency.toLowerCase(),
            unit_amount: product.price_cents,
            product_data: { name: product.name },
          },
        };
      }),
      metadata: { orderId: order.id },
      success_url: `${siteUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/panier?cancelled=1`,
    });

    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Erreur Stripe checkout:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de préparer le paiement." },
      { status: 500 }
    );
  }
}
