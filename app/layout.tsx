import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

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
  title: "Sphorix France | Assistant de gestion & transformation digitale en France",
  description:
    "Accompagnement en gestion, finance et transformation digitale pour PME et indépendants à Paris, Orléans, Vierzon et partout en France.",
  keywords: ["assistant de gestion", "gestion financière", "tableaux de bord", "transformation digitale", "PME", "indépendants", "KPI", "rentabilité", "Paris", "Orléans", "Vierzon", "France", "accompagnement gestion"],
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
    title: "Sphorix France | Assistant de gestion & transformation digitale en France",
    description: "Accompagnement en gestion, finance et transformation digitale pour PME et indépendants à Paris, Orléans, Vierzon et partout en France.",
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
    title: "Sphorix France",
    description: "Assistant de gestion et transformation digitale pour PME et indépendants.",
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
      "Assistant de gestion et transformation digitale pour PME et indépendants à Paris, Orléans, Vierzon et partout en France",
    url: "https://sphorixfrance.fr",
    telephone: "+33781525393",
    areaServed: "FR",
    priceRange: "$$",
    serviceArea: {
      "@type": "Country",
      name: "France",
    },
  };

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
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
        </ThemeProvider>
      </body>
    </html>
  );
}