"use client";

import { motion } from "framer-motion";
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 pb-24 pt-40 text-white">
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-orange-500/20"></div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 text-orange-400">
            Conseil • Gestion • Transformation Digitale
          </p>

          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
            Accompagnez votre entreprise vers une gestion moderne et digitale
          </h1>

          <p className="mb-8 max-w-xl text-lg text-slate-300">
            Sphorix France accompagne les entreprises dans la gestion,
            l’organisation comptable et la transformation digitale avec des
            solutions modernes et efficaces.
          </p>

          <div className="flex flex-wrap gap-4">
            
            <a
              href="#services"
              className="rounded-full bg-orange-500 px-6 py-3 font-semibold transition hover:bg-orange-600"
            >
              Découvrir nos services
            </a>

            <a
              href="#contact"
              className="rounded-full border border-white px-6 py-3 font-semibold transition hover:bg-white hover:text-slate-900"
            >
              Nous contacter
            </a>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <div className="h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-500 to-orange-500 opacity-80 blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}