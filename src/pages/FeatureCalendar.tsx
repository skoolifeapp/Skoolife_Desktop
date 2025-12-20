import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2, Upload, Settings, RefreshCw, Bell, Sun } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Static Calendar Card Component
const StaticCalendarCard = () => (
  <div className="h-[500px] md:h-[600px] flex flex-col bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-xl">
    {/* App Header Bar */}
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20 bg-[#FFFDF8] dark:bg-card">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">S</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <ChevronRight className="w-3 h-3" />
          <span className="text-sm font-medium text-foreground">Calendrier</span>
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
    <div className="flex items-center justify-between px-6 py-4">
      <h2 className="text-xl font-bold text-foreground">Semaine du 15 déc.</h2>
      <div className="hidden md:flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium">
          <Plus className="w-3.5 h-3.5" />
          Ajouter un évènement
        </button>
        <button className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
          <Upload className="w-3.5 h-3.5" />
        </button>
        <button className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button className="px-3 py-1.5 rounded-full border border-primary/40 text-primary text-xs font-medium bg-white dark:bg-card">
          Aujourd'hui
        </button>
        <button className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 flex px-6 pb-4 gap-4 overflow-hidden">
      {/* Left Sidebar */}
      <div className="hidden md:flex w-52 flex-col gap-3">
        {/* Stats Card */}
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-3">Cette semaine</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-tight">6h</p>
                <p className="text-xs text-muted-foreground">planifiées</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-tight">2</p>
                <p className="text-xs text-muted-foreground">sessions terminées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exams */}
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex-1">
          <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            Prochains examens
          </p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">FINANCE <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                <p className="text-xs text-muted-foreground">14 janv.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">MCG <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                <p className="text-xs text-muted-foreground">14 janv.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">MSI <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                <p className="text-xs text-muted-foreground">16 janv.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          <RefreshCw className="w-3.5 h-3.5" />
          Générer mon planning
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 rounded-xl border border-border/30 bg-white dark:bg-card overflow-hidden shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-border/20">
          {[
            { day: 'LUN.', num: '15' },
            { day: 'MAR.', num: '16' },
            { day: 'MER.', num: '17' },
            { day: 'JEU.', num: '18' },
            { day: 'VEN.', num: '19' },
            { day: 'SAM.', num: '20', today: true },
            { day: 'DIM.', num: '21' },
          ].map((d, i) => (
            <div key={i} className={`py-2 text-center border-r border-border/10 last:border-r-0`}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{d.day}</p>
              <p className={`text-base font-semibold ${d.today ? 'text-red-500' : 'text-foreground'}`}>{d.num}</p>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="relative h-[300px] overflow-hidden">
          <div className="h-full">
            {['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map((time, i) => (
              <div key={i} className="h-[37.5px] flex border-b border-border/10">
                <div className="w-12 text-right pr-2 pt-0.5 text-[10px] text-muted-foreground">{time}</div>
                <div className="flex-1 grid grid-cols-7">
                  {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                    <div key={col} className="border-r border-border/10 last:border-r-0" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Events overlay */}
          <div className="absolute inset-0 pl-12">
            <div className="absolute rounded-md bg-blue-400 p-1.5 text-white text-[10px]"
              style={{ left: `calc(3 * 100% / 7 + 2px)`, width: `calc(100% / 7 - 4px)`, top: '75px', height: '120px' }}>
              <p className="font-semibold truncate">TEC 535 M...</p>
              <p className="opacity-80">09:00 - 12:30</p>
            </div>
            
            <div className="absolute rounded-md bg-green-200 dark:bg-green-800/50 border border-green-300 p-1.5 text-[10px] flex items-start justify-between"
              style={{ left: `calc(5 * 100% / 7 + 2px)`, width: `calc(100% / 7 - 4px)`, top: '75px', height: '37px' }}>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">MSI</p>
              </div>
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            </div>
            
            <div className="absolute rounded-md bg-yellow-400 p-1.5 text-white text-[10px]"
              style={{ left: `calc(6 * 100% / 7 + 2px)`, width: `calc(100% / 7 - 4px)`, top: '75px', height: '112px' }}>
              <p className="font-semibold truncate">Cours d'ara...</p>
              <p className="opacity-80">09:00 - 12:00</p>
            </div>
            
            <div className="absolute h-0.5 bg-red-500"
              style={{ left: `calc(5 * 100% / 7)`, width: `calc(100% / 7)`, top: '168px' }}>
              <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FeatureCalendar = () => {
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
          <div className="space-y-4 md:space-y-6 animate-slide-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Calendrier
              <br />
              <span className="gradient-text-animated font-heading">
                Intelligent
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Planifie tes sessions de révisions avec une planification intelligente. 
            Suis les échéances, gère ton calendrier académique et reçois des rappels 
            intelligents pour optimiser ta routine d'apprentissage et obtenir de meilleurs résultats.
          </p>

          {/* CTA Button */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/auth?mode=signup">
              <Button variant="outline" size="lg" className="rounded-full px-6">
                Commencer à organiser tes études
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Static Calendar Preview */}
        <div className="relative max-w-6xl mx-auto px-4 mt-16 pb-16">
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StaticCalendarCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureCalendar;
