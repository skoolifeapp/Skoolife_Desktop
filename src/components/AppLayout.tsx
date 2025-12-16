import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { Skeleton } from '@/components/ui/skeleton';

const PageSkeleton = () => (
  <div className="p-6 md:p-8 space-y-6 animate-fade-in">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Main content skeleton */}
    <div className="rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  </div>
);

export const AppLayout = () => {
  const location = useLocation();
  
  return (
    <AppSidebar>
      <Suspense fallback={<PageSkeleton />}>
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </Suspense>
    </AppSidebar>
  );
};

export default AppLayout;
