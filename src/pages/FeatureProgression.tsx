import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CheckCircle2, TrendingUp, ChevronLeft, ChevronRight, BookOpen, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Static Progression Card Component
const StaticProgressionCard = () => (
  <div className="h-[500px] md:h-[600px] flex flex-col bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-xl">
    {/* App Header Bar */}
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20 bg-[#FFFDF8] dark:bg-card">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">S</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <ChevronRight className="w-3 h-3" />
          <span className="text-sm font-medium text-foreground">Progression</span>
        </div>
      </div>
    </div>

    {/* Page Header */}
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Tableau de Bord des Progrès</h2>
      </div>
      <div className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 text-sm font-medium min-w-[120px] text-center">Cette semaine</span>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 flex flex-col px-6 pb-4 gap-4 overflow-hidden">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Heures d'étude</p>
            <p className="text-xl font-bold text-foreground">12.5h</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Taux de complétion</p>
            <p className="text-xl font-bold text-foreground">87<span className="text-base">%</span></p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sessions réalisées</p>
            <p className="text-xl font-bold text-foreground">8</p>
          </div>
        </div>
      </div>

      {/* Subject Progress Section */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Progrès par Matière</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Subject Card 1 - Finance */}
          <div 
            className="p-4 rounded-xl border-0 shadow-sm overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)',
              borderLeft: '4px solid #ef4444'
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-1.5" style={{ backgroundColor: '#ef4444' }}>
                  FIN
                </span>
                <h4 className="font-semibold text-foreground text-sm">Finance</h4>
              </div>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Temps d'étude</p>
                <p className="text-base font-bold text-foreground">4.5h</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Sessions</p>
                <p className="text-base font-bold text-foreground">3</p>
              </div>
            </div>
          </div>

          {/* Subject Card 2 - MCG */}
          <div 
            className="p-4 rounded-xl border-0 shadow-sm overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.03) 100%)',
              borderLeft: '4px solid #22c55e'
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-1.5" style={{ backgroundColor: '#22c55e' }}>
                  MCG
                </span>
                <h4 className="font-semibold text-foreground text-sm">MCG</h4>
              </div>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Temps d'étude</p>
                <p className="text-base font-bold text-foreground">5h</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Sessions</p>
                <p className="text-base font-bold text-foreground">3</p>
              </div>
            </div>
          </div>

          {/* Subject Card 3 - MSI */}
          <div 
            className="p-4 rounded-xl border-0 shadow-sm overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.03) 100%)',
              borderLeft: '4px solid #3b82f6'
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-1.5" style={{ backgroundColor: '#3b82f6' }}>
                  MSI
                </span>
                <h4 className="font-semibold text-foreground text-sm">MSI</h4>
              </div>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Temps d'étude</p>
                <p className="text-base font-bold text-foreground">3h</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Sessions</p>
                <p className="text-base font-bold text-foreground">2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cumulative Progress Section */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Objectifs Cumulés</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Progress Bar 1 */}
            <div className="p-3 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                  <span className="text-sm font-medium">Finance</span>
                </div>
                <span className="text-xs text-muted-foreground">18h / 25h</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '72%', backgroundColor: '#ef4444' }} />
              </div>
            </div>
            {/* Progress Bar 2 */}
            <div className="p-3 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                  <span className="text-sm font-medium">MCG</span>
                </div>
                <span className="text-xs text-muted-foreground">22h / 30h</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '73%', backgroundColor: '#22c55e' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FeatureProgression = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-5 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft delay-1000" />
      </div>

      {/* Hero Section */}
      <main className="relative pt-24 md:pt-32">
        <div className="max-w-5xl mx-auto px-4 text-center">
          {/* Main heading */}
          <div className="space-y-4 md:space-y-6 animate-slide-up mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Suivi de
              <br />
              <span className="gradient-text-animated font-heading">
                Progression
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Visualise tes progrès en temps réel. Suis ton temps d'étude par matière, 
            ton taux de complétion et atteins tes objectifs de révision semaine après semaine.
          </p>

          {/* CTA Button */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/auth?mode=signup">
              <Button variant="outline" size="lg" className="rounded-full px-6">
                Suivre ma progression
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Static Progression Preview */}
        <div className="relative max-w-6xl mx-auto px-4 mt-16 pb-16">
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StaticProgressionCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureProgression;