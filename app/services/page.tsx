import type { Metadata } from "next";
import Navbar from "@/sections/Navbar";
import Services from "@/sections/Services";
import Footer from "@/sections/Footer";

export const metadata: Metadata = {
  title: "Nos solutions | Applications Sphorix pour PME",
  description:
    "Découvrez comment Sphorix connecte vos plateformes, automatise vos processus et transforme vos données en informations utiles pour votre PME.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Nos solutions | Sphorix France",
    description: "Des connecteurs, un moteur commun de données et une application conçue autour de votre activité.",
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
