"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Boxes, Coins, Target } from "lucide-react";

const scenes = [
  {
    icon: Boxes,
    label: "Stock",
    title: "Ce que j'ai vraiment en rayon",
    bars: [78, 52, 14, 90, 33],
    note: "3 produits à recommander",
  },
  {
    icon: Coins,
    label: "Ventes",
    title: "Ce qu'il me reste après tout",
    bars: [90, 64, 40, 28, 55],
    note: "Marge réelle : + 1 240 €",
  },
  {
    icon: Target,
    label: "Décisions",
    title: "Quoi vendre, quoi recommander",
    bars: [30, 85, 60, 95, 20],
    note: "Top 5 produits rentables",
  },
];

export default function DemoAnimation() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % scenes.length), 3500);
    return () => window.clearInterval(timer);
  }, []);

  const scene = scenes[index];
  const Icon = scene.icon;

  return (
    <div className="absolute inset-0 flex flex-col bg-[#172b27] p-5 text-white sm:p-8">
      <div className="flex items-center gap-2">
        {scenes.map((s, i) => (
          <span
            key={s.label}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              i === index ? "bg-[#df6a43] text-white" : "bg-white/10 text-[#aebeb4]"
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>

      <motion.div
        key={index}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-5 flex flex-1 flex-col"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#df6a43]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-base font-semibold sm:text-xl">{scene.title}</p>
        </div>

        <div className="mt-6 flex flex-1 items-end gap-3 sm:gap-5">
          {scene.bars.map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className={`flex-1 rounded-t-md ${height < 25 ? "bg-[#df6a43]" : "bg-[#d7f280]"}`}
            />
          ))}
        </div>

        <p className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-[#d7f280]">{scene.note}</p>
      </motion.div>
    </div>
  );
}
