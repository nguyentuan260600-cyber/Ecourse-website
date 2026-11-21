import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function CourseThumb({ src, alt, className, priority, sizes }: { src: string | null; alt: string; className?: string; priority?: boolean; sizes?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-surface-2", className)}>
      {src ? (
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes ?? "(min-width:1280px) 25vw, (min-width:768px) 40vw, 100vw"} className="object-cover transition duration-500 group-hover:scale-[1.04]" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-soft via-surface-2 to-accent-soft">
          <GraduationCap size={44} className="text-brand/60" aria-hidden />
        </div>
      )}
    </div>
  );
}
