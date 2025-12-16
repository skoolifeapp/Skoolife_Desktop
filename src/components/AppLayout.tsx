import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

export const AppLayout = () => {
  const location = useLocation();
  
  return (
    <AppSidebar>
      <Suspense fallback={<PageLoader />}>
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </Suspense>
    </AppSidebar>
  );
};

export default AppLayout;
