"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  MonitorSmartphone,
  ShieldCheck,
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
      title: "Transformation digitale",
      description:
        "Automatisation des processus et outils numériques adaptés aux PME et indépendants.",
      icon: MonitorSmartphone,
    },

    {
      title: "Accompagnement opérationnel",
      description:
        "Conseil stratégique, optimisation des coûts et aide à la décision.",
      icon: ShieldCheck,
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
            Services stratégiques pour PME et indépendants
          </h2>

          <p className="mx-auto max-w-3xl text-base text-slate-600 sm:text-lg">
            Sphorix France propose un accompagnement concret en gestion, finance et transformation digitale pour améliorer vos résultats partout en France, avec une présence renforcée à Paris, Orléans et Vierzon.
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}