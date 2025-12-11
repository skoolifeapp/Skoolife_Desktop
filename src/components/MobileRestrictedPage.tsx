import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Monitor, ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';
import { ThemeToggle } from '@/components/ThemeToggle';

interface MobileRestrictedPageProps {
  pageName: string;
}

export const MobileRestrictedPage = ({ pageName }: MobileRestrictedPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/today" className="flex items-center gap-2">
          <img src={logo} alt="Skoolife" className="h-8 w-auto rounded-lg" />
          <span className="font-bold text-lg text-foreground">Skoolife</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-2">
              Disponible sur ordinateur
            </h2>
            
            <p className="text-muted-foreground mb-6">
              La page <span className="font-medium">{pageName}</span> et les fonctionnalités avancées sont disponibles sur ordinateur.
            </p>
            
            <p className="text-sm text-muted-foreground mb-6">
              Sur mobile, tu peux consulter et gérer ton planning du jour.
            </p>
            
            <Button
              variant="hero"
              className="w-full"
              onClick={() => navigate('/today')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à aujourd'hui
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
