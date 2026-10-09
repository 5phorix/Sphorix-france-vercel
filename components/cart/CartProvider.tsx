"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  quantity: number;
};

export function mergeCartItem(current: CartItem[], item: Omit<CartItem, "quantity">): CartItem[] {
  const existing = current.find((entry) => entry.id === item.id);
  if (existing) {
    return current.map((entry) => entry.id === item.id
      ? { ...entry, quantity: entry.quantity + 1 }
      : entry);
  }
  return [...current, { ...item, quantity: 1 }];
}

export function updateCartItemQuantity(current: CartItem[], id: string, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return current.filter((item) => item.id !== id);
  }

  return current.map((item) => item.id === id ? { ...item, quantity } : item);
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "sphorix-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function readStoredItems(): CartItem[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setItems(readStoredItems());
      setIsStorageLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!isStorageLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [isStorageLoaded, items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    totalCents: items.reduce((total, item) => total + item.priceCents * item.quantity, 0),
    addItem: (item) => {
      setItems((current) => mergeCartItem(current, item));
    },
    removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
    updateQuantity: (id, quantity) => {
      setItems((current) => updateCartItemQuantity(current, id, quantity));
    },
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart doit être utilisé dans CartProvider.");
  return context;
}
