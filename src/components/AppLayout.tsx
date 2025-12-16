import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import {
  DashboardSkeleton,
  ProgressionSkeleton,
  SubjectsSkeleton,
  SettingsSkeleton,
  ProfileSkeleton,
  GenericSkeleton,
} from './PageSkeletons';

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
