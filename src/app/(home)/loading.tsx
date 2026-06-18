export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          {/* Highlights skeleton */}
          <div className="bg-card-bg rounded-lg border border-border-custom p-6">
            <div className="h-5 w-64 bg-body rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <div className="aspect-video bg-body animate-pulse" />
                  <div className="p-2.5 space-y-1.5">
                    <div className="h-3 w-16 bg-body rounded animate-pulse" />
                    <div className="h-3 w-full bg-body rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News skeleton */}
          <div className="bg-card-bg rounded-lg border border-border-custom p-6">
            <div className="h-5 w-48 bg-body rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-24 h-16 rounded bg-body animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 bg-body rounded animate-pulse" />
                    <div className="h-3 w-full bg-body rounded animate-pulse" />
                    <div className="h-3 w-3/4 bg-body rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card-bg rounded-lg border border-border-custom p-4">
            <div className="h-4 w-40 bg-body rounded animate-pulse mb-3" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 py-2">
                <div className="w-5 h-3 bg-body rounded animate-pulse" />
                <div className="w-5 h-5 rounded-full bg-body animate-pulse" />
                <div className="h-3 flex-1 bg-body rounded animate-pulse" />
                <div className="w-6 h-3 bg-body rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
