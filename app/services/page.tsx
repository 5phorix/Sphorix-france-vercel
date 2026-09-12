import type { Metadata } from "next";
import ServicesCatalog from "@/components/services/ServicesCatalog";

export const metadata: Metadata = {
  title: "Services de gestion et outils numériques | Sphorix France",
  description:
    "Découvrez les solutions Sphorix pour structurer vos données, suivre vos indicateurs et concevoir des outils de gestion sur mesure.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services de gestion et outils numériques | Sphorix France",
    description:
      "Outils numériques, tableaux de bord et applications de gestion comptable, analytique, budgétaire et financière.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return <ServicesCatalog />;
}
