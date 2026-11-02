"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const activities = ["Artisan", "Petite boutique", "Commerce indépendant", "Autre"];

const needs = [
  "Compter mon stock",
  "Référencer mes produits",
  "Un fichier de stock sur mesure",
  "Repérer les écarts",
  "Un outil de suivi simple",
  "Documents pour mon expert-comptable",
  "Facturation électronique",
];

const sizes = ["Moins de 100", "100 à 500", "500 à 2 000", "Plus de 2 000", "Je ne sais pas"];

const channels = ["Email", "Téléphone", "WhatsApp"];

const steps = ["Votre activité", "Votre besoin", "Vos coordonnées"];

const chip = (active: boolean) =>
  `inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-base font-medium transition ${
    active
      ? "border-[#df6a43] bg-[#df6a43] text-white shadow-sm"
      : "border-slate-200 bg-white text-slate-700 hover:border-[#df6a43] hover:text-[#c85332]"
  }`;

const tips: Record<string, string> = {
  Artisan: "Matières, pièces, produits finis : chaque article a sa place dans le stock.",
  "Petite boutique": "Des références nombreuses et un rayon qui bouge : le comptage fait la différence.",
  "Commerce indépendant": "Plusieurs sources d'achat et de vente : tout est relié au même stock.",
  Autre: "Dites-nous votre activité, nous adaptons la méthode.",
};

function Chip({
  active,
  index = 0,
  onClick,
  children,
}: {
  active: boolean;
  index?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.045, type: "spring", stiffness: 380, damping: 22 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.93 }}
      className={chip(active)}
    >
      <AnimatePresence initial={false}>
        {active && (
          <motion.span
            initial={{ width: 0, opacity: 0, scale: 0 }}
            animate={{ width: 16, opacity: 1, scale: 1 }}
            exit={{ width: 0, opacity: 0, scale: 0 }}
            className="inline-flex overflow-hidden"
          >
            <Check aria-hidden="true" className="h-4 w-4 shrink-0" />
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  );
}

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#df6a43] focus:ring-2 focus:ring-[#df6a43]/20";

