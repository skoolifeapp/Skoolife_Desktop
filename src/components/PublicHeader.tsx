import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';

interface PublicHeaderProps {
  showBack?: boolean;
  backTo?: string;
  rightContent?: React.ReactNode;
}

export const PublicHeader = ({ showBack = false, backTo, rightContent }: PublicHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  // Determine if we should show back button based on navigation history
  const canGoBack = showBack || (location.key !== 'default' && location.pathname !== '/');

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {canGoBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-9 h-9 rounded-xl" />
            <span className="text-lg font-bold font-heading">Skoolife</span>
          </Link>
        </div>
        
        {rightContent && (
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </nav>
    </header>
  );
};

export default PublicHeader;
