import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AccountingPrep from "./AccountingPrep";
import EInvoicing from "./EInvoicing";

const offer = [
  {
    title: "Un comptage physique, produit par produit",
    text: "Nous comptons votre stock réel et identifions chaque article, même sans code-barres.",
    image: "/accueil/inventaire.webp",
  },
  {
    title: "Un fichier de stock adapté à votre commerce",
    text: "Vos produits sont référencés et organisés dans un fichier clair, à votre image.",
    image: "/accueil/referencement.webp",
  },
  {
    title: "Un outil simple pour suivre et décider",
    text: "Mouvements, écarts, produits à surveiller : l'essentiel, facile à tenir à jour.",
    image: "/accueil/suivi.webp",
  },
];

export default function Services({ summary = false }: { summary?: boolean }) {
  return (
    <>
      <section
        id="services"
        className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase text-[#c85332]">
            Notre offre
          </p>
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-[#17231f] sm:text-5xl">
            Un inventaire fiable, puis un suivi qui dure.
          </h2>

          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {offer.map((item) => (
              <li
                key={item.title}
                className="overflow-hidden rounded-2xl border border-[#e0e6e0] bg-[#f4f5f0]"
              >
                <div className="relative aspect-[4/3] bg-white">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-contain"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-[#17231f]">{item.title}</h3>
                  <p className="mt-2 text-[#66756c]">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>

          {summary && (
            <Link
              href="/services"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-[#355c4b] hover:text-[#c85332]"
            >
              Voir l&apos;offre
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>
      {!summary && (
        <>
          <EInvoicing />
          <AccountingPrep detailed />
          <section className="bg-[#172b27] px-4 py-16 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Un besoin précis ? Parlons de votre commerce.
              </h2>
              <p className="mt-4 text-[#d7e3da]">
                Décrivez votre activité en quelques clics, nous vous répondons rapidement.
              </p>
              <Link
                href="/contact#contact-form"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#df6a43] px-6 py-3 font-semibold text-white transition hover:bg-[#c85332]"
              >
                Nous contacter
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  );
}
