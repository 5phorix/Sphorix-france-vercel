import type { Metadata } from "next";

import ProductWorkspaceApp from "@/components/products/ProductWorkspaceApp";

export const metadata: Metadata = { title: "Sadesk Facturation | Sphorix France", robots: { index: false, follow: false } };

export default function InvoicesProductPage() {
  return <ProductWorkspaceApp module="invoices" />;
}