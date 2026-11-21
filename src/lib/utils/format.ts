const vnd = new Intl.NumberFormat("vi-VN");

/** Money is stored as integer VND (BIGINT). Never pass floats here. */
export function formatVnd(amount: number): string {
  if (!Number.isSafeInteger(amount)) throw new Error("Số tiền VND phải là số nguyên");
  return `${vnd.format(amount)}đ`;
}

export function discountPercent(price: number, compareAt: number | null | undefined): number {
  if (!compareAt || compareAt <= price || compareAt <= 0) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
  return `${m} phút`;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function formatCount(n: number): string {
  return vnd.format(n);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}
