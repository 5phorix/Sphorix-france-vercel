import type { Metadata } from "next";

import ProductWorkspaceApp from "@/components/products/ProductWorkspaceApp";

export const metadata: Metadata = { title: "Sadesk Tableaux de bord | Sphorix France", robots: { index: false, follow: false } };

export default function DashboardProductPage() {
  return <ProductWorkspaceApp module="dashboard" />;
}