import type { Metadata } from "next";

import PilotageApp from "@/components/products/PilotageApp";

export const metadata: Metadata = { title: "Sadesk Comptabilité | Sphorix France", robots: { index: false, follow: false } };

export default function AccountingProductPage() {
  return <PilotageApp initialTab="ecritures" />;
}
