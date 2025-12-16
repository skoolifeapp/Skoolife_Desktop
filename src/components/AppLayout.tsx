import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { Skeleton } from '@/components/ui/skeleton';

// Dashboard skeleton - matches planning grid layout
const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-7 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="hidden lg:block w-72 space-y-4">
        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Grid */}
      <div className="flex-1 rounded-xl border border-border bg-card p-4">
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-8 flex-1" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-12 w-12" />
              {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                <Skeleton key={j} className="h-12 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Progression skeleton - matches stats and charts layout
const ProgressionSkeleton = () => (
  <div className="flex-1 p-6 md:p-8 space-y-6 animate-fade-in">
    <div className="flex items-center gap-3 mb-8">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
    <div className="p-6 rounded-xl border border-border bg-card space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
    <div className="p-6 rounded-xl border border-border bg-card">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-48 w-full" />
    </div>
  </div>
);

// Subjects skeleton - matches subject cards layout
const SubjectsSkeleton = () => (
  <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-44" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      ))}
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-9 w-28 shrink-0" />
      ))}
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-5 w-40 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  </div>
);

// Settings skeleton - matches form layout
const SettingsSkeleton = () => (
  <div className="flex-1 p-6 md:p-8 space-y-8 animate-fade-in">
    <div className="space-y-2">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-5 w-64" />
    </div>
    <div className="p-6 rounded-xl border border-border bg-card space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-4 w-full max-w-md" />
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-9 w-12" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

// Profile skeleton - matches profile form layout
const ProfileSkeleton = () => (
  <div className="flex-1 p-6 md:p-8 space-y-8 animate-fade-in">
    <div className="space-y-2">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-5 w-56" />
    </div>
    <div className="p-6 rounded-xl border border-border bg-card max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

// Generic fallback skeleton
const GenericSkeleton = () => (
  <div className="p-6 md:p-8 space-y-6 animate-fade-in">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

const getSkeletonForRoute = (pathname: string) => {
  if (pathname === '/app') return <DashboardSkeleton />;
  if (pathname === '/progression') return <ProgressionSkeleton />;
  if (pathname === '/subjects') return <SubjectsSkeleton />;
  if (pathname === '/settings') return <SettingsSkeleton />;
  if (pathname === '/profile') return <ProfileSkeleton />;
  return <GenericSkeleton />;
};

export const AppLayout = () => {
  const location = useLocation();
  
  return (
    <AppSidebar>
      <Suspense fallback={getSkeletonForRoute(location.pathname)}>
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </Suspense>
    </AppSidebar>
  );
};

export default AppLayout;
