"use client";
/**
 * Guest cart in localStorage: stores ONLY course slugs, never prices.
 * Prices are always recomputed on the server (features/cart/actions.ts).
 */
const KEY = "ks-cart";
const EVENT = "ks-cart-change";
const MAX_ITEMS = 50;

export function readCart(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === "string" && /^[a-z0-9-]{3,120}$/.test(s)).slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set(slugs)].slice(0, MAX_ITEMS)));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(slug: string): boolean {
  const cur = readCart();
  if (cur.includes(slug)) return false; // no duplicates
  write([...cur, slug]);
  return true;
}

export function removeFromCart(slug: string) {
  write(readCart().filter((s) => s !== slug));
}

export function subscribeCart(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
