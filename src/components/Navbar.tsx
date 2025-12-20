import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, BarChart3, BookOpen, Settings, Timer } from 'lucide-react';
import logo from '@/assets/logo.png';

const features = [
  { name: 'Calendrier', icon: Calendar, description: 'Planifie tes révisions', path: '/app' },
  { name: 'Progression', icon: BarChart3, description: 'Suis tes progrès', path: '/progression' },
  { name: 'Matières', icon: BookOpen, description: 'Gère tes matières', path: '/subjects' },
  { name: 'Paramètres', icon: Settings, description: 'Personnalise ton expérience', path: '/settings' },
  { name: 'Pomodoro', icon: Timer, description: 'Révise efficacement', path: '/pomodoro' },
];

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isPricing = location.pathname === '/pricing';
  const [showFeatures, setShowFeatures] = useState(false);

  const aboutLink = isHome ? '#a-propos' : '/#a-propos';

  return (
    <header className="fixed left-0 right-0 z-50 top-0 flex justify-center px-4 py-4">
      <nav className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-full border border-border/50 shadow-lg">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity px-2">
          <img src={logo} alt="Skoolife" className="w-8 h-8 rounded-xl" />
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
            
            {/* Dropdown menu */}
            {showFeatures && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-card rounded-xl border border-border shadow-xl p-2 z-50">
                {features.map((feature) => (
                  <Link
                    key={feature.name}
                    to={feature.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <a 
            href={aboutLink} 
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
          >
            À propos
          </a>
        </div>
        
        {/* CTA Button */}
        <Link to="/auth" className="ml-2">
          <Button variant="default" size="sm" className="rounded-full text-xs md:text-sm px-4">
            Se connecter
          </Button>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
