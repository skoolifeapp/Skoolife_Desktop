import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInviteFreeUser } from '@/hooks/useInviteFreeUser';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UpgradeDialog } from '@/components/UpgradeDialog';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import SupportDrawer from '@/components/SupportDrawer';
import { Calendar, BarChart3, GraduationCap, Settings, LogOut, Menu, X, User, Video, Lock, Crown, Sparkles, CreditCard, ChevronDown, MoreVertical, HelpCircle, PanelLeftClose, PanelLeft, Timer, FileText, CheckSquare, BrainCircuit } from 'lucide-react';
const LOGO_URL = '/logo.png';
import { useState, useEffect } from 'react';
import { useLayoutSidebar } from '@/contexts/LayoutSidebarContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const NAV_ITEMS = [
  { path: '/app', label: 'Calendrier', icon: Calendar, requiresSubscription: false, requiresMajor: false },
  { path: '/progression', label: 'Progression', icon: BarChart3, requiresSubscription: true, requiresMajor: true },
  { path: '/subjects', label: 'Matières', icon: GraduationCap, requiresSubscription: true, requiresMajor: false },
  { path: '/settings', label: 'Paramètres', icon: Settings, requiresSubscription: true, requiresMajor: false },
];

const TRAVAIL_ITEMS = [
  { path: '/pomodoro', label: 'Pomodoro', icon: Timer, requiresSubscription: true, requiresMajor: false },
  { path: '/study-files', label: 'Mes fiches', icon: FileText, requiresSubscription: true, requiresMajor: true },
  { path: '/tasks', label: 'To-Do', icon: CheckSquare, requiresSubscription: true, requiresMajor: false },
  { path: '/ai-tools', label: 'Outils IA', icon: BrainCircuit, requiresSubscription: true, requiresMajor: false },
];

interface AppSidebarProps {
  children: React.ReactNode;
}

