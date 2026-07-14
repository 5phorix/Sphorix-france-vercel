import QuoteWizard from "@/components/quote/QuoteWizard";

export default function DemandeDevisPage() {
  return (
    <main className="min-h-screen bg-blue-950 px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-12 text-center">
          <p className="mb-3 font-semibold tracking-[0.2em] text-orange-400">
            DEMANDE DE DEVIS
          </p>

          <h1 className="text-3xl font-bold sm:text-5xl">
            Évaluez votre projet en quelques minutes
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-slate-300">
            Répondez à quelques questions afin d'obtenir une première
            estimation personnalisée de votre besoin.
          </p>
        </div>

        <QuoteWizard />

      </div>
    </main>
  );
}