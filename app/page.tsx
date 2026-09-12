import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import FloatingIcons from "@/components/floating-icons";
import Navbar from "@/sections/Navbar";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Services from "@/sections/Services";
import Projects from "@/sections/Approche";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";
import SolutionFinder from "@/sections/SolutionFinder";
import BoutiquePreview from "@/sections/BoutiquePreview";

export const metadata: Metadata = {
  title: "Outils de gestion et tableaux de bord sur mesure | Sphorix France",
  description:
    "Sphorix France conçoit des outils numériques, tableaux de bord et applications de gestion sur mesure pour les artisans et les PME.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Concevez-vous des outils de gestion sur mesure ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, nous concevons des outils numériques, tableaux de bord et applications adaptées à la gestion comptable, analytique, budgétaire et financière.",
        },
      },
      {
        "@type": "Question",
        name: "Pouvez-vous structurer les données d'une petite entreprise ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, nous organisons les données et les indicateurs pour faciliter le suivi des ventes, dépenses, budgets, clients et fournisseurs.",
        },
      },
      {
        "@type": "Question",
        name: "Proposez-vous aussi des services web ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, le développement web intervient lorsque votre activité a besoin d'une interface, d'une application ou d'une présence en ligne pour rendre la gestion plus efficace.",
        },
      },
    ],
  };

  return (
    <main>
      <Script
        id="schema-org-faq"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FloatingIcons />
      <Navbar />
      <Hero />
      <About />
      <Services />
      <SolutionFinder />
      <BoutiquePreview />

      <section className="bg-slate-50 px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Pages les plus consultées
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/services/creation-site-internet"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
            >
              Création de site internet
            </Link>
            <Link
              href="/services/design-web-ui-ux"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
            >
              Design web &amp; UI/UX
            </Link>
            <Link
              href="/services/applications-web-sur-mesure"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-500"
            >
              Applications web sur mesure
            </Link>
          </div>
        </div>
      </section>

      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}