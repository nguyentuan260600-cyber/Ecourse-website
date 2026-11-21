import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function Avatar({ src, name, size = 36, className }: { src: string | null; name: string; size?: number; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return src ? (
    <Image src={src} alt={name} width={size} height={size} className={cn("shrink-0 rounded-full object-cover", className)} style={{ width: size, height: size }} />
  ) : (
    <span
      aria-label={name}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-display text-xs font-bold text-brand-ink", className)}
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}
