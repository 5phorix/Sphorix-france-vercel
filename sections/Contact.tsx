"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from "react";

export default function Contact() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const openContactForm = useCallback(() => {
    setIsFormVisible(true);
  }, []);

  const handleOpenForm = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openContactForm();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsFormVisible(false);
  };

  useEffect(() => {
    const listener = () => openContactForm();
    window.addEventListener("open-contact-form", listener);

    return () => {
      window.removeEventListener("open-contact-form", listener);
    };
  }, [openContactForm]);

  useEffect(() => {
    if (!isFormVisible) return;

    const form = document.getElementById("contact-form");
    if (!form) return;

    form.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      const firstField = form.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
      firstField?.focus();
    }, 400);
  }, [isFormVisible]);
  return (
    <section
      id="contact"
      className="border-t border-blue-900/50 bg-blue-950 px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="grid gap-8 rounded-[32px] border border-blue-800/60 bg-blue-900/50 p-6 sm:gap-10 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <p className="mb-3 font-semibold tracking-[0.2em] text-orange-400">
              CONTACT
            </p>

            <h2 className="mb-4 text-[clamp(1.75rem,2.6vw,2.8rem)] font-bold tracking-tight text-white">
              Échangeons sur vos besoins
            </h2>

            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Vous souhaitez améliorer votre organisation, optimiser votre gestion
              ou faire évoluer vos outils numériques ? Échangeons sur vos objectifs
              et identifions ensemble les solutions adaptées à votre activité, partout en France, y compris à Paris, Orléans et Vierzon.
            </p>

            <div className="mb-8 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-5">
                <h3 className="mb-2 font-semibold text-white">
                  Gestion & organisation
                </h3>

                <p className="leading-relaxed">
                  Structuration des activités, amélioration des processus
                  et optimisation des méthodes de travail.
                </p>
              </div>

              <div className="rounded-xl border border-blue-800/50 bg-blue-950/40 p-5">
                <h3 className="mb-2 font-semibold text-white">
                  Transformation digitale
                </h3>

                <p className="leading-relaxed">
                  Intégration d’outils numériques pour simplifier
                  et améliorer votre efficacité.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact-form"
                onClick={handleOpenForm}
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Prendre contact
              </a>

              <a
                href="https://wa.me/+33781525393"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-blue-800/70 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-orange-400 hover:text-orange-400"
              >
                Échanger sur WhatsApp
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-[24px] border border-blue-800/60"
          >
            <div className="relative h-64 w-full min-h-[280px] sm:h-72 lg:h-full lg:min-h-[320px]">
              <Image
                src="/images/hero-illustration.png"
                alt="Accompagnement des PME et indépendants par Sphorix France"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {isFormVisible && (
            <motion.div
              id="contact-form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35 }}
              className="scroll-mt-24 rounded-[28px] border border-blue-800/60 bg-blue-900/70 p-6 sm:p-8"
            >
            <h3 className="mb-2 text-2xl font-semibold text-white">
              Envoyez votre message
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-300">
              Décrivez votre projet, votre contexte et vos besoins. Nous vous recontacterons rapidement.
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Nom"
                  className="rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
                />
              </div>

              <input
                type="text"
                placeholder="Sujet"
                className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />

              <textarea
                rows={6}
                placeholder="Votre message"
                className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Envoyer le message
              </button>
            </form>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}