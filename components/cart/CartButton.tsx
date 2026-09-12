"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/cart/CartProvider";

export default function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/panier"
      aria-label={`Panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 transition hover:border-orange-400 hover:text-orange-700"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
