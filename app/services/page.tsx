import type { Metadata } from "next";
import Navbar from "@/sections/Navbar";
import Services from "@/sections/Services";
import Footer from "@/sections/Footer";

export const metadata: Metadata = {
  title: "Services | Sphorix France",
  description: "Comptage des stocks, référencement des produits, fichier de stock sur mesure, repérage des écarts et suivi simple.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Services | Sphorix France",
    description: "Comptage des stocks, référencement des produits, fichier de stock sur mesure, repérage des écarts et suivi simple.",
    url: "/services",
    type: "website",
  },
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <Services />
      </main>
      <Footer />
    </>
  );
}
