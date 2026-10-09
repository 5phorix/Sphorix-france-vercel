import type { Metadata } from "next";

import ProductWorkspaceApp from "@/components/products/ProductWorkspaceApp";

export const metadata: Metadata = { title: "Sadesk Devis | Sphorix France", robots: { index: false, follow: false } };

export default function QuotesProductPage() {
  return <ProductWorkspaceApp module="quotes" />;
}