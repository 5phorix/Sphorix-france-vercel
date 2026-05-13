"use client";

import { motion } from "framer-motion";

const projects = [
  {
    title: "Transformation digitale d’une PME",
    category: "Transformation Digitale",
    image: "/images/project-digital.png",
    description:
      "Accompagnement dans la modernisation des outils de gestion et la digitalisation des processus administratifs.",

    results: [
      "Optimisation des tâches administratives",
      "Meilleure organisation interne",
      "Gain de temps opérationnel",
    ],
  },

  {
    title: "Organisation et suivi de gestion",
    category: "Gestion & Comptabilité",
    image: "/images/project-accounting.png",
    description:
      "Mise en place d’un système structuré de suivi administratif et préparation des éléments comptables.",

    results: [
      "Centralisation des documents",
      "Suivi simplifié des opérations",
      "Meilleure visibilité financière",
    ],
  },

  {
    title: "Accompagnement d’entreprise",
    category: "Gestion d’Entreprise",
    image: "/images/project-business.png",
    description:
      "Accompagnement dans l’organisation des activités et l’amélioration des méthodes de travail.",

    results: [
      "Processus clarifiés",
      "Organisation optimisée",
      "Meilleure productivité",
    ],
  },
];

export default function Projects() {
  return (
    <section id="projects" className="bg-slate-50 px-6 py-24">
      <div className="mx-auto max-w-7xl">

        <div className="mb-20 text-center">
          <p className="mb-3 font-semibold tracking-widest text-orange-500">
            RÉALISATIONS
          </p>

          <h2 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl">
            Des accompagnements concrets pour les entreprises
          </h2>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600">
            Sphorix France accompagne les professionnels dans
            l’organisation, la gestion et la transformation digitale
            avec des solutions modernes et adaptées.
          </p>
        </div>

        <div className="space-y-10">

          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-[32px] bg-white shadow-lg"
            >
              <div className="grid md:grid-cols-2">

                {/* IMAGE */}
                <div className="relative h-[320px] overflow-hidden">

                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />

                  {/* BADGE CENTRÉ EN BAS */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-orange-500/90 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md">
                  {project.category}
                </div>

                </div>

                {/* CONTENU */}
                <div className="flex flex-col justify-center p-10">

                  <h3 className="mb-5 text-3xl font-bold text-slate-900">
                    {project.title}
                  </h3>

                  <p className="mb-8 text-lg leading-relaxed text-slate-600">
                    {project.description}
                  </p>

                  <div className="mb-8 space-y-4">

                    {project.results.map((result, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-orange-500"></div>

                        <p className="text-slate-700">
                          {result}
                        </p>
                      </div>
                    ))}

                  </div>

                  <div>
                    <a
                      href="#contact"
                      className="inline-flex rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-orange-500"
                    >
                      Discuter du projet
                    </a>
                  </div>

                </div>
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}