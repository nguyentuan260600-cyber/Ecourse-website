import { describe, expect, it } from "vitest";
import { discountPercent, formatClock, formatDuration, formatVnd } from "./format";

describe("formatVnd", () => {
  it("formats integer VND with vi-VN grouping", () => {
    expect(formatVnd(1490000)).toBe("1.490.000đ");
    expect(formatVnd(0)).toBe("0đ");
  });
  it("rejects non-integer money", () => {
    expect(() => formatVnd(10.5)).toThrow();
  });
});

describe("discountPercent", () => {
  it("computes rounded percentage", () => {
    expect(discountPercent(1490000, 2490000)).toBe(40);
  });
  it("returns 0 when no valid compare-at price", () => {
    expect(discountPercent(100, null)).toBe(0);
    expect(discountPercent(100, 80)).toBe(0);
  });
});

describe("durations", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(3600 * 42)).toBe("42 giờ");
    expect(formatDuration(3600 + 1800)).toBe("1 giờ 30 phút");
    expect(formatDuration(600)).toBe("10 phút");
  });
  it("formats clock", () => {
    expect(formatClock(1450)).toBe("24:10");
  });
});
