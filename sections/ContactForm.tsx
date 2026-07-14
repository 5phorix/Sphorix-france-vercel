"use client";

import { useState } from "react";

export default function ContactForm() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsSending(true);
    setSuccessMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom,
          email,
          sujet,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'envoi.");
      }

      setSuccessMessage(
        "Merci pour votre message. Nous vous répondrons rapidement."
      );

      setNom("");
      setEmail("");
      setSujet("");
      setMessage("");

    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'envoi du message.");
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

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom"
            required
            className="rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
          />
        </div>

        <input
          type="text"
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          placeholder="Sujet"
          required
          className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
        />

        <textarea
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre message"
          required
          className="w-full rounded-xl border border-blue-800/70 bg-blue-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
        />

        <button
          type="submit"
          disabled={isSending}
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-50"
        >
          {isSending ? "Envoi..." : "Envoyer le message"}
        </button>

        {successMessage && (
          <p className="mt-4 text-sm font-medium text-green-400">
            {successMessage}
          </p>
        )}
      </form>
    </div>
  );
}