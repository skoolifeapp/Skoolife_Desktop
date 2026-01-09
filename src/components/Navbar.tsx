import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, BarChart3, BookOpen, Settings, Timer, Building2 } from 'lucide-react';
const LOGO_URL = '/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

const features = [
  { name: 'Calendrier', icon: Calendar, description: 'Planifie tes révisions', path: '/features/calendar' },
  { name: 'Progression', icon: BarChart3, description: 'Suis tes progrès', path: '/features/progression' },
  { name: 'Matières', icon: BookOpen, description: 'Gère tes matières', path: '/features/subjects' },
  { name: 'Paramètres', icon: Settings, description: 'Personnalise ton expérience', path: '/features/settings' },
  { name: 'Pomodoro', icon: Timer, description: 'Révise efficacement', path: '/features/pomodoro' },
];

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isHome = location.pathname === '/';
  const isPricing = location.pathname === '/pricing';
  const [showFeatures, setShowFeatures] = useState(false);
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);

  useEffect(() => {
    const checkSchoolAdmin = async () => {
      if (!user) {
        setIsSchoolAdmin(false);
        return;
      }

      const { data } = await supabase
        .from('school_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'admin_school')
        .eq('is_active', true)
        .maybeSingle();

      setIsSchoolAdmin(!!data);
    };

    checkSchoolAdmin();
  }, [user]);

  const isAbout = location.pathname === '/about';
  
  // Redirect to /app if user is logged in, otherwise to /
  const logoLink = user ? '/app' : '/';
  
  // On mobile, redirect to desktop-only page instead of auth
  const authLink = isMobile ? '/desktop-only' : '/auth';

  return (
    <header className="fixed left-0 right-0 z-[100] top-0 flex justify-center px-4 py-4">
      <nav className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-full border border-border/50 shadow-lg">
        {/* Logo */}
        <Link to={logoLink} className="flex items-center gap-2 hover:opacity-80 transition-opacity px-2">
          <img src={LOGO_URL} alt="Skoolife" className="w-8 h-8 rounded-xl" />
          <span className="text-lg font-bold text-foreground font-heading">Skoolife</span>
        </Link>
        
        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          <Link 
            to="/pricing" 
            className={`px-3 py-1.5 text-sm transition-colors rounded-full ${
              isPricing 
                ? 'text-foreground font-medium bg-muted/50' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Tarifs
          </Link>
          
          {/* Fonctionnalités with dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setShowFeatures(true)}
            onMouseLeave={() => setShowFeatures(false)}
          >
            <button 
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
            >
              Fonctionnalités
            </button>
            
            {/* Dropdown menu with bridge */}
            {showFeatures && (
              <>
                {/* Invisible bridge to prevent gap */}
                <div className="absolute top-full left-0 w-64 h-2" />
                <div className="absolute top-full left-0 pt-2 w-64 z-50">
                  <div className="bg-white dark:bg-card rounded-xl border border-border shadow-xl p-2">
                    {features.map((feature) => {
                      const content = (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <feature.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{feature.name}</p>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </>
                      );

                      return feature.path ? (
                        <Link
                          key={feature.name}
                          to={feature.path}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div
                          key={feature.name}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-default opacity-60"
                        >
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <Link 
            to="/about" 
            className={`px-3 py-1.5 text-sm transition-colors rounded-full ${
              isAbout 
                ? 'text-foreground font-medium bg-muted/50' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            À propos
          </Link>
          
          {/* Établissements link - visible for everyone */}
          <Link 
            to="/etablissements" 
            className={`px-3 py-1.5 text-sm transition-colors rounded-full ${
              location.pathname === '/etablissements' 
                ? 'text-foreground font-medium bg-muted/50' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Établissements
          </Link>
        </div>
        
        {/* Dashboard école - School admins only */}
        {isSchoolAdmin && !isMobile && (
          <Link to="/school">
            <Button variant="outline" size="sm" className="rounded-full text-xs md:text-sm px-4 gap-2">
              <Building2 className="w-4 h-4" />
              Mon établissement
            </Button>
          </Link>
        )}
        
        {/* CTA Button */}
        <Link to={authLink} className="ml-2">
          <Button variant="default" size="sm" className="rounded-full text-xs md:text-sm px-4">
            Se connecter
          </Button>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
