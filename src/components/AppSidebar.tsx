import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import SupportDrawer from '@/components/SupportDrawer';
import { Calendar, BarChart3, GraduationCap, Settings, LogOut, Menu, X, User, ChevronDown, MoreVertical, HelpCircle, PanelLeftClose, PanelLeft, Timer, FileText } from 'lucide-react';
const LOGO_URL = '/logo.png';
import { useState, useEffect } from 'react';
import { useLayoutSidebar } from '@/contexts/LayoutSidebarContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const NAV_ITEMS = [
  { path: '/app', label: 'Calendrier', icon: Calendar },
  { path: '/progression', label: 'Progression', icon: BarChart3 },
  { path: '/subjects', label: 'Matières', icon: GraduationCap },
  { path: '/settings', label: 'Paramètres', icon: Settings },
];

const TRAVAIL_ITEMS = [
  { path: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { path: '/study-files', label: 'Mes fiches', icon: FileText },
];

interface AppSidebarProps {
  children: React.ReactNode;
}

export const AppSidebar = ({ children }: AppSidebarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navExpanded, setNavExpanded] = useState(true);
  const [travailExpanded, setTravailExpanded] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const { sidebarCollapsed, setSidebarCollapsed } = useLayoutSidebar();
  const [supportDrawerOpen, setSupportDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();
      if (data) {
        setUserProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || user.email || ''
        });
      }
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  const renderNavItem = (item: typeof NAV_ITEMS[0], isMobile: boolean = false) => {
    return (
      <Link
        key={item.path}
        to={item.path}
        id={!isMobile ? (item.label === 'Matières' ? 'sidebar-matieres-link' : item.label === 'Paramètres' ? 'sidebar-parametres-link' : undefined) : undefined}
        onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
        className={cn(
          "flex items-center gap-2.5 px-3 rounded-lg transition-colors text-sm",
          isMobile ? "py-4" : "py-2",
          isActive(item.path)
            ? "bg-sidebar-accent text-sidebar-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50",
          !isMobile && sidebarCollapsed && "justify-center px-2"
        )}
      >
        <item.icon className="w-4 h-4" />
        {(isMobile || !sidebarCollapsed) && <span className={cn(isMobile && "text-lg")}>{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed left-0 top-0 h-full flex-col bg-sidebar z-50 transition-all duration-300",
        sidebarCollapsed ? "w-16 p-3" : "w-56 p-5"
      )}>
        <div className={cn("mb-10", sidebarCollapsed && "flex justify-center")}>
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Skoolife" className="h-9 w-auto rounded-xl" />
            {!sidebarCollapsed && <span className="font-bold text-xl text-sidebar-foreground">Skoolife</span>}
          </Link>
        </div>

        {sidebarCollapsed ? (
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => renderNavItem(item))}
            {TRAVAIL_ITEMS.map((item) => renderNavItem(item))}
          </nav>
        ) : (
          <div className="flex-1 space-y-4">
            <Collapsible open={navExpanded} onOpenChange={setNavExpanded}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">Navigation</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10">
                    <ChevronDown className={cn("h-4 w-4 transition-transform", navExpanded ? "" : "-rotate-90")} />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-1">
                {NAV_ITEMS.map((item) => renderNavItem(item))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={travailExpanded} onOpenChange={setTravailExpanded}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">Travail</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10">
                    <ChevronDown className={cn("h-4 w-4 transition-transform", travailExpanded ? "" : "-rotate-90")} />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-1">
                {TRAVAIL_ITEMS.map((item) => renderNavItem(item))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Profile section */}
        <div className={cn("pt-4 border-t border-sidebar-border", sidebarCollapsed && "flex justify-center")}>
          {sidebarCollapsed ? (
            <Popover open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
              <PopoverTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-sidebar-foreground/20 flex items-center justify-center hover:bg-sidebar-foreground/30 transition-colors">
                  <span className="text-sm font-medium text-sidebar-foreground">
                    {userProfile?.firstName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="center" side="right">
                <div className="space-y-1">
                  <div className="px-2 py-1.5 mb-2">
                    <p className="text-sm font-medium">{userProfile?.firstName} {userProfile?.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-sm"
                    onClick={() => { setProfileMenuOpen(false); navigate('/profile'); }}
                  >
                    <User className="w-4 h-4" />
                    Compte
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-sm"
                    onClick={() => { setProfileMenuOpen(false); setSupportDrawerOpen(true); }}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Aide
                  </Button>
                  <div className="border-t border-border my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-sm text-destructive hover:text-destructive"
                    onClick={() => { setProfileMenuOpen(false); handleSignOut(); }}
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full bg-sidebar-foreground/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-sidebar-foreground">
                    {userProfile?.firstName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {userProfile?.email}
                  </p>
                </div>
              </div>
              <Popover open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end" side="top">
                  <div className="space-y-1">
                    <div className="px-2 py-1.5 mb-2">
                      <p className="text-sm font-medium">{userProfile?.firstName} {userProfile?.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{userProfile?.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-sm"
                      onClick={() => { setProfileMenuOpen(false); navigate('/profile'); }}
                    >
                      <User className="w-4 h-4" />
                      Compte
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-sm"
                      onClick={() => { setProfileMenuOpen(false); setSupportDrawerOpen(true); }}
                    >
                      <HelpCircle className="w-4 h-4" />
                      Aide
                    </Button>
                    <div className="border-t border-border my-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-sm text-destructive hover:text-destructive"
                      onClick={() => { setProfileMenuOpen(false); handleSignOut(); }}
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="Skoolife" className="h-8 w-auto rounded-xl" />
          <span className="font-bold text-lg">Skoolife</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <NotificationsDropdown />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-16">
          <nav className="p-4 space-y-2">
            {NAV_ITEMS.map((item) => renderNavItem(item, true))}
            <div className="pt-4 border-t border-border mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">Travail</p>
              {TRAVAIL_ITEMS.map((item) => renderNavItem(item, true))}
            </div>
            <div className="pt-4 border-t border-border mt-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 py-4 text-lg"
                onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}
              >
                <User className="w-5 h-5" />
                Compte
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 py-4 text-lg text-destructive"
                onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
              >
                <LogOut className="w-5 h-5" />
                Se déconnecter
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-56"
      )}>
        {/* Desktop collapse button */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex fixed top-4 z-50 h-8 w-8 transition-all duration-300"
          style={{ left: sidebarCollapsed ? '72px' : '232px' }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
        
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 py-2">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
                isActive(item.path)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <SupportDrawer open={supportDrawerOpen} onOpenChange={setSupportDrawerOpen} />
    </div>
  );
};

export default AppSidebar;
