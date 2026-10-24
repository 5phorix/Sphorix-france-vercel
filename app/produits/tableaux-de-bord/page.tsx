import type { Metadata } from "next";

import PilotageApp from "@/components/products/PilotageApp";

export const metadata: Metadata = { title: "Sadesk Tableaux de bord | Sphorix France", robots: { index: false, follow: false } };

export default function DashboardProductPage() {
  return <PilotageApp initialTab="pilotage" />;
}