export default function ContactForm() {
  const [step, setStep] = useState(0);
  const [activity, setActivity] = useState("");
  const [otherActivity, setOtherActivity] = useState("");
  const [shopName, setShopName] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [size, setSize] = useState("");
  const [note, setNote] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("Email");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const startedAtRef = useRef(0);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const toggleNeed = (need: string) =>
    setSelectedNeeds((current) =>
      current.includes(need) ? current.filter((item) => item !== need) : [...current, need]
    );

  const validateStep = (index: number): string => {
    if (index === 0) {
      if (!activity) return "Choisissez votre type d'activité.";
      if (activity === "Autre" && otherActivity.trim().length < 2) {
        return "Précisez votre activité.";
      }
      if (shopName.trim().length < 2) return "Indiquez le nom de votre commerce ou activité.";
    }
    if (index === 1 && selectedNeeds.length === 0) {
      return "Sélectionnez au moins un besoin.";
    }
    if (index === 2) {
      if (fullName.trim().length < 2) return "Indiquez votre nom.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim())) return "Adresse email invalide.";
      if (channel !== "Email" && !phone.trim()) return "Indiquez votre numéro pour être rappelé.";
      if (!consent) return "Veuillez accepter la politique de confidentialité.";
    }
    return "";
  };

  const next = () => {
    const problem = validateStep(step);
    setError(problem);
    if (!problem) setStep(step + 1);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < 2) {
      next();
      return;
    }

    const problem = validateStep(2);
    setError(problem);
    if (problem) return;

    const activityDetails = activity === "Autre" ? otherActivity.trim() : activity;
    const message = [
      `Activité : ${activityDetails} (${shopName.trim()})`,
      `Besoins : ${selectedNeeds.join(", ")}`,
      size ? `Nombre de références : ${size}` : "",
      `Contact préféré : ${channel}`,
      note.trim() ? `Précisions : ${note.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setIsSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactType: "entreprise",
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: `${activityDetails} : ${selectedNeeds[0]}`.slice(0, 140),
          message,
          companyName: shopName.trim(),
          companyRole: "",
          siret: "",
          activity: activityDetails,
          consent,
          marketingConsent: false,
          website,
          startedAt: startedAtRef.current,
        }),
      });

      const result = await response.json().catch(() => ({ error: "Réponse serveur invalide." }));
      if (!response.ok) throw new Error(result.error || "Erreur lors de l'envoi.");
      setSent(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      id="contact-form"
      className="scroll-mt-24 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center px-6 py-16 text-center sm:px-10"
        >
          <span className="relative flex h-16 w-16 items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full bg-[#d7f280]"
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <motion.span
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#172b27] text-[#d7f280]"
            >
              <Check aria-hidden="true" className="h-8 w-8" />
            </motion.span>
          </span>
          <h3 className="mt-6 text-[26px] font-bold text-slate-950">Merci, c&apos;est bien reçu.</h3>
          <p className="mt-3 max-w-md text-slate-600">
            Nous revenons vers vous rapidement, par {channel.toLowerCase()}, pour fixer un premier échange.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={submit} noValidate className="grid lg:grid-cols-[0.8fr_1.4fr]">
          <aside className="bg-[#172b27] p-6 text-white sm:p-8 lg:p-10">
            <h3 className="text-[26px] font-semibold leading-tight">Parlons de votre commerce.</h3>
            <p className="mt-3 text-base leading-relaxed text-[#d1ddd5]">
              Trois questions rapides, une minute. Nous préparons ensuite l&apos;échange avec vous.
            </p>
            <ol className="mt-8 space-y-4">
              {steps.map((label, index) => (
                <li
                  key={label}
                  aria-current={index === step ? "step" : undefined}
                  className="flex items-center gap-3 text-base"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                      index < step
                        ? "bg-[#d7f280] text-[#172b27]"
                        : index === step
                          ? "bg-[#df6a43] text-white"
                          : "border border-[#45635a] text-[#8fa59b]"
                    }`}
                  >
                    {index < step ? <Check aria-hidden="true" className="h-4 w-4" /> : index + 1}
                  </span>
                  <span className={index === step ? "font-semibold text-white" : "text-[#8fa59b]"}>
                    {label}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-8 border-t border-[#29483f] pt-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activity || "none"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-base leading-relaxed text-[#d1ddd5]"
                >
                  {activity ? tips[activity] : "Choisissez votre activité : nous adaptons la suite."}
                </motion.p>
              </AnimatePresence>

              <div className="mt-4 flex flex-wrap gap-2">
                <AnimatePresence>
                  {selectedNeeds.map((need) => (
                    <motion.span
                      key={need}
                      layout
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      className="rounded-full bg-[#d7f280] px-3 py-1 text-sm font-semibold text-[#172b27]"
                    >
                      {need}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </aside>

          <div className="p-6 sm:p-8 lg:p-10">
            <div
              role="progressbar"
              aria-label="Progression du formulaire"
              aria-valuemin={1}
              aria-valuemax={steps.length}
              aria-valuenow={step + 1}
              className="h-1 overflow-hidden rounded-full bg-slate-100"
            >
              <motion.div
                className="h-full bg-[#df6a43]"
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                aria-hidden="true"
              />
            </div>

            <div className="relative mt-8 min-h-[22rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {step === 0 && (
                    <>
                      <fieldset>
                        <legend className="mb-3 text-base font-semibold text-slate-900">Votre activité</legend>
                        <div className="flex flex-wrap gap-2.5">
                          {activities.map((item, i) => (
                            <Chip key={item} index={i} active={activity === item} onClick={() => setActivity(item)}>
                              {item}
                            </Chip>
                          ))}
                        </div>
                      </fieldset>
                      {activity === "Autre" && (
                        <div>
                          <label htmlFor="other-activity" className="mb-2 block text-base font-semibold text-slate-900">
                            Précisez votre activité
                          </label>
                          <input
                            id="other-activity"
                            value={otherActivity}
                            onChange={(e) => setOtherActivity(e.target.value)}
                            placeholder="Ex. fleuriste, ébéniste…"
                            className={field}
                            maxLength={120}
                          />
                        </div>
                      )}
                      <div>
                        <label htmlFor="shop" className="mb-2 block text-base font-semibold text-slate-900">
                          Nom de votre commerce ou activité
                        </label>
                        <input
                          id="shop"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          placeholder="Ex. Atelier Martin, Boutique du Port…"
                          autoComplete="organization"
                          className={field}
                          maxLength={120}
                        />
                      </div>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <fieldset>
                        <legend className="mb-3 text-base font-semibold text-slate-900">
                          Ce que vous cherchez <span className="font-normal text-slate-500">(plusieurs choix possibles)</span>
                        </legend>
                        <div className="flex flex-wrap gap-2.5">
                          {needs.map((item, i) => (
                            <Chip key={item} index={i} active={selectedNeeds.includes(item)} onClick={() => toggleNeed(item)}>
                              {item}
                            </Chip>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset>
                        <legend className="mb-3 text-base font-semibold text-slate-900">
                          Combien de produits environ ? <span className="font-normal text-slate-500">(optionnel)</span>
                        </legend>
                        <div className="flex flex-wrap gap-2.5">
                          {sizes.map((item, i) => (
                            <Chip key={item} index={i} active={size === item} onClick={() => setSize(size === item ? "" : item)}>
                              {item}
                            </Chip>
                          ))}
                        </div>
                      </fieldset>
                      <div>
                        <label htmlFor="contact-note" className="mb-2 block text-base font-semibold text-slate-900">
                          Une précision sur votre situation <span className="font-normal text-slate-500">(optionnel)</span>
                        </label>
                        <textarea
                          id="contact-note"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          maxLength={1000}
                          placeholder="Décrivez brièvement votre contexte"
                          className={field}
                        />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="full-name" className="mb-2 block text-base font-semibold text-slate-900">
                            Votre nom
                          </label>
                          <input
                            id="full-name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Prénom et nom"
                            autoComplete="name"
                            required
                            className={field}
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="mb-2 block text-base font-semibold text-slate-900">
                            Votre email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vous@exemple.fr"
                            autoComplete="email"
                            inputMode="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            required
                            className={field}
                          />
                        </div>
                      </div>
                      <fieldset>
                        <legend className="mb-3 text-base font-semibold text-slate-900">
                          Comment préférez-vous être contacté ?
                        </legend>
                        <div className="flex flex-wrap gap-2.5">
                          {channels.map((item, i) => (
                            <Chip key={item} index={i} active={channel === item} onClick={() => setChannel(item)}>
                              {item}
                            </Chip>
                          ))}
                        </div>
                      </fieldset>
                      <div>
                        <label htmlFor="phone" className="mb-2 block text-base font-semibold text-slate-900">
                          Téléphone {channel === "Email" && <span className="font-normal text-slate-500">(optionnel)</span>}
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={channel === "Email" ? "Votre numéro (facultatif)" : "Votre numéro"}
                          autoComplete="tel"
                          required={channel !== "Email"}
                          className={field}
                        />
                      </div>
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="hidden"
                      />
                      <label className="flex items-start gap-3 text-base text-slate-600">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          required
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[#df6a43]"
                        />
                        <span>
                          J&apos;accepte que mes informations servent uniquement à me recontacter, selon la{" "}
                          <Link
                            href="/politique-confidentialite"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#c85332] underline underline-offset-4"
                          >
                            politique de confidentialité
                          </Link>
                          .
                        </span>
                      </label>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  key={error}
                  role="alert"
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-2 rounded-xl bg-red-50 p-3.5 text-base font-medium text-red-700"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep(step - 1);
                  }}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-base font-semibold text-slate-600 transition hover:text-slate-950"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Retour
                </button>
              ) : (
                <span />
              )}

              {step < 2 ? (
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[#172b27] px-7 py-3.5 text-base font-bold text-white transition hover:bg-[#df6a43]"
                >
                  Continuer
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-2 rounded-full bg-[#df6a43] px-7 py-3.5 text-base font-bold text-white transition hover:bg-[#c85332] disabled:opacity-50"
                >
                  {isSending ? "Envoi…" : "Envoyer ma demande"}
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
