import type { Metadata } from "next";

import Navbar from "@/sections/Navbar";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";

export const metadata: Metadata = {
  title: "Contact | Sphorix France",
  description:
    "Parlons des outils à connecter, des processus à automatiser et des informations dont votre PME a besoin pour décider.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <Contact showForm />
      </main>
      <Footer />
    </>
  );
}
