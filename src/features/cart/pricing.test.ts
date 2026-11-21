import { describe, expect, it } from "vitest";
import { priceCart } from "./pricing";

const line = (slug: string, price: number, original = price) => ({ slug, title: slug, thumbnailUrl: null, instructorName: "", originalPriceVnd: original, priceVnd: price });

describe("priceCart", () => {
  it("sums integer VND and savings", () => {
    const q = priceCart([line("a", 1_490_000, 2_990_000), line("b", 0)]);
    expect(q.subtotalVnd).toBe(1_490_000);
    expect(q.savingsVnd).toBe(1_500_000);
    expect(q.totalVnd).toBe(1_490_000);
  });
  it("handles empty cart", () => {
    expect(priceCart([]).totalVnd).toBe(0);
  });
});
