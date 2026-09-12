import QuoteWizard from "@/components/quote/QuoteWizard";

export default function DemandeDevisPage() {
  return (
    <main className="min-h-screen bg-[#f4f0e9] px-4 pb-20 pt-28 text-slate-950 sm:px-6 sm:pt-36 lg:px-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-600 sm:text-sm">
            Demande de devis
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Évaluez votre projet en quelques minutes
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Répondez à quelques questions afin d&apos;obtenir une première
            estimation personnalisée de votre besoin.
          </p>
        </div>

        <QuoteWizard />

      </div>
    </main>
  );
}