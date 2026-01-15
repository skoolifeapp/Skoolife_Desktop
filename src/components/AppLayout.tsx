import { Suspense, useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TrialExpiredDialog } from './TrialExpiredDialog';
import { useAuth } from '@/hooks/useAuth';
import {
  DashboardSkeleton,
  ProgressionSkeleton,
  SubjectsSkeleton,
  SettingsSkeleton,
  ProfileSkeleton,
  SubscriptionSkeleton,
  GenericSkeleton,
} from './PageSkeletons';

const getSkeletonForRoute = (pathname: string) => {
  if (pathname === '/app') return <DashboardSkeleton />;
  if (pathname === '/progression') return <ProgressionSkeleton />;
  if (pathname === '/subjects') return <SubjectsSkeleton />;
  if (pathname === '/settings') return <SettingsSkeleton />;
  if (pathname === '/profile') return <ProfileSkeleton />;
  if (pathname === '/subscription') return <SubscriptionSkeleton />;
  if (pathname === '/cancel') return <SubscriptionSkeleton />;
  return <GenericSkeleton />;
};

export const AppLayout = () => {
  const location = useLocation();
  const { trialInfo, subscriptionLoading } = useAuth();
  const [showTrialExpired, setShowTrialExpired] = useState(false);

  useEffect(() => {
    // Show trial expired dialog when trial has expired and no active subscription
    if (!subscriptionLoading && trialInfo.trialExpired) {
      setShowTrialExpired(true);
    }
  }, [trialInfo.trialExpired, subscriptionLoading]);
  
  return (
    <AppSidebar>
      <Suspense fallback={getSkeletonForRoute(location.pathname)}>
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </Suspense>
      
      <TrialExpiredDialog 
        open={showTrialExpired} 
        onOpenChange={setShowTrialExpired}
        selectedTier={trialInfo.selectedTier}
      />
    </AppSidebar>
  );
};

export default AppLayout;
