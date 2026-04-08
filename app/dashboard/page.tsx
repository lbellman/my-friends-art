import InternalLayout from "@/components/organisms/InternalLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import ArtistDashboardView from "@/components/views/ArtistDashboardView/ArtistDashboardView";

function DashboardPageFallback() {
  return (
    <InternalLayout>
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">
        
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="aspect-3/4 w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </InternalLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <ArtistDashboardView />
    </Suspense>
  );
}
