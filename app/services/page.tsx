import type { Metadata } from "next";
import ServicesCatalog from "@/components/services/ServicesCatalog";

export const metadata: Metadata = {
  title: "Services Sphorix France | web, outils sur mesure et organisation",
  description:
    "Découvrez des services clairs pour le web, les outils sur mesure, l'organisation et les activités comptables.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services Sphorix France | web, outils sur mesure et organisation",
    description:
      "Sites internet, design web, applications sur mesure, organisation et activités comptables.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return <ServicesCatalog />;
}
