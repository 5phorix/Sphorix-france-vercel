"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Calculator,
  MonitorSmartphone,
  Settings,
} from "lucide-react";

export default function Services() {
  const services = [
    {
      title: "Gestion Comptable",
      description:
        "Organisation administrative et préparation des éléments comptables.",
      icon: Calculator,
    },

    {
      title: "Transformation Digitale",
      description:
        "Digitalisation des processus et optimisation des outils de travail.",
      icon: MonitorSmartphone,
    },

    {
      title: "Gestion d’Entreprise",
      description:
        "Accompagnement stratégique et suivi des activités.",
      icon: Briefcase,
    },

    {
      title: "Support & Organisation",
      description:
        "Mise en place de solutions modernes adaptées aux entreprises.",
      icon: Settings,
    },
  ];

  return (
    <section
      id="services"
      className="bg-slate-50 px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">
        
        <div className="mb-16 text-center">
          
          <p className="mb-3 font-semibold text-orange-500">
            SERVICES
          </p>

          <h2 className="mb-6 text-4xl font-bold text-slate-900">
            Des solutions adaptées aux entreprises modernes
          </h2>

          <p className="mx-auto max-w-3xl text-lg text-slate-600">
            Sphorix France accompagne les professionnels dans la gestion,
            l’organisation et la digitalisation de leurs activités.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          
          {services.map((service, index) => (
           <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
              key={index}
              className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
                <service.icon className="h-8 w-8 text-orange-500" />
              </div>

              <h3 className="mb-4 text-xl font-bold text-slate-900">
                {service.title}
              </h3>

              <p className="leading-relaxed text-slate-600">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}