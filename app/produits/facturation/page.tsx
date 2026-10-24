import type { Metadata } from "next";

import VentesApp from "@/components/products/VentesApp";

export const metadata: Metadata = { title: "Sadesk Facturation | Sphorix France", robots: { index: false, follow: false } };

export default function InvoicesProductPage() {
  return <VentesApp initialTab="invoices" />;
}