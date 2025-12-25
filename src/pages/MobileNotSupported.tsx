import { Link } from 'react-router-dom';
import { Monitor, ArrowLeft, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOGO_URL = '/logo.png';

const MobileNotSupported = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Simple Header */}
      <header className="flex justify-center px-4 py-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="Skoolife" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold text-foreground font-heading">Skoolife</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="max-w-md text-center space-y-8">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Laptop className="w-10 h-10 text-primary" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground font-heading">
              Skoolife est optimisé pour ordinateur
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Pour profiter de la meilleure expérience de planification et de révision, 
              connecte-toi depuis un <span className="text-foreground font-medium">ordinateur</span> ou une <span className="text-foreground font-medium">tablette</span>.
            </p>
          </div>

          {/* Visual representation */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-12 rounded-lg border-2 border-primary bg-primary/5 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-primary font-medium">Recommandé</span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
            <p>
              Notre interface de planning hebdomadaire et nos outils de suivi sont conçus 
              pour tirer parti d'un écran plus grand.
            </p>
          </div>

          {/* Back button */}
          <Link to="/">
            <Button variant="outline" className="rounded-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Skoolife. Tous droits réservés.
      </footer>
    </div>
  );
};

export default MobileNotSupported;
