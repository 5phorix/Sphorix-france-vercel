import type { Metadata } from "next";

import TreasuryApp from "@/components/products/TreasuryApp";

export const metadata: Metadata = {
  title: "Sadesk Suivi de Trésorerie | Sphorix France",
  description: "Application locale de suivi et de prévision de trésorerie.",
  robots: { index: false, follow: false },
};

export default function TreasuryProductPage() {
  return <TreasuryApp />;
}