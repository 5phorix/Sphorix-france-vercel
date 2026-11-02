import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";

import MethodSpiral from "./MethodSpiral";
import MethodTimeline from "./MethodTimeline";
import StockClock from "./StockClock";

const phases = [
  {
    number: "01",
    label: "Échanger",
    title: "Faire le point, simplement",
    summary: "Nous commençons par comprendre votre activité et ce qui vous ferait gagner du temps.",
    steps: [
      {
        title: "Prise de contact",
        detail: "Vous nous écrivez via le formulaire, en quelques clics : votre activité, votre besoin.",
      },
      {
        title: "Traitement de votre demande",
        detail: "Nous la lisons et revenons vers vous rapidement pour préciser les points utiles.",
      },
    ],
  },
  {
    number: "02",
    label: "Comprendre",
    title: "Poser le bon diagnostic",
    summary: "Nous prenons le temps de voir comment vous travaillez et de repérer les vraies priorités.",
    steps: [
      {
        title: "Premier rendez-vous",
        detail: "Sur place ou à distance, nous découvrons votre commerce et votre gestion du stock.",
      },
      {
        title: "Analyse",
        detail: "Nous étudions votre situation, repérons les priorités et proposons un plan d’action clair.",
      },
    ],
  },
  {
    number: "03",
    label: "Mettre en place",
    title: "Organiser et équiper",
    summary: "Nous adaptons la mise en place à votre situation : avec l’outil que vous utilisez déjà ou avec une solution conçue selon votre besoin.",
    steps: [
      {
        title: "Mise en œuvre",
        detail: "Comptage physique, référencement des produits et organisation des données, selon vos priorités.",
      },
      {
        title: "Prise en main de l’outil",
        detail: "Nous travaillons avec votre outil existant s’il répond à votre besoin, ou concevons avec vous un outil adapté. Nous vous accompagnons ensuite dans sa prise en main.",
      },
    ],
  },
  {
    number: "04",
    label: "Faire durer",
    title: "Suivre et ajuster",
    summary: "Votre organisation évolue avec votre activité, au lieu de rester figée après l’inventaire.",
    steps: [
      {
        title: "Suivi et ajustements",
        detail: "Nous repérons les écarts avec vous, puis ajustons : chaque tour affine votre organisation.",
      },
    ],
  },
];

const principles = [
  "Sur place ou à distance, selon votre organisation.",
  "Un interlocuteur unique, du diagnostic au suivi.",
  "Des outils simples, que vous pouvez tenir seul.",
  "Des documents clairs à transmettre à votre expert-comptable.",
];

export default function Projects({ summary = false }: { summary?: boolean }) {
  return (
    <section id="approche" className="bg-white">
      <div className="relative isolate overflow-hidden bg-[#10201d] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-56 -z-10 h-[34rem] w-[34rem] rounded-full bg-[#355c4b]/45 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.8fr] lg:gap-20 lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-[#d7f280]">
              <span className="h-2 w-2 rounded-full bg-[#d7f280]" aria-hidden="true" />
              Notre méthode de travail
            </p>
            <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Une organisation claire.
                <span className="mt-2 block text-[#d7f280]">Qui avance avec vous.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#d1ddd5] sm:text-xl">
                De la première prise de contact au suivi, chaque étape nourrit la suivante. Nous avançons avec vous,
                puis nous ajustons la méthode à mesure que votre activité évolue.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact#contact-form"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#df6a43] px-6 py-3 font-semibold text-white transition hover:bg-[#c85332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7f280] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10201d]"
              >
                Parler de votre activité
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#etapes"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7f280] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10201d]"
              >
                Découvrir les étapes
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#d1ddd5]">
              {["Sur place ou à distance", "Un interlocuteur unique", "À votre rythme"].map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#d7f280]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <MethodSpiral
            phases={phases.map(({ number, label, title, summary }) => ({ number, label, title, summary }))}
          />
        </div>
      </div>

      <div id="etapes" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xl font-semibold leading-snug tracking-tight text-[#c85332] sm:text-2xl">
              Un accompagnement, pas un modèle tout fait
            </p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#17231f] sm:text-5xl">
              Vous savez où l’on va, et pourquoi.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#66756c]">
              Voici comment se déroule un accompagnement Sphorix, de la première conversation aux ajustements du quotidien.
            </p>
          </div>

          <MethodTimeline phases={phases} />

          <div className="mt-16 grid max-w-5xl grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-5 sm:mt-20 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-x-8 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-x-12">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f1c1b2] bg-[#fff8f5] text-[#c85332] ring-4 ring-white sm:h-12 sm:w-12">
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div className="border-l-2 border-[#df6a43] py-1 pl-5 sm:pl-7">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#c85332]">Dans la durée</p>
              <p className="mt-2 text-lg leading-relaxed text-[#52635a] sm:text-xl">
                <strong className="font-semibold text-[#17231f]">Un accompagnement qui évolue.</strong>{" "}
                Le suivi nourrit une nouvelle analyse, et votre organisation s’améliore au fil du temps.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!summary && (
        <>
          <div id="inventaire" className="scroll-mt-24 bg-[#f4f5f0] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-12">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#c85332]">Le stock, du réel au suivi</p>
                  <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#17231f] sm:text-4xl">
                    Un inventaire fiable. Un suivi qui dure.
                  </h2>
                </div>
                <p className="max-w-2xl text-lg leading-relaxed text-[#66756c]">
                  Chaque commerce a ses réalités. Découvrez les cinq étapes qui transforment un comptage en outil de gestion au quotidien.
                </p>
              </div>
              <StockClock />
            </div>
          </div>

          <div className="bg-[#172b27] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
              <div>
                <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Une méthode pensée pour votre réalité.</h2>
                <p className="mt-4 leading-relaxed text-[#d1ddd5]">
                  Vous restez maître de vos outils. Nous vous accompagnons là où vous en avez besoin.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {principles.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 leading-relaxed text-[#e4ece7]">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d7f280]/15 text-[#d7f280]">
                      <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-5 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">On commence par en parler ?</h3>
                <p className="mt-1 text-[#d1ddd5]">Présentez-nous votre activité et votre besoin.</p>
              </div>
              <Link
                href="/contact#contact-form"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#df6a43] px-6 py-3 font-semibold text-white transition hover:bg-[#c85332] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7f280] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172b27]"
              >
                Nous parler de votre besoin
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
