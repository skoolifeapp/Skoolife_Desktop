import { useState } from 'react';
import { 
  Calendar, 
  BarChart3, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Target, 
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  TrendingUp,
  Settings,
  GraduationCap,
  RefreshCw,
  Bell,
  Sun
} from 'lucide-react';

interface CardData {
  id: number;
  title: string;
  content: React.ReactNode;
}

const StackedCardsLayout = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const cards: CardData[] = [
    {
      id: 0,
      title: 'Calendrier',
      content: <CalendarCard />,
    },
    {
      id: 1,
      title: 'Progression',
      content: <ProgressionCard />,
    },
    {
      id: 2,
      title: 'Matières',
      content: <MatieresCard />,
    },
  ];

  const getCardStyle = (index: number) => {
    const position = (index - activeIndex + cards.length) % cards.length;
    
    // Cards stack BEHIND (negative Y = up)
    if (position === 0) {
      return {
        zIndex: 30,
        transform: 'translateY(0) scale(1)',
        opacity: 1,
      };
    } else if (position === 1) {
      return {
        zIndex: 20,
        transform: 'translateY(-20px) scale(0.96)',
        opacity: 0.85,
      };
    } else {
      return {
        zIndex: 10,
        transform: 'translateY(-40px) scale(0.92)',
        opacity: 0.6,
      };
    }
  };

  const handleCardClick = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Cards container with clipping */}
      <div className="relative h-[360px] md:h-[400px] overflow-hidden">
        {cards.map((card, index) => {
          const style = getCardStyle(index);
          const isActive = index === activeIndex;
          
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`absolute inset-x-0 rounded-t-xl md:rounded-t-2xl bg-white dark:bg-card border border-border/20 border-b-0 overflow-hidden
                transition-all duration-500 ease-out
                ${!isActive ? 'cursor-pointer hover:opacity-90' : ''}`}
              style={{
                zIndex: style.zIndex,
                transform: style.transform,
                opacity: style.opacity,
                height: '600px',
                top: '50px',
                boxShadow: '0 -8px 30px -10px rgba(0, 0, 0, 0.15)',
              }}
            >
              {card.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===== CALENDAR CARD - WITH APP HEADER =====
const CalendarCard = () => (
  <div className="h-full flex flex-col bg-[#FFFDF8] dark:bg-card">
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
      <div className="flex items-center gap-2">
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
      <div className="w-52 flex flex-col gap-3">
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
        <div className="relative h-[240px] overflow-hidden">
          <div className="h-full">
            {['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map((time, i) => (
              <div key={i} className="h-[30px] flex border-b border-border/10">
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
              style={{ left: `calc(3 * 100% / 7 + 2px)`, width: `calc(100% / 7 - 4px)`, top: '60px', height: '100px' }}>
              <p className="font-semibold truncate">TEC 535 M...</p>
              <p className="opacity-80">09:00 - 12:30</p>
            </div>
            
            <div className="absolute rounded-md bg-green-200 dark:bg-green-800/50 border border-green-300 p-1.5 text-[10px] flex items-start justify-between"
              style={{ left: `calc(5 * 100% / 7 + 2px)`, width: `calc(100% / 7 - 4px)`, top: '60px', height: '30px' }}>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">MSI</p>
              </div>
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            </div>
            
            <div className="absolute rounded-md bg-yellow-400 p-1.5 text-white text-[10px]"
              style={{ left: `calc(6 * 100% / 7 + 2px)`, width: `calc(100% / 7 - 4px)`, top: '60px', height: '90px' }}>
              <p className="font-semibold truncate">Cours d'ara...</p>
              <p className="opacity-80">09:00 - 12:00</p>
            </div>
            
            <div className="absolute h-0.5 bg-red-500"
              style={{ left: `calc(5 * 100% / 7)`, width: `calc(100% / 7)`, top: '135px' }}>
              <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ===== PROGRESSION CARD =====
const ProgressionCard = () => (
  <div className="h-full flex flex-col bg-[#FFFDF8] dark:bg-card">
    {/* App Header Bar */}
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">S</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <BarChart3 className="w-4 h-4" />
          <ChevronRight className="w-3 h-3" />
          <span className="text-sm font-medium text-foreground">Progression</span>
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
    <div className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Tableau de Bord des Progrès</h2>
      </div>
      <div className="flex items-center gap-1">
        <button className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-foreground px-3 py-1.5 border border-border/50 rounded-full bg-white dark:bg-card">Cette semaine</span>
        <button className="w-8 h-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 px-6 pb-4 space-y-4 overflow-y-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Heures d'étude</p>
            <p className="text-2xl font-bold text-foreground">3h</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Taux de complétion</p>
            <p className="text-2xl font-bold text-foreground">33%</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sessions réalisées</p>
            <p className="text-2xl font-bold text-foreground">2</p>
          </div>
        </div>
      </div>

      {/* Progress by Subject */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Progrès par Matière
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 border-l-4 border-blue-400 relative">
            <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-semibold bg-blue-500 text-white px-2 py-0.5 rounded">MSI</span>
            <p className="text-lg font-bold mt-2 text-foreground">MSI</p>
            <div className="flex gap-6 mt-2">
              <div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Temps</p>
                <p className="text-base font-bold text-foreground">3h</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> Sessions</p>
                <p className="text-base font-bold text-foreground">2</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/20 border-l-4 border-red-400 relative">
            <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[10px] font-semibold bg-red-500 text-white px-2 py-0.5 rounded">FIN</span>
            <p className="text-lg font-bold mt-2 text-foreground">FINANCE</p>
            <div className="flex gap-6 mt-2">
              <div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Temps</p>
                <p className="text-base font-bold text-foreground">0h</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> Sessions</p>
                <p className="text-base font-bold text-foreground">0</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20 border-l-4 border-green-400 relative">
            <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-semibold bg-green-500 text-white px-2 py-0.5 rounded">MCG</span>
            <p className="text-lg font-bold mt-2 text-foreground">MCG</p>
            <div className="flex gap-6 mt-2">
              <div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Temps</p>
                <p className="text-base font-bold text-foreground">0h</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> Sessions</p>
                <p className="text-base font-bold text-foreground">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cumulative Hours */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Heures cumulées par Matière
        </p>
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-foreground">MSI</span>
              </div>
              <span className="text-xs text-muted-foreground">3h / 19h</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 right-0 w-[95%] bg-green-100 dark:bg-green-900/30 rounded-full" />
              <div className="h-full bg-blue-500 rounded-full relative z-10" style={{ width: '16%' }} />
            </div>
            <p className="text-[10px] text-blue-500 mt-1">16% effectué</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ===== MATIERES CARD =====
const MatieresCard = () => (
  <div className="h-full flex flex-col bg-[#FFFDF8] dark:bg-card">
    {/* App Header Bar */}
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">S</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <ChevronRight className="w-3 h-3" />
          <span className="text-sm font-medium text-foreground">Matières</span>
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
    <div className="flex items-center justify-between px-6 py-3">
      <div>
        <h2 className="text-lg font-bold text-foreground">Mes matières & examens</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Ajoute tes matières, leurs dates d'examen et ton objectif d'heures de révision.</p>
      </div>
      <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium">
        <Plus className="w-3.5 h-3.5" />
        Ajouter une matière
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 px-6 pb-4 space-y-4 overflow-y-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Matières actives</p>
            <p className="text-2xl font-bold text-foreground">4</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prochain examen</p>
            <p className="text-sm font-bold text-foreground">FINANCE <span className="text-red-500">J-24</span></p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Heures totales visées</p>
            <p className="text-2xl font-bold text-foreground">90h</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-foreground text-background">Toutes (4)</button>
        <button className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/40 text-primary bg-white dark:bg-card">Partiel (4)</button>
        <button className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/40 text-primary bg-white dark:bg-card">Contrôle continu (0)</button>
        <button className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/40 text-primary bg-white dark:bg-card">Oral (0)</button>
        <button className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/40 text-primary bg-white dark:bg-card">Projet (0)</button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/30 bg-white dark:bg-card overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1.2fr,1fr,0.8fr,0.8fr,0.7fr,32px] gap-3 px-4 py-2.5 text-xs text-muted-foreground font-medium border-b border-border/20">
          <span>Matière</span>
          <span>Date d'examen</span>
          <span>Objectif</span>
          <span>Priorité</span>
          <span>Statut</span>
          <span></span>
        </div>
        
        {[
          { name: 'FINANCE', color: 'bg-red-500', date: '14/01/2026', hours: '35h', priority: 'Haute', pColor: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
          { name: 'MCG', color: 'bg-green-500', date: '14/01/2026', hours: '25h', priority: 'Haute', pColor: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
          { name: 'MSI', color: 'bg-blue-500', date: '16/01/2026', hours: '20h', priority: 'Moyenne', pColor: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
          { name: 'Anglais', color: 'bg-yellow-500', date: '16/01/2026', hours: '10h', priority: 'Basse', pColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
        ].map((s, i) => (
          <div key={i} className="grid grid-cols-[1.2fr,1fr,0.8fr,0.8fr,0.7fr,32px] gap-3 px-4 py-3 items-center border-t border-border/10 first:border-t-0">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="font-semibold text-sm text-foreground">{s.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{s.date}</span>
            <span className="text-xs text-muted-foreground">{s.hours}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${s.pColor}`}>{s.priority}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 w-fit">Active</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StackedCardsLayout;
