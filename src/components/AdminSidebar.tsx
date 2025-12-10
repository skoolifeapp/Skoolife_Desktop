import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageSquare, Users, BarChart3, Settings, LogOut, 
  Shield, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

interface AdminSidebarProps {
  children: ReactNode;
}

const navItems = [
  { 
    title: 'Conversations', 
    url: '/admin', 
    icon: MessageSquare,
    description: 'Gérer les messages'
  },
  { 
    title: 'Utilisateurs', 
    url: '/admin/users', 
    icon: Users,
    description: 'Voir les étudiants',
    disabled: true
  },
  { 
    title: 'Statistiques', 
    url: '/admin/stats', 
    icon: BarChart3,
    description: 'Données de la plateforme',
    disabled: true
  },
];

function AdminSidebarContent() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Sidebar 
      className={cn(
        "border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-foreground truncate">Skoolife</h1>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">Admin</span>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                disabled={item.disabled}
                tooltip={isCollapsed ? item.title : undefined}
              >
                {item.disabled ? (
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground/50 cursor-not-allowed",
                  )}>
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{item.title}</span>
                        <p className="text-xs opacity-70 truncate">Bientôt disponible</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink 
                    to={item.url} 
                    end
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      "hover:bg-secondary/80"
                    )}
                    activeClassName="bg-primary/10 text-primary"
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{item.title}</span>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                    )}
                  </NavLink>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-auto pt-4 border-t border-border space-y-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={isCollapsed ? "Dashboard étudiant" : undefined}>
              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left hover:bg-secondary/80 transition-colors text-muted-foreground"
              >
                <Users className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm">Voir comme étudiant</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={isCollapsed ? "Déconnexion" : undefined}>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left hover:bg-destructive/10 text-destructive transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm">Déconnexion</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebarContent />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-card">
          <SidebarTrigger>
            <Menu className="w-5 h-5" />
          </SidebarTrigger>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Skoolife" className="w-8 h-8 rounded-lg" />
            <span className="font-bold">Admin</span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

const AdminSidebar = ({ children }: AdminSidebarProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminLayout>{children}</AdminLayout>
    </SidebarProvider>
  );
};

export default AdminSidebar;