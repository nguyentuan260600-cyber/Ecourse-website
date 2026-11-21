import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-surface-2", className)} />;
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-card p-3 ring-1 ring-line/60">
      <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
      <div className="flex flex-col gap-2 px-2 pb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="mt-3 h-8 w-32" />
      </div>
    </div>
  );
}
