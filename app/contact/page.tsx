import type { Metadata } from "next";

import Navbar from "@/sections/Navbar";
import Contact from "@/sections/Contact";
import Footer from "@/sections/Footer";

export const metadata: Metadata = {
  title: "Contact | Sphorix France",
  description: "Contactez-nous pour un premier diagnostic de votre commerce.",
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
