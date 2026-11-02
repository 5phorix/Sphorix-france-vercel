"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import ContactForm from "./ContactForm";

interface ContactProps {
  showForm?: boolean;
}

export default function Contact({ showForm = false }: ContactProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const openContactForm = useCallback(() => {
    setIsFormVisible(true);
  }, []);

  const openIfHashTargetsForm = useCallback(() => {
    if (window.location.hash === "#contact-form") {
      setIsFormVisible(true);
    }
  }, []);

  useEffect(() => {
    const listener = () => openContactForm();

    window.addEventListener("open-contact-form", listener);

    return () => {
      window.removeEventListener("open-contact-form", listener);
    };
  }, [openContactForm]);

  useEffect(() => {
    window.addEventListener("hashchange", openIfHashTargetsForm);

    return () => {
      window.removeEventListener("hashchange", openIfHashTargetsForm);
    };
  }, [openIfHashTargetsForm]);

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
      className="scroll-mt-20 border-t border-[#29483f] bg-[#172b27] px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <AnimatePresence mode="wait">
          {(isFormVisible || showForm) && (
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