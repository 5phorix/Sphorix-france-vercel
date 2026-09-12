"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";

interface AddToCartButtonProps {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
}

export default function AddToCartButton(props: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(props);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition ${added ? "bg-emerald-600 text-white" : "bg-slate-950 text-white hover:bg-blue-900"}`}
    >
      {added ? <Check className="h-4 w-4" aria-hidden="true" /> : <ShoppingBag className="h-4 w-4" aria-hidden="true" />}
      {added ? "Ajouté au panier" : "Ajouter au panier"}
    </button>
  );
}
