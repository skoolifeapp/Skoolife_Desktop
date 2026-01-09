import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolTrial } from '@/hooks/useSchoolTrial';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Key, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FolderTree,
  ChevronDown,
  MoreVertical,
  User,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  Bell,
  Lock,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const LOGO_URL = '/logo.png';

interface SchoolSidebarProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: '/school', label: 'Vue d\'ensemble', icon: LayoutDashboard, alwaysAccessible: true },
  { path: '/school/students', label: 'Élèves', icon: Users, alwaysAccessible: false },
  { path: '/school/cohorts', label: 'Cohortes & Classes', icon: FolderTree, alwaysAccessible: false },
  { path: '/school/codes', label: 'Codes d\'accès', icon: Key, alwaysAccessible: false },
  { path: '/school/analytics', label: 'Analytics', icon: BarChart3, alwaysAccessible: false },
  { path: '/school/settings', label: 'Paramètres', icon: Settings, alwaysAccessible: true },
];

const SchoolSidebar = ({ children }: SchoolSidebarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navExpanded, setNavExpanded] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isTrialActive, isTrialExpired, daysRemaining } = useSchoolTrial();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/school') {
      return location.pathname === '/school';
    }
    return location.pathname.startsWith(path);
  };

  const getCurrentPageLabel = () => {
    const item = NAV_ITEMS.find(item => isActive(item.path));
    return item?.label || 'Vue d\'ensemble';
  };

  const isModuleLocked = (item: typeof NAV_ITEMS[0]) => {
    return isTrialExpired && !item.alwaysAccessible;
  };

  const renderNavItem = (item: typeof NAV_ITEMS[0], isMobile: boolean = false) => {
    const locked = isModuleLocked(item);
    
    if (locked) {
      return (
        <div
          key={item.path}
          className={cn(
            "flex items-center gap-2.5 px-3 rounded-lg transition-colors text-sm cursor-not-allowed opacity-50",
            isMobile ? "py-4" : "py-2",
            "text-sidebar-foreground/50",
            !isMobile && sidebarCollapsed && "justify-center px-2"
          )}
          title="Module verrouillé - Abonnement expiré"
        >
          <item.icon className="w-4 h-4" />
          {(isMobile || !sidebarCollapsed) && (
            <span className={cn("flex-1", isMobile && "text-lg")}>{item.label}</span>
          )}
          {(isMobile || !sidebarCollapsed) && <Lock className="w-3 h-3" />}
        </div>
      );
    }
    
    return (
      <Link
        key={item.path}
        to={item.path}
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
          <Link to="/school" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Skoolife" className="h-9 w-auto rounded-xl" />
            {!sidebarCollapsed && <span className="font-bold text-xl text-sidebar-foreground">Skoolife</span>}
          </Link>
        </div>

        {sidebarCollapsed ? (
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => renderNavItem(item))}
          </nav>
        ) : (
          <div className="flex-1 space-y-4">
            <Collapsible open={navExpanded} onOpenChange={setNavExpanded}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">Administration</span>
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
          </div>
        )}

        {/* Profile section */}
        <div className={cn("pt-4 border-t border-sidebar-border", sidebarCollapsed && "flex justify-center")}>
          {sidebarCollapsed ? (
            <Popover open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
              <PopoverTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-sidebar-foreground/20 flex items-center justify-center hover:bg-sidebar-foreground/30 transition-colors">
                  <span className="text-sm font-medium text-sidebar-foreground">A</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="center" side="right">
                <div className="space-y-1">
                  <div className="px-2 py-1.5 mb-2">
                    <p className="text-sm font-medium">Administrateur</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  {/* Trial info */}
                  {(isTrialActive || isTrialExpired) && (
                    <div className={cn(
                      "mx-2 mb-2 px-2 py-1.5 rounded text-xs flex items-center gap-2",
                      isTrialExpired 
                        ? "bg-destructive/10 text-destructive" 
                        : "bg-primary/10 text-primary"
                    )}>
                      {isTrialExpired ? (
                        <><AlertTriangle className="w-3 h-3" /> Essai terminé</>
                      ) : (
                        <><Clock className="w-3 h-3" /> {daysRemaining}j restants</>
                      )}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-sm"
                    onClick={() => { setProfileMenuOpen(false); navigate('/school/profile'); }}
                  >
                    <User className="w-4 h-4" />
                    Compte
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-sm"
                    onClick={() => { setProfileMenuOpen(false); }}
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
                  <span className="text-sm font-medium text-sidebar-foreground">A</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">Administrateur</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
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
                      <p className="text-sm font-medium">Administrateur</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    {/* Trial info */}
                    {(isTrialActive || isTrialExpired) && (
                      <div className={cn(
                        "mx-2 mb-2 px-2 py-1.5 rounded text-xs flex items-center gap-2",
                        isTrialExpired 
                          ? "bg-destructive/10 text-destructive" 
                          : "bg-primary/10 text-primary"
                      )}>
                        {isTrialExpired ? (
                          <><AlertTriangle className="w-3 h-3" /> Essai terminé</>
                        ) : (
                          <><Clock className="w-3 h-3" /> {daysRemaining}j restants</>
                        )}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-sm"
                      onClick={() => { setProfileMenuOpen(false); navigate('/school/profile'); }}
                    >
                      <User className="w-4 h-4" />
                      Compte
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 text-sm"
                      onClick={() => { setProfileMenuOpen(false); }}
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
        <Link to="/school" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="Skoolife" className="h-8 w-auto rounded-lg" />
          <span className="font-bold text-lg text-foreground">Skoolife</span>
        </Link>
        <div className="flex items-center gap-2">
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
              <span className="font-medium text-foreground">{getCurrentPageLabel()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground">
                <Bell className="w-4 h-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile main content */}
      <main className="lg:hidden min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default SchoolSidebar;
