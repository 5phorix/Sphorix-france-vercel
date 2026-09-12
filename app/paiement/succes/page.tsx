import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PaiementSuccesPage() {
  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 py-32 text-center sm:px-6 lg:px-8">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Paiement reçu</p>
      <h1 className="mt-4 text-4xl font-bold text-slate-950">Merci pour votre commande</h1>
      <p className="mx-auto mt-4 max-w-lg text-slate-600">
        Votre paiement est en cours de confirmation. Les instructions d’accès seront envoyées à l’adresse utilisée lors du paiement.
      </p>
      <Link href="/boutique" className="mt-8 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900">
        Retour à la boutique
      </Link>
    </main>
  );
}
