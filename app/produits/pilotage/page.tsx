import type { Metadata } from "next";

import PilotageApp from "@/components/products/PilotageApp";

export const metadata: Metadata = { title: "Sadesk Pilotage | Sphorix France", robots: { index: false, follow: false } };

export default function PilotagePage() {
  return <PilotageApp />;
}
