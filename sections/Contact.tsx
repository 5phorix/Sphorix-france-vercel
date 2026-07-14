"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";

export default function Contact() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const openContactForm = useCallback(() => {
    setIsFormVisible(true);
  }, []);

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

    form.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.setTimeout(() => {
      const firstField = form.querySelector(
        "input, textarea"
      ) as HTMLInputElement | HTMLTextAreaElement | null;

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

          <ContactInfo onOpenForm={openContactForm} />

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
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35 }}
            >
              <ContactForm />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}