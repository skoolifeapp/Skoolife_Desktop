import { Monitor, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DesktopOnly = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <Link to="/" className="mb-8">
        <img src="/logo.png" alt="Skoolife" className="h-10" />
      </Link>

      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
          <Monitor className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-muted rounded-full flex items-center justify-center border-4 border-background">
          <Smartphone className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-foreground mb-3">
        Reviens sur ordinateur 💻
      </h1>

      {/* Description */}
      <p className="text-muted-foreground max-w-sm mb-8">
        Skoolife est optimisé pour une utilisation sur ordinateur. 
        Pour créer ton compte et profiter de toutes les fonctionnalités, 
        connecte-toi depuis un PC ou un Mac.
      </p>

      {/* Features hint */}
      <div className="bg-muted/50 rounded-xl p-4 max-w-sm mb-8">
        <p className="text-sm text-muted-foreground">
          🎯 Génère ton planning automatiquement<br />
          📚 Gère tes matières et examens<br />
          ⏱️ Utilise le Pomodoro intégré
        </p>
      </div>

      {/* Back button */}
      <Link to="/">
        <Button variant="outline">
          Retour à l'accueil
        </Button>
      </Link>
    </div>
  );
};

export default DesktopOnly;
