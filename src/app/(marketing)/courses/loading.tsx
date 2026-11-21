import { CourseCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8" aria-busy="true" aria-label="Đang tải khoá học">
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="mb-8 h-10 w-2/3 max-w-xl" />
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Skeleton className="hidden h-[600px] rounded-3xl lg:block" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
