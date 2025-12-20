import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CheckCircle2, TrendingUp, ChevronLeft, ChevronRight, BookOpen, Target, Calendar, BarChart3, GraduationCap, Timer, Settings, Bell, Sun } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import logo from '@/assets/logo.png';

// Static Progression Card Component - Reproduit l'interface exacte de l'app
const StaticProgressionCard = () => (
  <div className="h-[520px] md:h-[620px] flex bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-2xl">
    {/* Yellow Sidebar - Compact */}
    <div className="hidden md:flex w-16 flex-col bg-primary text-primary-foreground items-center py-4">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl overflow-hidden mb-8">
        <img src={logo} alt="Skoolife" className="w-full h-full object-cover" />
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-foreground/20">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
          <Settings className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
          <Timer className="w-5 h-5" />
        </div>
      </div>

      {/* User Avatar */}
      <div className="mt-auto pt-4 border-t border-primary-foreground/20 w-full flex justify-center">
        <div className="w-10 h-10 rounded-full bg-primary-foreground/30 flex items-center justify-center text-sm font-medium">
          S
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm">/</span>
          <span className="text-sm font-medium text-foreground">Progression</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-full hover:bg-muted/50">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
          </button>
          <button className="p-2 rounded-full hover:bg-muted/50">
            <Sun className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Tableau de Bord des Progrès</h2>
        </div>
        <div className="hidden md:flex items-center gap-1 border border-border/30 rounded-lg p-1 bg-white dark:bg-card">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 text-sm font-medium">Cette semaine</span>
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
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Heures d'étude</p>
              <p className="text-2xl font-bold text-foreground">3h</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taux de complétion</p>
              <p className="text-2xl font-bold text-foreground">33<span className="text-lg">%</span></p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sessions réalisées</p>
              <p className="text-2xl font-bold text-foreground">2</p>
            </div>
          </div>
        </div>

        {/* Subject Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Progrès par Matière</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Card 1 - MSI (Blue) */}
            <div 
              className="p-4 rounded-xl shadow-sm overflow-hidden relative"
              style={{ 
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)',
              }}
            >
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-blue-500" />
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2" style={{ backgroundColor: '#3b82f6' }}>
                MSI
              </span>
              <h4 className="font-bold text-foreground text-lg mb-3">MSI</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3" /> Temps d'étude
                  </p>
                  <p className="text-xl font-bold text-foreground">3h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <BookOpen className="w-3 h-3" /> Sessions
                  </p>
                  <p className="text-xl font-bold text-foreground">2</p>
                </div>
              </div>
            </div>

            {/* Subject Card 2 - FINANCE (Red/Salmon) */}
            <div 
              className="p-4 rounded-xl shadow-sm overflow-hidden relative"
              style={{ 
                background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
              }}
            >
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500" />
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2" style={{ backgroundColor: '#ef4444' }}>
                FIN
              </span>
              <h4 className="font-bold text-foreground text-lg mb-3">FINANCE</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3" /> Temps d'étude
                  </p>
                  <p className="text-xl font-bold text-foreground">0h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <BookOpen className="w-3 h-3" /> Sessions
                  </p>
                  <p className="text-xl font-bold text-foreground">0</p>
                </div>
              </div>
            </div>

            {/* Subject Card 3 - MCG (Green) */}
            <div 
              className="p-4 rounded-xl shadow-sm overflow-hidden relative"
              style={{ 
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)',
              }}
            >
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500" />
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2" style={{ backgroundColor: '#22c55e' }}>
                MCG
              </span>
              <h4 className="font-bold text-foreground text-lg mb-3">MCG</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3" /> Temps d'étude
                  </p>
                  <p className="text-xl font-bold text-foreground">0h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <BookOpen className="w-3 h-3" /> Sessions
                  </p>
                  <p className="text-xl font-bold text-foreground">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cumulative Progress Section */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Heures cumulées par Matière</h3>
          </div>
          
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm space-y-4">
            {/* MSI Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">MSI</span>
                </div>
                <span className="text-xs text-muted-foreground">3h / 19h</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: '16%' }} />
              </div>
              <p className="text-xs text-blue-600 mt-1">16% effectué</p>
            </div>

            {/* FINANCE Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">FINANCE</span>
                </div>
                <span className="text-xs text-muted-foreground">0h / 32h</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-red-500" style={{ width: '0%' }} />
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
          <div className="space-y-4 md:space-y-6 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Suivi de
              <br />
              <span className="gradient-text-animated font-heading">
                Progression
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Visualise tes progrès en temps réel. Suis ton temps d'étude par matière, 
            ton taux de complétion et atteins tes objectifs de révision semaine après semaine.
          </p>

          {/* CTA Button */}
          <div>
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
          <div>
            <StaticProgressionCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureProgression;
