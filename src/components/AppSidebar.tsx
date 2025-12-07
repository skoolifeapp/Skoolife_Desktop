import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Calendar, TrendingUp, Wallet, Settings, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Planning', url: '/app/planning', icon: Calendar },
  { title: 'Progression', url: '/app/progression', icon: TrendingUp },
  { title: 'Budget', url: '/app/budget', icon: Wallet },
  { title: 'Paramètres', url: '/app/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-xl font-bold text-foreground">Skoolife</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={cn(
                        "h-11 transition-all",
                        active && "bg-primary/10 text-primary font-semibold border border-primary/20"
                      )}
                    >
                      <Link 
                        to={item.url}
                        className="flex items-center gap-3"
                      >
                        <item.icon className={cn(
                          "w-5 h-5 flex-shrink-0",
                          active && "text-primary"
                        )} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 mt-auto">
        <Separator className="mb-3" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Déconnexion"
              className="h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
