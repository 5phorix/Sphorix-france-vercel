import Link from "next/link";
import { redirect } from "next/navigation";

import ProfileForm from "@/components/account/ProfileForm";
import SignOutButton from "@/components/account/SignOutButton";
import { formatPrice } from "@/lib/catalogue-format";
import { prepareAccountData } from "@/lib/account";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { profile, orders, downloads } = await prepareAccountData(user.id, user.email ?? "");

  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Espace client</p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Bonjour {profile.fullName || user.email}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Gérez vos informations, commandes et accès à vos fichiers.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/mot-de-passe-oublie"
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-orange-400 hover:text-orange-700 transition"
              >
                Changer de mot de passe
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>

        {/* Formulaire de profil */}
        <ProfileForm profile={profile} userEmail={user.email ?? ""} />

        {/* Commandes et téléchargements */}
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] bg-white p-7 shadow-sm sm:p-10">
            <h2 className="text-2xl font-bold text-slate-950">Vos commandes</h2>
            {orders.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-slate-600">Aucune commande associée à ce compte.</p>
            ) : (
              <div className="mt-6 space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Commande du {new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-emerald-600">{order.status === "paid" ? "Payée" : order.status}</p>
                    </div>
                    <span className="font-bold text-slate-950">{formatPrice(order.totalCents, order.currency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl sm:p-10">
            <h2 className="text-2xl font-bold">Vos téléchargements</h2>
            {downloads.length === 0 ? (
              <p className="mt-4 text-sm leading-relaxed text-slate-400">Vos fichiers achetés apparaîtront ici.</p>
            ) : (
              <div className="mt-6 space-y-3">
                {downloads.map((download) => (
                  <a key={download.id} href={`/api/downloads/${download.id}`} className="block rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:border-orange-300">
                    <p className="text-sm font-semibold text-white">{download.productName}</p>
                    <p className="mt-1 text-xs text-slate-400">{download.originalName}</p>
                    <p className="mt-3 text-xs font-semibold text-orange-300">Télécharger</p>
                  </a>
                ))}
              </div>
            )}
            <Link href="/boutique" className="mt-6 inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:border-orange-300 hover:text-orange-200">Voir la boutique</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
