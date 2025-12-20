import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock, CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2, Upload, RefreshCw, Bell, Sun, Settings, BarChart3, GraduationCap, Timer } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import logo from '@/assets/logo.png';

// Static Calendar Card Component - Fake test account with mock data
const StaticCalendarCard = () => {
  const mockEvents = [
    // Alternance events (blue) - Lundi, Mardi, Mercredi, Vendredi
    { day: 0, title: 'Alternance', time: '09:30 - 18:00', color: 'bg-blue-100 dark:bg-blue-900/40', textColor: 'text-blue-700 dark:text-blue-300', top: '16%', height: '65%' },
    { day: 1, title: 'Alternance', time: '09:30 - 18:00', color: 'bg-blue-100 dark:bg-blue-900/40', textColor: 'text-blue-700 dark:text-blue-300', top: '16%', height: '65%' },
    { day: 2, title: 'Alternance', time: '09:30 - 18:00', color: 'bg-blue-100 dark:bg-blue-900/40', textColor: 'text-blue-700 dark:text-blue-300', top: '16%', height: '65%' },
    { day: 4, title: 'Alternance', time: '09:30 - 18:00', color: 'bg-blue-100 dark:bg-blue-900/40', textColor: 'text-blue-700 dark:text-blue-300', top: '16%', height: '45%' },
    // FINANCE events (pink/red) - Jeudi, Samedi, Dimanche
    { day: 3, title: 'FINANCE', time: '14:00 - 16:00', color: 'bg-red-100 dark:bg-red-900/40', textColor: 'text-red-600 dark:text-red-300', top: '60%', height: '18%', completed: true },
    { day: 5, title: 'FINANCE', time: '08:00 - 10:00', color: 'bg-red-100 dark:bg-red-900/40', textColor: 'text-red-600 dark:text-red-300', top: '0%', height: '18%', completed: true },
    { day: 5, title: 'FINANCE', time: '10:30 - 12:30', color: 'bg-red-100 dark:bg-red-900/40', textColor: 'text-red-600 dark:text-red-300', top: '25%', height: '18%', completed: true },
    { day: 5, title: 'FINANCE', time: '14:00 - 16:00', color: 'bg-red-100 dark:bg-red-900/40', textColor: 'text-red-600 dark:text-red-300', top: '60%', height: '18%', completed: true },
    { day: 6, title: 'FINANCE', time: '14:00 - 16:00', color: 'bg-red-100 dark:bg-red-900/40', textColor: 'text-red-600 dark:text-red-300', top: '60%', height: '18%', completed: true },
    // Cours de piano (yellow/amber) - Dimanche
    { day: 6, title: 'Cours de piano', time: '09:00 - 12:00', color: 'bg-amber-100 dark:bg-amber-900/40', textColor: 'text-amber-700 dark:text-amber-300', top: '10%', height: '30%' },
  ];

  return (
    <div className="h-[520px] md:h-[620px] flex bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-2xl">
      {/* Yellow Sidebar - Compact */}
      <div className="hidden md:flex w-16 flex-col bg-primary text-primary-foreground items-center py-4">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl overflow-hidden mb-8">
          <img src={logo} alt="Skoolife" className="w-full h-full object-cover" />
        </div>

        {/* Navigation Icons */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-foreground/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
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
            <Calendar className="w-4 h-4" />
            <span className="text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Calendrier</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full hover:bg-muted/50">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-full hover:bg-muted/50">
              <Sun className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-bold text-foreground">Semaine du 22 déc.</h2>
          <div className="hidden md:flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              <Plus className="w-4 h-4" />
              Ajouter un évènement
            </button>
            <button className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
              <Upload className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-4 py-2 rounded-full border border-primary/40 text-primary text-sm font-medium bg-white dark:bg-card">
              Aujourd'hui
            </button>
            <button className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
              <ChevronRight className="w-4 h-4" />
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
                    <p className="text-2xl font-bold text-foreground leading-tight">18h</p>
                    <p className="text-xs text-muted-foreground">planifiées</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground leading-tight">0</p>
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
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">FINANCE <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                    <p className="text-xs text-muted-foreground">14 janv.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">MCG <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                    <p className="text-xs text-muted-foreground">14 janv.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">MSI <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                    <p className="text-xs text-muted-foreground">16 janv.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
              <RefreshCw className="w-4 h-4" />
              Générer mon planning
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 rounded-xl border border-border/30 bg-white dark:bg-card overflow-hidden shadow-sm flex flex-col">
            {/* Days Header */}
            <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700">
              <div></div>
              {[
                { day: 'LUN.', num: '22' },
                { day: 'MAR.', num: '23' },
                { day: 'MER.', num: '24' },
                { day: 'JEU.', num: '25' },
                { day: 'VEN.', num: '26' },
                { day: 'SAM.', num: '27' },
                { day: 'DIM.', num: '28' },
              ].map((d, i) => (
                <div key={i} className="py-3 text-center border-l border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{d.day}</p>
                  <p className="text-lg font-semibold text-foreground">{d.num}</p>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="relative flex-1 overflow-hidden">
              <div className="absolute inset-0 flex flex-col">
                {['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'].map((time, i) => (
                  <div key={i} className="flex-1 flex border-b border-gray-200 dark:border-gray-700">
                    <div className="w-12 text-right pr-2 pt-0.5 text-[10px] text-muted-foreground">{time}</div>
                    <div className="flex-1 grid grid-cols-7">
                      {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                        <div key={col} className="border-l border-gray-200 dark:border-gray-700" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Events overlay */}
              <div className="absolute inset-0 ml-12">
                {mockEvents.map((event, idx) => (
                  <div 
                    key={idx}
                    className={`absolute rounded-lg ${event.color} p-2 text-xs shadow-sm`}
                    style={{ 
                      left: `calc((${event.day} * 100% / 7) + 2px)`, 
                      width: `calc(100% / 7 - 4px)`, 
                      top: event.top, 
                      height: event.height 
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold truncate ${event.textColor}`}>{event.title}</p>
                        <p className={`text-[10px] ${event.textColor} opacity-70`}>{event.time}</p>
                      </div>
                      {event.completed && (
                        <CheckCircle2 className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
          <div className="space-y-4 md:space-y-6 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Calendrier
              <br />
              <span className="gradient-text-animated font-heading">
                Intelligent
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Planifie tes sessions de révisions avec une planification intelligente. 
            Suis les échéances, gère ton calendrier académique et reçois des rappels 
            intelligents pour optimiser ta routine d'apprentissage.
          </p>

          {/* CTA Button */}
          <div>
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
          <div>
            <StaticCalendarCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureCalendar;
