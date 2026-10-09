import type { Metadata } from "next";

import ProductWorkspaceApp from "@/components/products/ProductWorkspaceApp";

export const metadata: Metadata = { title: "Sadesk Budget | Sphorix France", robots: { index: false, follow: false } };

export default function BudgetProductPage() {
  return <ProductWorkspaceApp module="budget" />;
}