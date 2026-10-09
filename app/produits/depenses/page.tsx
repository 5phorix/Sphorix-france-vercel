import type { Metadata } from "next";

import ExpensesApp from "@/components/products/ExpensesApp";

export const metadata: Metadata = { title: "Sadesk Suivi des Dépenses | Sphorix France", robots: { index: false, follow: false } };

export default function ExpensesProductPage() {
  return <ExpensesApp />;
}