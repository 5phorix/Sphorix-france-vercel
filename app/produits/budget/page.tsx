import type { Metadata } from "next";

import PilotageApp from "@/components/products/PilotageApp";

export const metadata: Metadata = { title: "Sadesk Budget | Sphorix France", robots: { index: false, follow: false } };

export default function BudgetProductPage() {
  return <PilotageApp initialTab="gestion" />;
}