export const AppSidebar = ({ children }: AppSidebarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navExpanded, setNavExpanded] = useState(true);
  const [travailExpanded, setTravailExpanded] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState<string>('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const { sidebarCollapsed, setSidebarCollapsed } = useLayoutSidebar();
  const [supportDrawerOpen, setSupportDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, subscriptionTier, subscriptionLoading, isSubscribed, refreshSubscription, user } = useAuth();
  const { isInviteFreeUser } = useInviteFreeUser();

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

  const handleManageSubscription = () => {
    navigate('/subscription');
  };

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

  // Student tier has limited access - only Major gets full access
  const isStudentTier = subscriptionTier === 'student';
  
  // Check if user has no active subscription (expired or trial ended)
  const hasNoSubscription = !subscriptionLoading && !isSubscribed;

  const renderNavItem = (item: typeof NAV_ITEMS[0], isMobile: boolean = false) => {
    // Lock for:
    // 1. Free invite users when requiresSubscription is true
    // 2. Student tier when requiresMajor is true
    // 3. No subscription at all (expired/trial ended) when requiresSubscription is true
    const isLockedForFree = isInviteFreeUser && item.requiresSubscription;
    const isLockedForStudent = isStudentTier && item.requiresMajor;
    const isLockedForExpired = hasNoSubscription && item.requiresSubscription;
    const isLocked = isLockedForFree || isLockedForStudent || isLockedForExpired;
    
    if (isLocked) {
      return (
        <div
          key={item.path}
          onClick={() => {
            setLockedFeatureName(item.label);
            setUpgradeDialogOpen(true);
          }}
          className={cn(
            "flex items-center gap-2.5 px-3 rounded-lg cursor-pointer opacity-60 hover:opacity-80 transition-opacity text-sm",
            isMobile ? "py-4 text-muted-foreground" : "py-2 text-sidebar-foreground",
            !isMobile && sidebarCollapsed && "justify-center px-2"
          )}
        >
          <item.icon className="w-4 h-4" />
          {(isMobile || !sidebarCollapsed) && <span className={cn(isMobile && "text-lg")}>{item.label}</span>}
          {(isMobile || !sidebarCollapsed) && <Lock className="w-3.5 h-3.5 ml-auto" />}
        </div>
      );
    }

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

  const renderSubscriptionBadge = (isMobile: boolean = false) => {
    if (subscriptionLoading) return null;
    
    if (subscriptionTier === 'major') {
      return (
        <Badge className={cn(
          "bg-sidebar-foreground text-sidebar border-0 gap-1 shadow-sm",
          isMobile ? "text-xs" : "text-[10px]"
        )}>
          <Crown className="w-3 h-3" />
          Major
        </Badge>
      );
    }
    
    if (subscriptionTier === 'student') {
      return (
        <Badge className={cn(
          "bg-sidebar-foreground/20 text-sidebar-foreground border-0 gap-1",
          isMobile ? "text-xs" : "text-[10px]"
        )}>
          <Sparkles className="w-3 h-3" />
          Student
        </Badge>
      );
    }
    
    // No subscription - show expired badge
    if (!isSubscribed) {
      return (
        <Badge 
          className={cn(
            "gap-1 bg-destructive/20 text-destructive border-0 cursor-pointer hover:bg-destructive/30",
            isMobile ? "text-xs" : "text-[10px]"
          )}
          onClick={() => navigate('/subscription')}
        >
          <Lock className="w-3 h-3" />
          Expiré
        </Badge>
      );
    }
    
    return null;
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
                    {!subscriptionLoading && subscriptionTier && (
                      <Badge className={cn(
                        "mt-1.5 gap-1",
                        subscriptionTier === 'major' 
                          ? "bg-amber-100 text-amber-700 border-0" 
                          : "bg-primary/10 text-primary border-0"
                      )}>
                        {subscriptionTier === 'major' ? <Crown className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        {subscriptionTier === 'major' ? 'Major' : 'Student'}
                      </Badge>
                    )}
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
                    onClick={() => { setProfileMenuOpen(false); handleManageSubscription(); }}
                  >
                    <CreditCard className="w-4 h-4" />
                    Mon abonnement
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
                      {!subscriptionLoading && subscriptionTier && (
                        <Badge className={cn(
                          "mt-1.5 gap-1",
                          subscriptionTier === 'major' 
                            ? "bg-amber-100 text-amber-700 border-0" 
                            : "bg-primary/10 text-primary border-0"
                        )}>
                          {subscriptionTier === 'major' ? <Crown className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                          {subscriptionTier === 'major' ? 'Major' : 'Student'}
                        </Badge>
                      )}
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
                      onClick={() => { setProfileMenuOpen(false); handleManageSubscription(); }}
                    >
                      <CreditCard className="w-4 h-4" />
                      Mon abonnement
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
          <img src={LOGO_URL} alt="Skoolife" className="h-8 w-auto rounded-lg" />
          <span className="font-bold text-lg text-foreground">Skoolife</span>
        </Link>
        <div className="flex items-center gap-2">
          {!subscriptionLoading && renderSubscriptionBadge(true)}
          <ThemeToggle />
        </div>
      </header>

      {/* Desktop: Yellow frame container with header + content inside */}
      <div className={cn(
        "hidden lg:flex flex-col fixed top-0 bottom-0 right-0 bg-sidebar transition-all duration-300 pt-2 pr-2 pb-2",
        sidebarCollapsed ? "left-16" : "left-56"
      )}>
        <div className="flex-1 flex flex-col bg-background rounded-xl overflow-hidden">
          {/* Top Bar inside the container */}
          <div className="flex h-14 items-center justify-between px-6 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 rounded-lg"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </Button>
              <span>/</span>
              <span className="font-medium text-foreground">
                {location.pathname === '/profile' ? 'Profil' : 
                 location.pathname === '/subscription' ? 'Abonnement' : 
                 NAV_ITEMS.find(item => isActive(item.path))?.label || 
                 TRAVAIL_ITEMS.find(item => isActive(item.path))?.label || 'Planning'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              <ThemeToggle />
            </div>
          </div>
          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile main content (with bottom padding for nav bar) */}
      <main className="lg:hidden min-h-screen pb-20">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar - Instagram Style */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Calendrier */}
          <Link
            to="/app"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
              isActive('/app') ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Calendar className={cn("w-6 h-6", isActive('/app') && "fill-primary/20")} />
            <span className="text-[10px] font-medium">Calendrier</span>
          </Link>

          {/* Progression */}
          {isInviteFreeUser || (isStudentTier && NAV_ITEMS[1].requiresMajor) || hasNoSubscription ? (
            <button
              onClick={() => {
                setLockedFeatureName('Progression');
                setUpgradeDialogOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-muted-foreground/50"
            >
              <div className="relative">
                <BarChart3 className="w-6 h-6" />
                <Lock className="w-3 h-3 absolute -top-1 -right-1" />
              </div>
              <span className="text-[10px] font-medium">Progression</span>
            </button>
          ) : (
            <Link
              to="/progression"
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                isActive('/progression') ? "text-primary" : "text-muted-foreground"
              )}
            >
              <BarChart3 className={cn("w-6 h-6", isActive('/progression') && "fill-primary/20")} />
              <span className="text-[10px] font-medium">Progression</span>
            </Link>
          )}

          {/* Matières */}
          {isInviteFreeUser || hasNoSubscription ? (
            <button
              onClick={() => {
                setLockedFeatureName('Matières');
                setUpgradeDialogOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-muted-foreground/50"
            >
              <div className="relative">
                <GraduationCap className="w-6 h-6" />
                <Lock className="w-3 h-3 absolute -top-1 -right-1" />
              </div>
              <span className="text-[10px] font-medium">Matières</span>
            </button>
          ) : (
            <Link
              to="/subjects"
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                isActive('/subjects') ? "text-primary" : "text-muted-foreground"
              )}
            >
              <GraduationCap className={cn("w-6 h-6", isActive('/subjects') && "fill-primary/20")} />
              <span className="text-[10px] font-medium">Matières</span>
            </Link>
          )}

          {/* Paramètres */}
          {isInviteFreeUser || hasNoSubscription ? (
            <button
              onClick={() => {
                setLockedFeatureName('Paramètres');
                setUpgradeDialogOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 text-muted-foreground/50"
            >
              <div className="relative">
                <Settings className="w-6 h-6" />
                <Lock className="w-3 h-3 absolute -top-1 -right-1" />
              </div>
              <span className="text-[10px] font-medium">Paramètres</span>
            </button>
          ) : (
            <Link
              to="/settings"
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                isActive('/settings') ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Settings className={cn("w-6 h-6", isActive('/settings') && "fill-primary/20")} />
              <span className="text-[10px] font-medium">Paramètres</span>
            </Link>
          )}

          {/* Profil */}
          <Link
            to="/profile"
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
              isActive('/profile') ? "text-primary" : "text-muted-foreground"
            )}
          >
            <User className={cn("w-6 h-6", isActive('/profile') && "fill-primary/20")} />
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        </div>
      </nav>

      {/* Upgrade Dialog */}
      <UpgradeDialog 
        open={upgradeDialogOpen} 
        onOpenChange={setUpgradeDialogOpen}
        featureName={lockedFeatureName}
        onUpgradeSuccess={refreshSubscription}
      />

      {/* Support Drawer */}
      <SupportDrawer
        open={supportDrawerOpen}
        onOpenChange={setSupportDrawerOpen}
      />
    </div>
  );
};

export default AppSidebar;
