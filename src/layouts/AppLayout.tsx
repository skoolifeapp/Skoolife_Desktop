import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';

const AppLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Redirect /app to /app/planning
  useEffect(() => {
    if (location.pathname === '/app') {
      navigate('/app/planning', { replace: true });
    }
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar - hidden on mobile */}
        {!isMobile && <AppSidebar />}
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with trigger on desktop */}
          {!isMobile && (
            <header className="border-b border-border bg-card sticky top-0 z-40 px-4 py-3 flex items-center gap-4">
              <SidebarTrigger />
            </header>
          )}

          {/* Main content area */}
          <main className={`flex-1 overflow-auto ${isMobile ? 'pb-20' : ''}`}>
            <Outlet />
          </main>

          {/* Mobile bottom navigation */}
          {isMobile && <MobileBottomNav />}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
