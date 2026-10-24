import type { Metadata } from "next";

import VentesApp from "@/components/products/VentesApp";

export const metadata: Metadata = { title: "Sadesk Devis | Sphorix France", robots: { index: false, follow: false } };

export default function QuotesProductPage() {
  return <VentesApp initialTab="quotes" />;
}