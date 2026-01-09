import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Key, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  GraduationCap,
  FolderTree
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const LOGO_URL = '/logo.png';

interface SchoolSidebarProps {
  children: ReactNode;
  schoolName?: string;
}

const NAV_ITEMS = [
  { path: '/school', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { path: '/school/students', label: 'Élèves', icon: Users },
  { path: '/school/cohorts', label: 'Cohortes & Classes', icon: FolderTree },
  { path: '/school/codes', label: 'Codes d\'accès', icon: Key },
  { path: '/school/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/school/settings', label: 'Paramètres', icon: Settings },
];

const SchoolSidebar = ({ children, schoolName }: SchoolSidebarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col bg-card border-r border-border p-5 z-50">
        <Link to="/school" className="flex items-center gap-3 mb-2">
          <img src={LOGO_URL} alt="Skoolife" className="h-9 w-auto rounded-xl" />
          <span className="font-bold text-xl text-foreground">Skoolife</span>
        </Link>
        

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                isActive(item.path)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-border space-y-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/school" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="Skoolife" className="h-8 w-auto rounded-lg" />
          <div className="flex flex-col">
            <span className="font-bold text-lg text-foreground leading-none">École</span>
            {schoolName && (
              <span className="text-xs text-primary truncate max-w-[150px]">{schoolName}</span>
            )}
          </div>
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
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-4 rounded-xl transition-colors",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-lg">{item.label}</span>
              </Link>
            ))}
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
      <main className="lg:ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default SchoolSidebar;
