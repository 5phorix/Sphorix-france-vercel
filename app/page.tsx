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

export const metadata: Metadata = {
  title: "Création de site internet, design web et applications sur mesure en France",
  description:
    "Sphorix France accompagne les PME et indépendants en création de site internet, design web UI/UX, applications sur mesure et optimisation de la performance commerciale.",
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
        name: "Proposez-vous la création de site internet pour PME ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, nous créons des sites internet vitrine et conversion pour PME et indépendants avec une structure optimisée SEO.",
        },
      },
      {
        "@type": "Question",
        name: "Pouvez-vous concevoir un design web sur mesure ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, nous concevons des interfaces UI/UX sur mesure pour améliorer l'expérience utilisateur et le taux de conversion.",
        },
      },
      {
        "@type": "Question",
        name: "Developpez-vous des applications web sur mesure ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, nous développons des applications web sur mesure adaptées à vos processus métier: automatisations, tableaux de bord et outils internes.",
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

      <section className="bg-slate-50 px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Pages services les plus recherchées
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
              Design web & UI/UX
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