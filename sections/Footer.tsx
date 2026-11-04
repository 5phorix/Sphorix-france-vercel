import Image from "next/image";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

const pageLinks = [
  { label: "Accueil", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Méthode", href: "/methode" },
];

const legalLinks = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/politique-confidentialite" },
  { label: "Conditions générales", href: "/cgv" },
];

export default function Footer() {
  return (
    <footer className="bg-[#172b27] px-4 py-10 text-white sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/15 pb-9 md:grid-cols-[1.4fr_0.7fr_0.7fr] md:gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Sphorix France, accueil">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white p-1.5">
                <Image src="/logo/logo.png" alt="" width={40} height={40} className="h-full w-full object-contain" />
              </span>
              <span className="text-lg font-bold">Sphorix <span className="text-[#f08a66]">France</span></span>
            </Link>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#d1ddd5]">
              Organiser et améliorer la gestion de votre petite entreprise.
            </p>
            <Link href="/contact#contact-form" className="mt-5 inline-flex rounded-md bg-[#df6a43] px-4 py-2.5 text-base font-semibold text-white transition hover:bg-[#c85332]">
              Nous contacter
            </Link>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">Explorer</h2>
            <ul className="mt-4 space-y-3 text-base text-[#d1ddd5]">
              {pageLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition hover:text-[#d7f280]">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">Écrire ou échanger</h2>
            <ul className="mt-4 space-y-3 text-base text-[#d1ddd5]">
              <li>
                <a href="mailto:contact@sphorix.fr" className="inline-flex items-center gap-2.5 transition hover:text-[#d7f280]">
                  <Mail aria-hidden="true" size={18} />
                  contact@sphorix.fr
                </a>
              </li>
              <li>
                <a href="https://wa.me/+33781525393" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 transition hover:text-[#d7f280]">
                  <MessageCircle aria-hidden="true" size={18} />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/sphorix-france" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 transition hover:text-[#d7f280]">
                  <span aria-hidden="true" className="flex h-[18px] w-[18px] items-center justify-center rounded-sm bg-white text-[11px] font-bold leading-none text-[#172b27]">in</span>
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-5 text-sm text-[#aebeb4] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">© 2026 Sphorix France. Tous droits réservés.</p>
          <nav aria-label="Informations légales" className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">{link.label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}