"use client";

import { useState, type ChangeEvent } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const ALLOWED_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 2 * 1024 * 1024;

export default function AvatarUploader({ userId, initialUrl, initials }: { userId: string; initialUrl: string | null; initials: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setMessage("");
    setError("");

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) return setError("Format accepté : JPG, PNG ou WebP.");
    if (file.size > MAX_BYTES) return setError("L’image ne doit pas dépasser 2 Mo.");

    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const path = `${userId}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });
      if (updateError) throw updateError;

      const { data: existing } = await supabase.storage.from("avatars").list(userId);
      const stale = (existing ?? []).map((item) => `${userId}/${item.name}`).filter((name) => name !== path);
      if (stale.length) await supabase.storage.from("avatars").remove(stale);

      setUrl(data.publicUrl);
      setMessage("Photo de profil mise à jour.");
    } catch {
      setError("Impossible d’enregistrer la photo. Réessayez.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-[#168a79] text-xl font-bold text-white">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Photo de profil" className="h-full w-full object-cover" />
        ) : initials}
      </span>
      <div>
        <label className={`inline-block cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-400 hover:text-orange-700 ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? "Envoi…" : url ? "Changer la photo" : "Ajouter une photo"}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="sr-only" />
        </label>
        <p className="mt-1 text-xs text-slate-500">JPG, PNG ou WebP, 2 Mo maximum.</p>
        <div aria-live="polite">
          {message && <p role="status" className="mt-1 text-xs font-medium text-emerald-700">{message}</p>}
          {error && <p role="alert" className="mt-1 text-xs font-medium text-red-700">{error}</p>}
        </div>
      </div>
    </div>
  );
}
