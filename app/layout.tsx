import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/components/cart/CartProvider";

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
  title: "Sphorix France | outils de gestion et tableaux de bord sur mesure",
  description:
    "Outils numériques, tableaux de bord et applications de gestion comptable, analytique, budgétaire et financière pour les artisans et les PME.",
  keywords: [
    "outil de gestion sur mesure",
    "tableau de bord financier",
    "suivi budgétaire",
    "suivi de trésorerie",
    "gestion analytique",
    "application de gestion",
    "développement d'outil métier",
    "tableaux de bord",
    "suivi d'activité",
    "organisation des données",
    "KPI",
    "rentabilité",
    "Paris",
    "Orléans",
    "Vierzon",
    "France",
  ],
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
    title: "Sphorix France | outils de gestion et tableaux de bord sur mesure",
    description: "Des outils numériques pour structurer les données, suivre l'activité et prendre de meilleures décisions.",
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
    title: "Sphorix France | outils de gestion et tableaux de bord sur mesure",
    description: "Applications de gestion, tableaux de bord et outils numériques adaptés aux artisans et aux PME.",
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
      "Outils numériques, tableaux de bord et applications de gestion sur mesure pour les artisans et les PME",
    url: "https://sphorixfrance.fr",
    telephone: "+33781525393",
    areaServed: "FR",
    priceRange: "$$",
    serviceArea: {
      "@type": "AdministrativeArea",
      name: "France",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Outils de gestion et solutions numériques",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Outils de gestion sur mesure",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Tableaux de bord financiers",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Applications de gestion",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Suivi comptable et budgétaire",
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
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}