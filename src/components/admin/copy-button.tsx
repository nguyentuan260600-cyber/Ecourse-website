"use client";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyButton({ value, label = "Sao chép" }: { value: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(value).then(() => toast.success("Đã sao chép UID"))}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-strong hover:bg-brand-soft"
      aria-label={`${label} ${value}`}
    >
      <Copy size={13} aria-hidden /> {label}
    </button>
  );
}
