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
  GraduationCap
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
    
    if (position === 0) {
      return {
        zIndex: 30,
        transform: 'translateY(0) translateX(0) scale(1)',
        opacity: 1,
        filter: 'blur(0px)',
      };
    } else if (position === 1) {
      return {
        zIndex: 20,
        transform: 'translateY(-20px) translateX(16px) scale(0.96)',
        opacity: 0.9,
        filter: 'blur(0.5px)',
      };
    } else {
      return {
        zIndex: 10,
        transform: 'translateY(-40px) translateX(32px) scale(0.92)',
        opacity: 0.75,
        filter: 'blur(1px)',
      };
    }
  };

  const handleCardClick = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <div className="relative w-full max-w-[800px] mx-auto" style={{ perspective: '1200px' }}>
      <div className="relative h-[520px] md:h-[580px]">
        {cards.map((card, index) => {
          const style = getCardStyle(index);
          const isActive = index === activeIndex;
          
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`absolute inset-0 rounded-2xl md:rounded-3xl bg-card border border-border/30 overflow-hidden
                transition-all duration-500 ease-out
                ${!isActive ? 'cursor-pointer hover:opacity-95' : ''}`}
              style={{
                zIndex: style.zIndex,
                transform: style.transform,
                opacity: style.opacity,
                filter: style.filter,
                boxShadow: isActive 
                  ? '0 25px 60px -15px rgba(0, 0, 0, 0.12), 0 10px 30px -8px rgba(0, 0, 0, 0.06)'
                  : '0 15px 40px -12px rgba(0, 0, 0, 0.08)',
              }}
            >
              {card.content}
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-primary w-8' 
                : 'bg-border hover:bg-primary/50 w-2'
            }`}
            aria-label={`Voir ${card.title}`}
          />
        ))}
      </div>
    </div>
  );
};

// ===== CALENDAR CARD - Exact replica =====
const CalendarCard = () => (
  <div className="h-full flex flex-col bg-[#fefefe] dark:bg-card">
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
      <h2 className="text-xl md:text-2xl font-bold text-foreground">Semaine du 15 déc.</h2>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter un évènement</span>
        </button>
        <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50">
          <Upload className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
          <Trash2 className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="px-4 py-2 rounded-full border border-primary/30 text-primary text-sm">
          Aujourd'hui
        </button>
        <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-56 p-4 space-y-4 border-r border-border/20">
        {/* Stats Card */}
        <div className="p-4 rounded-2xl border border-border/30 bg-card">
          <p className="text-sm font-semibold text-foreground mb-3">Cette semaine</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">6h</p>
                <p className="text-xs text-muted-foreground">planifiées</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-xs text-muted-foreground">sessions terminées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exams */}
        <div className="p-4 rounded-2xl border border-border/30 bg-card">
          <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            Prochains examens
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">FINANCE <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                <p className="text-xs text-muted-foreground">14 janv.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">MCG <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                <p className="text-xs text-muted-foreground">14 janv.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">MSI <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                <p className="text-xs text-muted-foreground">16 janv.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.636 5.636l2.121 2.121m8.486 8.486l2.121 2.121M5.636 18.364l2.121-2.121m8.486-8.486l2.121-2.121"/>
          </svg>
          Générer mon planning
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4">
        <div className="h-full rounded-2xl border border-border/30 bg-card overflow-hidden">
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
              <div key={i} className={`py-3 text-center border-r border-border/10 last:border-r-0 ${d.today ? 'text-red-500' : ''}`}>
                <p className="text-[10px] text-muted-foreground uppercase">{d.day}</p>
                <p className={`text-lg font-semibold ${d.today ? 'text-red-500' : 'text-foreground'}`}>{d.num}</p>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative h-[280px] overflow-hidden">
            {/* Hour labels */}
            <div className="absolute left-0 top-0 w-12 h-full text-[10px] text-muted-foreground">
              {['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00'].map((t, i) => (
                <div key={i} className="h-10 flex items-start justify-end pr-2 pt-0.5">{t}</div>
              ))}
            </div>
            
            {/* Grid lines */}
            <div className="ml-12 h-full">
              {[0, 1, 2, 3, 4, 5, 6].map((_, i) => (
                <div key={i} className="h-10 border-b border-border/10" />
              ))}
              
              {/* Events */}
              {/* TEC 535 - Thursday 9:00-12:30 */}
              <div className="absolute left-[calc(12px+3*(100%-48px)/7+48px)] top-[80px] w-[calc((100%-48px)/7-8px)] h-[100px] rounded-lg bg-blue-400/90 p-2 text-white text-[10px]">
                <p className="font-semibold truncate">TEC 535 M...</p>
                <p className="opacity-80">09:00 - 12:30</p>
              </div>
              
              {/* MSI - Saturday 9:00-10:00 */}
              <div className="absolute left-[calc(12px+5*(100%-48px)/7+48px)] top-[80px] w-[calc((100%-48px)/7-8px)] h-[40px] rounded-lg bg-green-400/90 p-2 text-white text-[10px] flex items-center justify-between">
                <div>
                  <p className="font-semibold">MSI</p>
                  <p className="opacity-80 text-[8px]">09:00 - 10:00</p>
                </div>
                <CheckCircle2 className="w-3 h-3" />
              </div>
              
              {/* Cours d'arabe - Sunday 9:00-12:00 */}
              <div className="absolute left-[calc(12px+6*(100%-48px)/7+48px)] top-[80px] w-[calc((100%-48px)/7-8px)] h-[80px] rounded-lg bg-yellow-400/90 p-2 text-white text-[10px]">
                <p className="font-semibold truncate">Cours d'ara...</p>
                <p className="opacity-80">09:00 - 12:00</p>
              </div>
              
              {/* Current time indicator */}
              <div className="absolute left-[calc(12px+5*(100%-48px)/7+48px)] top-[170px] w-[calc((100%-48px)/7-8px)] h-0.5 bg-red-500">
                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ===== PROGRESSION CARD - Exact replica =====
const ProgressionCard = () => (
  <div className="h-full flex flex-col bg-[#fefefe] dark:bg-card">
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Tableau de Bord des Progrès</h2>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-foreground px-3">Cette semaine</span>
        <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 p-5 space-y-5 overflow-y-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border/30 bg-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Heures d'étude</p>
            <p className="text-3xl font-bold text-foreground">3h</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-border/30 bg-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Taux de complétion</p>
            <p className="text-3xl font-bold text-foreground">33%</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-border/30 bg-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sessions réalisées</p>
            <p className="text-3xl font-bold text-foreground">2</p>
          </div>
        </div>
      </div>

      {/* Progress by Subject */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Progrès par Matière
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border-t-4 border-blue-400 relative">
            <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[10px] font-medium bg-blue-400 text-white px-2 py-0.5 rounded">MSI</span>
            <p className="text-2xl font-bold mt-3 text-foreground">MSI</p>
            <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Temps d'étude
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Sessions
              </div>
            </div>
            <div className="flex gap-6 mt-1">
              <p className="text-xl font-bold text-foreground">3h</p>
              <p className="text-xl font-bold text-foreground">2</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/30 border-t-4 border-red-400 relative">
            <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-[10px] font-medium bg-red-400 text-white px-2 py-0.5 rounded">FIN</span>
            <p className="text-2xl font-bold mt-3 text-foreground">FINANCE</p>
            <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Temps d'étude
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Sessions
              </div>
            </div>
            <div className="flex gap-6 mt-1">
              <p className="text-xl font-bold text-foreground">0h</p>
              <p className="text-xl font-bold text-foreground">0</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-950/30 border-t-4 border-green-400 relative">
            <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-medium bg-green-400 text-white px-2 py-0.5 rounded">MCG</span>
            <p className="text-2xl font-bold mt-3 text-foreground">MCG</p>
            <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Temps d'étude
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Sessions
              </div>
            </div>
            <div className="flex gap-6 mt-1">
              <p className="text-xl font-bold text-foreground">0h</p>
              <p className="text-xl font-bold text-foreground">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cumulative Hours */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Heures cumulées par Matière
        </p>
        <div className="p-5 rounded-2xl border border-border/30 bg-card space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-foreground">MSI</span>
              </div>
              <span className="text-sm text-muted-foreground">3h / 19h</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 right-0 w-[95%] bg-green-200/50 dark:bg-green-900/20 rounded-full" />
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '16%' }} />
            </div>
            <p className="text-xs text-blue-500 mt-1">16% effectué</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-foreground">FINANCE</span>
              </div>
              <span className="text-sm text-muted-foreground">0h / 32h</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '0%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ===== MATIERES CARD - Exact replica =====
const MatieresCard = () => (
  <div className="h-full flex flex-col bg-[#fefefe] dark:bg-card">
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Mes matières & examens</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Ajoute tes matières, leurs dates d'examen et ton objectif d'heures de révision.</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
        <Plus className="w-4 h-4" />
        Ajouter une matière
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 p-5 space-y-5 overflow-y-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border/30 bg-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Matières actives</p>
            <p className="text-3xl font-bold text-foreground">4</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-border/30 bg-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prochain examen</p>
            <p className="text-lg font-bold text-foreground">FINANCE <span className="text-red-500">J-24</span></p>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-border/30 bg-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Heures totales visées</p>
            <p className="text-3xl font-bold text-foreground">90h</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: 'Toutes (4)', active: true },
          { label: 'Partiel (4)', active: false },
          { label: 'Contrôle continu (0)', active: false },
          { label: 'Oral (0)', active: false },
          { label: 'Projet (0)', active: false },
        ].map((f, i) => (
          <button 
            key={i} 
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              f.active 
                ? 'bg-foreground text-background border-foreground' 
                : 'border-primary/30 text-primary hover:bg-primary/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/30 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr,1fr,0.8fr,0.8fr,0.6fr,40px] gap-4 px-5 py-3 bg-muted/30 text-xs text-muted-foreground font-medium">
          <span>Matière</span>
          <span>Date d'examen</span>
          <span>Objectif</span>
          <span>Priorité</span>
          <span>Statut</span>
          <span></span>
        </div>
        
        {/* Table Rows */}
        {[
          { name: 'FINANCE', color: 'bg-red-500', date: '14/01/2026', hours: '35h', priority: 'Haute', priorityColor: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
          { name: 'MCG', color: 'bg-green-500', date: '14/01/2026', hours: '25h', priority: 'Haute', priorityColor: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
          { name: 'MSI', color: 'bg-blue-500', date: '16/01/2026', hours: '20h', priority: 'Moyenne', priorityColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
          { name: 'Anglais', color: 'bg-yellow-500', date: '16/01/2026', hours: '10h', priority: 'Basse', priorityColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
        ].map((subject, i) => (
          <div key={i} className="grid grid-cols-[1fr,1fr,0.8fr,0.8fr,0.6fr,40px] gap-4 px-5 py-4 items-center border-t border-border/20 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${subject.color}`} />
              <span className="font-semibold text-foreground">{subject.name}</span>
            </div>
            <span className="text-muted-foreground">{subject.date}</span>
            <span className="text-muted-foreground">{subject.hours}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${subject.priorityColor}`}>
              {subject.priority}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 w-fit">
              Active
            </span>
            <button className="text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StackedCardsLayout;
