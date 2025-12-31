import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, 
  Settings, LogOut, Menu, X, Building2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

const LOGO_URL = '/logo.png';

interface SchoolSidebarProps {
  children: ReactNode;
  schoolName?: string;
  schoolLogo?: string | null;
  primaryColor?: string;
}

const NAV_ITEMS = [
  { path: '/school', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/school/students', label: 'Étudiants', icon: GraduationCap },
  { path: '/school/teachers', label: 'Enseignants', icon: Users },
  { path: '/school/subjects', label: 'Matières', icon: BookOpen },
  { path: '/school/settings', label: 'Paramètres', icon: Settings },
];

const SchoolSidebar = ({ children, schoolName, schoolLogo, primaryColor }: SchoolSidebarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col bg-card border-r border-border p-5 z-50">
        <div className="flex items-center gap-3 mb-2">
          {schoolLogo ? (
            <img src={schoolLogo} alt={schoolName} className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="font-bold text-lg text-foreground block truncate">
              {schoolName || 'Mon École'}
            </span>
            <span className="text-xs text-muted-foreground">Administration</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8 px-1">
          <img src={LOGO_URL} alt="Skoolife" className="h-5 w-auto" />
          <span className="text-xs text-muted-foreground">Powered by Skoolife</span>
        </div>

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
        <div className="flex items-center gap-2">
          {schoolLogo ? (
            <img src={schoolLogo} alt={schoolName} className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div 
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            >
              <Building2 className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-bold text-lg text-foreground truncate max-w-[150px]">
            {schoolName || 'Mon École'}
          </span>
        </div>
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
