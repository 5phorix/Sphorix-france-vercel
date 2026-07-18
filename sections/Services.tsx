"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  Brush,
  Code2,
  MonitorSmartphone,
  SlidersHorizontal,
} from "lucide-react";

export default function Services() {
  const services = [
    {
      title: "Pilotage financier",
      description:
        "Suivi de trésorerie, prévisions et reporting pour garder le contrôle de votre cashflow.",
      icon: BarChart3,
    },

    {
      title: "Tableaux de bord & KPI",
      description:
        "Mise en place d’indicateurs clairs pour mesurer la rentabilité et la performance.",
      icon: SlidersHorizontal,
    },

    {
      title: "Création de site internet",
      description:
        "Conception de sites vitrine et pages de conversion rapides, clairs et optimisés SEO.",
      icon: MonitorSmartphone,
      href: "/services/creation-site-internet",
    },

    {
      title: "Design web & UI/UX",
      description:
        "Création d'interfaces modernes, parcours utilisateurs fluides et identité visuelle cohérente.",
      icon: Brush,
      href: "/services/design-web-ui-ux",
    },

    {
      title: "Applications sur mesure",
      description:
        "Développement d'outils web adaptés à vos process: CRM, automatisations et tableaux de suivi.",
      icon: Code2,
      href: "/services/applications-web-sur-mesure",
    },
  ];

  return (
    <section
      id="services"
      className="bg-slate-50 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        
        <div className="mb-10 text-center sm:mb-14 lg:mb-16">
          
          <p className="mb-3 font-semibold text-orange-500">
            SERVICES
          </p>

          <h2 className="page-title">
            Création de sites internet, design web et applications sur mesure
          </h2>

          <p className="mx-auto max-w-3xl text-base text-slate-600 sm:text-lg">
            Sphorix France accompagne les PME et indépendants en création de site internet, design UI/UX, applications web sur mesure et pilotage de performance partout en France.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          
          {services.map((service, index) => (
           <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.01, boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)" }}
              key={index}
              className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl sm:p-7 lg:p-8"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-950 text-white">
                <service.icon className="h-8 w-8" />
              </div>

              <h3 className="mb-4 text-lg font-bold text-slate-900 sm:text-xl">
                {service.title}
              </h3>

              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                {service.description}
              </p>

              {service.href && (
                <Link
                  href={service.href}
                  className="mt-5 inline-flex text-sm font-semibold text-blue-900 transition hover:text-orange-500"
                >
                  Voir le service
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/services"
            className="inline-flex rounded-full bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Explorer toutes les offres web
          </Link>
        </div>
      </div>
    </section>
  );
}