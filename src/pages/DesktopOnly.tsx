import { Monitor, Smartphone, Calendar, BookOpen, Timer, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DesktopOnly = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-5 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-5 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Logo with fade in */}
      <Link to="/" className="mb-10 animate-fade-in">
        <img src="/logo.png" alt="Skoolife" className="h-12" />
      </Link>

      {/* Animated illustration */}
      <div className="relative mb-8 animate-scale-in">
        {/* Main monitor icon */}
        <div className="relative">
          <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center shadow-lg border border-primary/10">
            <Monitor className="w-14 h-14 text-primary" />
          </div>
          
          {/* Floating feature icons */}
          <div className="absolute -top-3 -left-3 w-10 h-10 bg-white dark:bg-card rounded-xl shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="absolute -top-2 -right-4 w-10 h-10 bg-white dark:bg-card rounded-xl shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2s' }}>
            <Timer className="w-5 h-5 text-orange-500" />
          </div>
          <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-white dark:bg-card rounded-xl shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '2s' }}>
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white dark:bg-card rounded-xl shadow-lg flex items-center justify-center animate-bounce" style={{ animationDelay: '0.9s', animationDuration: '2s' }}>
            <BarChart3 className="w-5 h-5 text-green-500" />
          </div>
          
          {/* Mobile icon with X */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 translate-y-full mt-2">
            <div className="flex items-center gap-2 bg-muted/80 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Bientôt disponible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Title with stagger animation */}
      <div className="space-y-3 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-2xl font-bold text-foreground">
          Reviens sur ordinateur
        </h1>
        <p className="text-4xl">💻</p>
      </div>

      {/* Description */}
      <p className="text-muted-foreground max-w-xs mb-8 animate-fade-in leading-relaxed" style={{ animationDelay: '0.3s' }}>
        Skoolife est conçu pour t'offrir la meilleure expérience de révision sur ordinateur.
      </p>

      {/* Features list */}
      <div className="w-full max-w-xs space-y-3 mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/50 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm text-foreground text-left">Planning de révisions automatique</span>
        </div>
        <div className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/50 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <Timer className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-sm text-foreground text-left">Pomodoro intégré</span>
        </div>
        <div className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border/50 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-green-500" />
          </div>
          <span className="text-sm text-foreground text-left">Suivi de ta progression</span>
        </div>
      </div>

      {/* Back button */}
      <Link to="/" className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <Button variant="outline" size="lg" className="rounded-full px-8">
          Retour à l'accueil
        </Button>
      </Link>
    </div>
  );
};

export default DesktopOnly;
