/**
 * Prevent open redirects: only allow same-origin relative paths.
 * Rejects "//evil.com", "/\\evil.com", absolute URLs and control characters.
 */
export function safeNextPath(input: unknown, fallback = "/dashboard"): string {
  if (typeof input !== "string" || input.length === 0 || input.length > 512) return fallback;
  if (!input.startsWith("/") || input.startsWith("//") || input.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\\]/.test(input)) return fallback;
  try {
    const url = new URL(input, "http://local.invalid");
    if (url.origin !== "http://local.invalid") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
