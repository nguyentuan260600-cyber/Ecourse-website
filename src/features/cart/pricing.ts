export interface QuoteLine {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  instructorName: string;
  originalPriceVnd: number;
  priceVnd: number;
}

export interface CartQuote {
  lines: QuoteLine[];
  missing: string[];
  subtotalVnd: number;
  savingsVnd: number;
  totalVnd: number;
}

/** Pure, integer-only pricing. Coupons are applied in Milestone 3 (server-side). */
export function priceCart(lines: QuoteLine[], missing: string[] = []): CartQuote {
  const subtotal = lines.reduce((s, l) => s + l.priceVnd, 0);
  const original = lines.reduce((s, l) => s + Math.max(l.originalPriceVnd, l.priceVnd), 0);
  return { lines, missing, subtotalVnd: subtotal, savingsVnd: original - subtotal, totalVnd: subtotal };
}
