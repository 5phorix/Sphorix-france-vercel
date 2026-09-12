-- Ajouter les champs de traçabilité Stripe et événements de paiement

ALTER TABLE public.orders
ADD COLUMN stripe_payment_intent_id text,
ADD COLUMN stripe_customer_id text,
ADD COLUMN payment_method text,
ADD COLUMN last_error_message text;

-- Créer une table pour tracer les événements de paiement
CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'checkout_created', 'payment_succeeded', 'payment_failed', 'refunded', etc.
  stripe_event_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Index pour traçabilité
CREATE INDEX idx_payment_events_order_id ON public.payment_events(order_id);
CREATE INDEX idx_payment_events_stripe_event_id ON public.payment_events(stripe_event_id);
