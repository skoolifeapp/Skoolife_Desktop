import { Calendar, BarChart3, GraduationCap, Settings, Timer, CheckSquare, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const LOGO_URL = '/logo.png';

const featureRoutes = [
  '/features/calendar',
  '/features/progression',
  '/features/subjects',
  '/features/settings',
  '/features/pomodoro',
  '/features/todo',
  '/features/files',
];

const FeatureSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNavClick = (index: number) => {
    const currentScroll = window.scrollY;
    navigate(featureRoutes[index]);
    // Restore scroll position after navigation
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScroll, behavior: 'instant' });
    });
  };

  const getActiveState = (route: string) => currentPath === route;

  return (
    <div className="hidden md:flex w-16 flex-col bg-primary text-primary-foreground items-center py-4">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl overflow-hidden mb-8">
        <img src={LOGO_URL} alt="Skoolife" className="w-full h-full object-cover" />
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col items-center gap-4">
        <button 
          onClick={() => handleNavClick(0)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${getActiveState('/features/calendar') ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
        >
          <Calendar className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleNavClick(1)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${getActiveState('/features/progression') ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
        >
          <BarChart3 className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleNavClick(2)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${getActiveState('/features/subjects') ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
        >
          <GraduationCap className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleNavClick(3)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${getActiveState('/features/settings') ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
        >
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleNavClick(4)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${getActiveState('/features/pomodoro') ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
        >
          <Timer className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleNavClick(5)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${getActiveState('/features/todo') ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
        >
          <CheckSquare className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleNavClick(6)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${getActiveState('/features/files') ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}
        >
          <FileText className="w-5 h-5" />
        </button>
      </div>

      {/* User Avatar */}
      <div className="mt-auto pt-4 border-t border-primary-foreground/20 w-full flex justify-center">
        <div className="w-10 h-10 rounded-full bg-primary-foreground/30 flex items-center justify-center text-sm font-medium">
          S
        </div>
      </div>
    </div>
  );
};

export default FeatureSidebar;
