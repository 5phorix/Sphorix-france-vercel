"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type ContactType = "particulier" | "entreprise";

export default function ContactForm() {
  const [contactType, setContactType] = useState<ContactType>("particulier");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [siret, setSiret] = useState("");
  const [activity, setActivity] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const startedAtRef = useRef(0);
  const retentionMonths = 24;
  const policyVersion = "2026-07";

  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!consent) {
      setErrorMessage("Veuillez accepter la politique de confidentialité.");
      return;
    }

    setIsSending(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactType,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
          companyName: companyName.trim(),
          companyRole: companyRole.trim(),
          siret: siret.trim(),
          activity: activity.trim(),
          consent,
          marketingConsent,
          retentionMonths,
          policyVersion,
          website,
          startedAt: startedAtRef.current || Date.now(),
        }),
      });

      const result = await response.json().catch(() => ({
        error: "Réponse serveur invalide.",
      }));

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'envoi.");
      }

      setSuccessMessage(
        "Merci pour votre message. Nous vous répondrons rapidement."
      );

      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setCompanyName("");
      setCompanyRole("");
      setSiret("");
      setActivity("");
      setConsent(false);
      setMarketingConsent(false);
      setWebsite("");
      startedAtRef.current = 0;

    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'envoi du message."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      id="contact-form"
      className="scroll-mt-24 rounded-[28px] border border-blue-800/60 bg-blue-900/70 p-6 sm:p-8"
    >
      <h3 className="mb-2 text-2xl font-semibold text-white">
        Envoyez votre message
      </h3>

      <p className="mb-6 text-sm leading-relaxed text-slate-300">
        Décrivez votre projet, votre contexte et vos besoins. Nous vous
        recontacterons rapidement.
      </p>

      <form
        className="space-y-5"
        onSubmit={handleSubmit}
        onFocusCapture={() => {
          if (startedAtRef.current === 0) {
            startedAtRef.current = Date.now();
          }
        }}
      >
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
            Votre profil
          </legend>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white">
              <input
                type="radio"
                name="contactType"
                value="particulier"
                checked={contactType === "particulier"}
                onChange={() => setContactType("particulier")}
                className="h-4 w-4 accent-orange-500"
              />
              Particulier
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white">
              <input
                type="radio"
                name="contactType"
                value="entreprise"
                checked={contactType === "entreprise"}
                onChange={() => setContactType("entreprise")}
                className="h-4 w-4 accent-orange-500"
              />
              Entreprise
            </label>
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300">
              Nom complet
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Marie Dupont"
              autoComplete="name"
              minLength={2}
              maxLength={120}
              required
              className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300">
              Email professionnel
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: contact@entreprise.fr"
              autoComplete="email"
              maxLength={160}
              required
              className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300">
              Téléphone
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +33 6 12 34 56 78"
              autoComplete="tel"
              maxLength={25}
              className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300">
              Objet
            </span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Audit de gestion"
              minLength={4}
              maxLength={140}
              required
              className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            />
          </label>
        </div>

        {contactType === "entreprise" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300">
                Entreprise
              </span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Sphorix France"
                autoComplete="organization"
                minLength={2}
                maxLength={120}
                required={contactType === "entreprise"}
                className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300">
                Fonction
              </span>
              <input
                type="text"
                value={companyRole}
                onChange={(e) => setCompanyRole(e.target.value)}
                placeholder="Ex: Dirigeant"
                maxLength={80}
                className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300">
                SIRET (optionnel)
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={siret}
                onChange={(e) => setSiret(e.target.value.replace(/\D/g, "").slice(0, 14))}
                placeholder="14 chiffres"
                pattern="[0-9]{14}"
                maxLength={14}
                className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300">
                Secteur d’activité
              </span>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Ex: Services B2B"
                minLength={2}
                maxLength={120}
                required={contactType === "entreprise"}
                className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
              />
            </label>
          </div>
        )}

        <label className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300">
            Votre message
          </span>
          <textarea
            rows={7}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez votre contexte, vos objectifs et le niveau d’accompagnement souhaité."
            minLength={20}
            maxLength={2500}
            required
            className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          />
        </label>

        <label className="hidden" aria-hidden="true">
          Site web
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-blue-800/50 bg-blue-950/40 p-4 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
          />
          <span>
            J’accepte que mes informations soient utilisées uniquement pour être
            recontacté dans le cadre de ma demande conformément à la{" "}
            <Link
              href="/politique-confidentialite"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-orange-300 underline underline-offset-4"
            >
              politique de confidentialité
            </Link>
            .
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-blue-800/50 bg-blue-950/40 p-4 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
          />
          <span>
            J’accepte de recevoir des informations ponctuelles sur les services
            Sphorix (optionnel).
          </span>
        </label>

        <button
          type="submit"
          disabled={isSending}
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-50"
        >
          {isSending ? "Envoi..." : "Envoyer le message"}
        </button>

        {errorMessage && (
          <p className="mt-2 text-sm font-medium text-red-300">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mt-4 text-sm font-medium text-green-400">
            {successMessage}
          </p>
        )}
      </form>
    </div>
  );
}