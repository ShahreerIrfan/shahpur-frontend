export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative min-h-[580px] flex items-center overflow-hidden bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-900/50 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="max-w-2xl space-y-6">
          <Skeleton className="h-8 w-48 !bg-white/10" />
          <Skeleton className="h-14 w-96 !bg-white/15" />
          <Skeleton className="h-14 w-72 !bg-white/15" />
          <Skeleton className="h-6 w-80 !bg-white/10" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-12 w-48 !bg-white/10" />
            <Skeleton className="h-12 w-36 !bg-white/10" />
          </div>
          <div className="flex gap-8 pt-4">
            <Skeleton className="h-16 w-20 !bg-white/10" />
            <Skeleton className="h-16 w-20 !bg-white/10" />
            <Skeleton className="h-16 w-20 !bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
