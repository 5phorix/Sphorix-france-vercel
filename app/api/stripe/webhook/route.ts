import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendConfirmationEmail } from "@/lib/email";

export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY manquante.");
  return new Stripe(secretKey);
}

async function logPaymentEvent(
  supabase: any,
  orderId: string,
  eventType: string,
  stripeEventId: string,
  details?: any
) {
  try {
    await supabase.from("payment_events").insert({
      order_id: orderId,
      event_type: eventType,
      stripe_event_id: stripeEventId,
      details: details || null,
    });
  } catch (error) {
    console.error("Erreur logging payment event:", error);
  }
}

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    console.error("Webhook Stripe non configuré.");
    return NextResponse.json({ error: "Webhook Stripe non configuré." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (error) {
    console.error("Signature webhook Stripe invalide:", error);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.warn("Webhook reçu sans orderId.");
    return NextResponse.json({ received: true });
  }

  const supabase = createSupabaseAdminClient();

  try {
    if (event.type === "checkout.session.completed" && session.payment_status === "paid") {
      // Vérifier que la commande existe et n'a pas déjà été payée (idempotence)
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("status, customer_email, total_cents, currency")
        .eq("id", orderId)
        .single();

      if (existingOrder?.status === "pending") {
        // Mettre à jour le statut de la commande
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
            status: "paid", 
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_customer_id: session.customer as string,
            payment_method: session.payment_method_types?.[0] || "unknown",
          })
          .eq("id", orderId)
          .eq("status", "pending");

        if (updateError) throw updateError;

        // Logger l'événement
        await logPaymentEvent(supabase, orderId, "payment_succeeded", event.id, {
          session_id: session.id,
          amount: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_email,
        });

        // Récupérer les détails de la commande pour l'email
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select(`
            id,
            customer_email,
            total_cents,
            currency,
            created_at,
            order_items (
              product_name,
              quantity,
              unit_price_cents
            )
          `)
          .eq("id", orderId)
          .single();

        if (orderError) throw orderError;
        if (order) {
          // Envoyer email de confirmation
          await sendConfirmationEmail(order);
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      // Annuler la commande si elle est toujours en attente
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("status", "pending");

      if (!error) {
        await logPaymentEvent(supabase, orderId, "checkout_expired", event.id);
      }
    }

    // Gérer les refunds
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      if (charge.metadata?.orderId) {
        const refundOrderId = charge.metadata.orderId as string;
        const { error } = await supabase
          .from("orders")
          .update({ status: "refunded" })
          .eq("id", refundOrderId);

        if (!error) {
          await logPaymentEvent(supabase, refundOrderId, "refunded", event.id, {
            amount_refunded: charge.amount_refunded,
            reason: (charge.refunds?.data[0] as any)?.reason || "unknown",
          });
        }
      }
    }

    // Gérer les erreurs de paiement
    if (event.type === "charge.failed") {
      const charge = event.data.object as Stripe.Charge;
      if (charge.metadata?.orderId) {
        const failedOrderId = charge.metadata.orderId as string;
        const { error } = await supabase
          .from("orders")
          .update({ 
            status: "cancelled",
            last_error_message: charge.failure_message || "Paiement échoué",
          })
          .eq("id", failedOrderId)
          .eq("status", "pending");

        if (!error) {
          await logPaymentEvent(supabase, failedOrderId, "payment_failed", event.id, {
            failure_code: charge.failure_code,
            failure_message: charge.failure_message,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erreur traitement webhook Stripe:", error);
    // Retourner 200 même en cas d'erreur pour éviter les retries infinis
    return NextResponse.json({ received: true, error: "Erreur traitement" }, { status: 200 });
  }
}
