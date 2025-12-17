import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInviteFreeUser } from '@/hooks/useInviteFreeUser';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UpgradeDialog } from '@/components/UpgradeDialog';
import { Calendar, BarChart3, GraduationCap, Settings, LogOut, Menu, X, User, Video, Lock, Crown, Sparkles, CreditCard, ChevronDown, MoreVertical, HelpCircle, Bell } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useState, useEffect } from 'react';
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

interface AppSidebarProps {
  children: React.ReactNode;
}

export const AppSidebar = ({ children }: AppSidebarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navExpanded, setNavExpanded] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState<string>('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
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
            isMobile ? "py-4 text-muted-foreground" : "py-2 text-sidebar-foreground"
          )}
        >
          <item.icon className="w-4 h-4" />
          <span className={cn(isMobile && "text-lg")}>{item.label}</span>
          <Lock className="w-3.5 h-3.5 ml-auto" />
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
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        <item.icon className="w-4 h-4" />
        <span className={cn(isMobile && "text-lg")}>{item.label}</span>
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
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-56 flex-col bg-sidebar border-r border-sidebar-border p-5 z-50">
        <div className="mb-10">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Skoolife" className="h-9 w-auto rounded-xl" />
            <span className="font-bold text-xl text-sidebar-foreground">Skoolife</span>
          </Link>
          {!subscriptionLoading && (
            <div className="mt-2 ml-12">
              {renderSubscriptionBadge()}
            </div>
          )}
        </div>

        <Collapsible open={navExpanded} onOpenChange={setNavExpanded} className="flex-1">
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

        {/* Profile section */}
        <div className="pt-4 border-t border-sidebar-border">
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
                  <a
                    href="https://calendly.com/skoolife-co/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-sm"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <HelpCircle className="w-4 h-4" />
                      Aide
                    </Button>
                  </a>
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
          <div className="flex items-center gap-2 mt-3">
            <ThemeToggle />
            <a
              href="https://chat.whatsapp.com/KZaZ5cmGBoM60V5Qmqned5?mode=hqrc"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-sidebar-foreground/10 hover:bg-sidebar-foreground/20 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-sidebar-foreground" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Skoolife" className="h-8 w-auto rounded-lg" />
            <span className="font-bold text-lg text-foreground">Skoolife</span>
          </Link>
          {!subscriptionLoading && renderSubscriptionBadge(true)}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://chat.whatsapp.com/KZaZ5cmGBoM60V5Qmqned5?mode=hqrc"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-secondary/50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#25D366]" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20"
          >
            <User className="w-4 h-4 text-primary" />
          </Button>
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
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-4 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setMobileMenuOpen(false);
                handleManageSubscription();
              }}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-lg">Mon abonnement</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-4 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-lg">Déconnexion</span>
            </Button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-56 min-h-screen">
        {children}
      </main>

      {/* Upgrade Dialog */}
      <UpgradeDialog 
        open={upgradeDialogOpen} 
        onOpenChange={setUpgradeDialogOpen}
        featureName={lockedFeatureName}
        onUpgradeSuccess={refreshSubscription}
      />
    </div>
  );
};

export default AppSidebar;
