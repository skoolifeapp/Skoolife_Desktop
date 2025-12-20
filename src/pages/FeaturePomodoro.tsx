import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Timer, Play, RotateCcw, Coffee, Moon, Clock, Bell, Sun, ChevronRight, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Static Pomodoro Card Component
const StaticPomodoroCard = () => (
  <div className="h-[500px] md:h-[600px] flex flex-col bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-xl">
    {/* App Header Bar */}
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20 bg-[#FFFDF8] dark:bg-card">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">S</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Timer className="w-4 h-4" />
          <ChevronRight className="w-3 h-3" />
          <span className="text-sm font-medium text-foreground">Pomodoro</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-full hover:bg-muted/50">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="p-2 rounded-full hover:bg-muted/50">
          <Sun className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>

    {/* Page Header */}
    <div className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Timer className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Pomodoro</h2>
          <p className="text-sm text-muted-foreground">Concentre-toi avec la méthode 25/5</p>
        </div>
      </div>
    </div>

    {/* Mode Tabs */}
    <div className="flex items-center justify-center gap-2 px-6 pb-4">
      <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
        <Timer className="w-4 h-4" />
        Focus
      </button>
      <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 text-primary text-sm">
        <Coffee className="w-4 h-4" />
        Pause courte
      </button>
      <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 text-primary text-sm">
        <Moon className="w-4 h-4" />
        Pause longue
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 flex px-6 pb-4 gap-4 overflow-hidden">
      {/* Timer Area */}
      <div className="flex-1 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex flex-col items-center justify-center">
        {/* Timer Circle */}
        <div className="relative w-48 h-48 md:w-56 md:h-56">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border/30"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${0.85 * 283} 283`}
              strokeLinecap="round"
              className="text-primary"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl md:text-6xl font-bold text-foreground">25:00</span>
            <span className="text-primary text-sm font-medium mt-1">Focus</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mt-6">
          <button className="w-11 h-11 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card hover:bg-muted/50">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <Play className="w-5 h-5 ml-0.5" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pomodoros</p>
              <p className="text-lg font-bold text-foreground">0</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Temps focus</p>
              <p className="text-lg font-bold text-foreground">0 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="hidden md:flex w-72 flex-col gap-2">
        {[
          { subject: 'FINANCE', date: "Aujourd'hui", time: '14:00 - 16:00', color: 'bg-red-100 dark:bg-red-900/30' },
          { subject: 'FINANCE', date: 'Demain', time: '14:00 - 16:00', color: 'bg-red-100 dark:bg-red-900/30' },
          { subject: 'MCG', date: 'Demain', time: '16:30 - 18:30', color: 'bg-green-100 dark:bg-green-900/30' },
          { subject: 'FINANCE', date: 'jeudi 25 déc.', time: '14:00 - 16:00', color: 'bg-red-100 dark:bg-red-900/30' },
          { subject: 'FINANCE', date: 'vendredi 26 déc.', time: '19:00 - 21:00', color: 'bg-red-100 dark:bg-red-900/30' },
        ].map((session, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${session.color} flex items-center justify-center`}>
                <BookOpen className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{session.subject}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{session.date}</span>
                  <Clock className="w-3 h-3" />
                  <span>{session.time}</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 text-primary text-xs font-medium bg-white dark:bg-card hover:bg-primary/5">
              <Play className="w-3 h-3" />
              Focus
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FeaturePomodoro = () => {
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
              Pomodoro
              <br />
              <span className="gradient-text-animated font-heading">
                Timer
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Concentre-toi avec la méthode Pomodoro 25/5. Des sessions de travail 
            intensives suivies de pauses régulières pour maximiser ta productivité 
            et maintenir ta concentration sur la durée.
          </p>

          {/* CTA Button */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/auth?mode=signup">
              <Button variant="outline" size="lg" className="rounded-full px-6">
                Commencer à réviser efficacement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Static Pomodoro Preview */}
        <div className="relative max-w-6xl mx-auto px-4 mt-16 pb-16">
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StaticPomodoroCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturePomodoro;
