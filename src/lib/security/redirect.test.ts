import { describe, expect, it } from "vitest";
import { safeNextPath } from "./redirect";

describe("safeNextPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeNextPath("/courses?q=ai")).toBe("/courses?q=ai");
    expect(safeNextPath("/learn/abc#x")).toBe("/learn/abc#x");
  });
  it.each(["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "", "dashboard", "/a\u0000b", null, 42])(
    "rejects %s",
    (bad) => {
      expect(safeNextPath(bad)).toBe("/dashboard");
    },
  );
});
