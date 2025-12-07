import { Link, useLocation } from 'react-router-dom';
import { Calendar, TrendingUp, Wallet, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Planning', shortTitle: 'Planning', url: '/app/planning', icon: Calendar },
  { title: 'Progression', shortTitle: 'Prog.', url: '/app/progression', icon: TrendingUp },
  { title: 'Budget', shortTitle: 'Budget', url: '/app/budget', icon: Wallet },
  { title: 'Paramètres', shortTitle: 'Param.', url: '/app/settings', icon: Settings },
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.url);
          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full px-2 transition-colors",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                active && "bg-primary/10"
              )}>
                <item.icon className={cn(
                  "w-5 h-5",
                  active && "text-primary"
                )} />
              </div>
              <span className={cn(
                "text-xs mt-0.5 font-medium",
                active && "text-primary"
              )}>
                {item.shortTitle}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
