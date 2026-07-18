import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import CookieConsentBanner from "@/components/CookieConsentBanner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sphorixfrance.fr"),
  title: "Sphorix France | Création de site internet, design web et applications sur mesure",
  description:
    "Création de site internet, design UI/UX, applications web sur mesure, accompagnement en gestion et transformation digitale pour PME et indépendants en France.",
  keywords: ["création site internet", "agence web", "création site vitrine", "création site e-commerce", "design web", "design ui ux", "application sur mesure", "développement application web", "assistant de gestion", "gestion financière", "tableaux de bord", "transformation digitale", "PME", "indépendants", "KPI", "rentabilité", "Paris", "Orléans", "Vierzon", "France"],
  authors: [{ name: "Sphorix France" }],
  creator: "Sphorix France",
  publisher: "Sphorix France",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://sphorixfrance.fr",
    siteName: "Sphorix France",
    title: "Sphorix France | Création de site internet, design web et applications sur mesure",
    description: "Création de site internet, design web et applications sur mesure pour PME et indépendants partout en France.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sphorix France",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sphorix France | Création de site internet et apps sur mesure",
    description: "Design web, création de sites internet et applications sur mesure pour PME et indépendants.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaOrgJson = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Sphorix France",
    description:
      "Création de site internet, design web, applications sur mesure et accompagnement en gestion pour PME et indépendants en France",
    url: "https://sphorixfrance.fr",
    telephone: "+33781525393",
    areaServed: "FR",
    priceRange: "$$",
    serviceArea: {
      "@type": "Country",
      name: "France",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services digitaux et gestion",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
              name: "Création de site internet",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Design web et UI/UX",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Applications web sur mesure",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Gestion d'entreprise",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Tableaux de bord et suivi d'activité",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Activités comptables administratives",
          },
        },
      ],
    },
  };

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="schema-org-professional-service"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJson) }}
        />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/logo/logo.png" />
      </head>
      <body className="min-h-full bg-slate-100 text-slate-900">
        <ThemeProvider>
          {children}
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}