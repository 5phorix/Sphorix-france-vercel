"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Profile = { email: string; name: string; avatarUrl: string | null };

export default function UserMenu({ guestHref = "/connexion", guestLabel = "Mon espace" }: { guestHref?: string; guestLabel?: string | null }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let supabase: ReturnType<typeof createSupabaseBrowserClient>;
    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      return;
    }

    const apply = (user: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined) => {
      if (!user) return setProfile(null);
      const meta = user.user_metadata ?? {};
      const avatar = (meta.avatar_url ?? meta.picture) as string | undefined;
      setImageFailed(false);
      setProfile({
        email: user.email ?? "",
        name: String(meta.full_name ?? meta.name ?? user.email ?? ""),
        avatarUrl: typeof avatar === "string" && avatar.startsWith("https://") ? avatar : null,
      });
    };

    supabase.auth.getUser().then(({ data }) => { apply(data.user); setReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const signOut = async () => {
    await createSupabaseBrowserClient().auth.signOut();
    setOpen(false);
    router.replace("/");
    router.refresh();
  };

  if (!ready) return null;

  if (!profile) {
    return guestLabel ? (
      <Link href={guestHref} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-[#34443b] transition hover:border-[#df6a43] hover:text-[#c85332]">
        {guestLabel}
      </Link>
    ) : null;
  }

  const initials = (profile.name || profile.email).trim().slice(0, 2).toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Menu du compte"
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-slate-200 bg-[#168a79] text-xs font-bold text-white shadow-sm transition hover:ring-2 hover:ring-[#df6a43]/50"
      >
        {profile.avatarUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt="" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
        ) : initials}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-xl">
          <p className="truncate px-3 py-2 text-xs font-semibold text-slate-500">{profile.email}</p>
          <Link href="/compte" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-50">Mon profil et ma photo</Link>
          <button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-medium text-red-700 hover:bg-red-50">
            <LogOut className="h-4 w-4" aria-hidden="true" />Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
