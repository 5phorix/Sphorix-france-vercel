"use client";

import { BarChart3, Calculator, Globe, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const icons = [
  {
    Icon: BarChart3,
    label: "Tableaux de bord",
    iconColor: "text-orange-500",
    badgeColor: "bg-orange-500/15 border-orange-400/40",
    labelColor: "text-orange-500",
    delay: 0,
  },
  {
    Icon: RefreshCw,
    label: "Processus",
    iconColor: "text-sky-600",
    badgeColor: "bg-sky-500/15 border-sky-400/40",
    labelColor: "text-orange-500",
    delay: 0.6,
  },
  {
    Icon: Globe,
    label: "Digital",
    iconColor: "text-amber-500",
    badgeColor: "bg-amber-500/15 border-amber-400/40",
    labelColor: "text-orange-500",
    delay: 1.2,
  },
  {
    Icon: Calculator,
    label: "Comptabilité",
    iconColor: "text-emerald-600",
    badgeColor: "bg-emerald-500/15 border-emerald-400/40",
    labelColor: "text-orange-500",
    delay: 1.8,
  },
];

export default function FloatingIcons() {
  return (
    <div className="pointer-events-none fixed right-2 top-2 z-0 hidden lg:flex flex-col items-center gap-16 opacity-95 xl:right-5">
      <div className="h-64 w-px bg-gradient-to-b from-transparent via-slate-800/95 to-transparent" />
      {icons.map(({ Icon, label, iconColor, badgeColor, labelColor, delay }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: [0.9, 1, 0.9], y: [0, 10, 0] }}
          transition={{
            duration: 5,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center"
          aria-label={label}
        >
          <div className={`rounded-full border p-3.5 shadow-[0_0_20px_rgba(15,23,42,0.18)] backdrop-blur-sm ${badgeColor}`}>
            <Icon className={`h-8.5 w-8.5 xl:h-9.5 xl:w-9.5 ${iconColor}`} />
          </div>
          <span className={`mt-2 text-[9px] font-black uppercase tracking-[0.32em] ${labelColor}`}>
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
