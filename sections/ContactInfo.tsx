"use client";

import { motion } from "framer-motion";

interface ContactInfoProps {
  onOpenForm: () => void;
}

export default function ContactInfo({ onOpenForm }: ContactInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col justify-center"
    >
      <p className="mb-3 text-xs font-bold uppercase text-[#d7f280]">
        Le prochain pas
      </p>

      <h2 className="mb-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
        Parlons de votre écosystème.
      </h2>

      <p className="mb-8 max-w-2xl text-base leading-relaxed text-[#d1ddd5] sm:text-lg">
        Décrivez les outils que vous utilisez, les processus à automatiser et les informations dont vous avez besoin pour décider. Nous verrons comment les réunir dans une application adaptée à votre activité.
      </p>

      <div className="mb-8 grid gap-5 text-sm text-[#d1ddd5] sm:grid-cols-3 lg:text-[18px]">
        <div className="border-l border-[#df6a43] pl-4">
          <h3 className="font-semibold text-white">Vos logiciels</h3>
          <p className="mt-1 leading-relaxed lg:text-[18px]">Les plateformes, logiciels et banques à relier.</p>
        </div>
        <div className="border-l border-[#df6a43] pl-4">
          <h3 className="font-semibold text-white">Vos processus</h3>
          <p className="mt-1 leading-relaxed lg:text-[18px]">Les étapes qui prennent du temps ou manquent de fiabilité.</p>
        </div>
        <div className="border-l border-[#df6a43] pl-4">
          <h3 className="font-semibold text-white">Vos indicateurs</h3>
          <p className="mt-1 leading-relaxed lg:text-[18px]">La vue dont vous avez besoin pour décider.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="#contact-form"
          onClick={(event) => {
            event.preventDefault();
            onOpenForm();
          }}
          className="inline-flex items-center justify-center rounded-md bg-[#df6a43] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c85332]"
        >
          Prendre contact
        </a>

        <a
          href="https://wa.me/+33781525393"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md border border-[#6a8278] px-6 py-3 text-sm font-semibold text-[#e4ebe5] transition hover:border-[#d7f280] hover:text-[#d7f280]"
        >
          Échanger sur WhatsApp
        </a>
      </div>
    </motion.div>
  );
}