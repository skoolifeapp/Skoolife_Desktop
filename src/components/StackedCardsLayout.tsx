import { useState } from 'react';
import { Calendar, BarChart3, BookOpen, Clock, CheckCircle2, Target, ChevronRight } from 'lucide-react';

interface CardData {
  id: number;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const StackedCardsLayout = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const cards: CardData[] = [
    {
      id: 0,
      title: 'Calendrier',
      icon: <Calendar className="w-5 h-5" />,
      content: <CalendarCard />,
    },
    {
      id: 1,
      title: 'Progression',
      icon: <BarChart3 className="w-5 h-5" />,
      content: <ProgressionCard />,
    },
    {
      id: 2,
      title: 'Matières',
      icon: <BookOpen className="w-5 h-5" />,
      content: <MatieresCard />,
    },
  ];

  const getCardStyle = (index: number) => {
    const position = (index - activeIndex + cards.length) % cards.length;
    
    if (position === 0) {
      // Active card - front
      return {
        zIndex: 30,
        transform: 'translateY(0) translateX(0) scale(1)',
        opacity: 1,
        filter: 'blur(0px)',
      };
    } else if (position === 1) {
      // Second card - behind
      return {
        zIndex: 20,
        transform: 'translateY(-24px) translateX(20px) scale(0.95)',
        opacity: 0.85,
        filter: 'blur(0.5px)',
      };
    } else {
      // Third card - most behind
      return {
        zIndex: 10,
        transform: 'translateY(-48px) translateX(40px) scale(0.9)',
        opacity: 0.7,
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
    <div className="relative w-full max-w-xl mx-auto" style={{ perspective: '1000px' }}>
      <div className="relative h-[380px] md:h-[420px]">
        {cards.map((card, index) => {
          const style = getCardStyle(index);
          const isActive = index === activeIndex;
          
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`absolute inset-0 rounded-2xl md:rounded-3xl bg-card border border-border/40 shadow-xl overflow-hidden
                transition-all duration-400 ease-out
                ${!isActive ? 'cursor-pointer hover:opacity-95' : ''}`}
              style={{
                zIndex: style.zIndex,
                transform: style.transform,
                opacity: style.opacity,
                filter: style.filter,
                boxShadow: isActive 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 8px 24px -4px rgba(0, 0, 0, 0.05)'
                  : '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
              }}
            >
              {/* Card Header */}
              <div className="flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 border-b border-border/30 bg-muted/30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {card.icon}
                </div>
                <span className="font-semibold text-foreground text-sm md:text-base">{card.title}</span>
              </div>
              
              {/* Card Content */}
              <div className="p-4 md:p-6">
                {card.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-primary w-6' 
                : 'bg-border hover:bg-primary/50'
            }`}
            aria-label={`Voir ${card.title}`}
          />
        ))}
      </div>
    </div>
  );
};

// Calendar Card Content
const CalendarCard = () => (
  <div className="space-y-4">
    {/* Stats */}
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xl md:text-2xl font-bold text-foreground">6h</p>
          <p className="text-xs text-muted-foreground">planifiées</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <p className="text-xl md:text-2xl font-bold text-foreground">2</p>
          <p className="text-xs text-muted-foreground">terminées</p>
        </div>
      </div>
    </div>

    {/* Mini Week Grid */}
    <div className="grid grid-cols-7 gap-1 mt-4">
      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
        <div key={i} className="text-center">
          <span className="text-[10px] text-muted-foreground">{day}</span>
          <div className={`h-12 mt-1 rounded-md border border-border/30 relative ${i === 4 ? 'bg-primary/5' : 'bg-muted/20'}`}>
            {i === 3 && (
              <div className="absolute inset-x-1 top-1 h-4 rounded-sm bg-blue-400/80 text-[8px] text-white flex items-center justify-center">MSI</div>
            )}
            {i === 5 && (
              <div className="absolute inset-x-1 top-1 h-3 rounded-sm bg-green-400/80" />
            )}
            {i === 6 && (
              <div className="absolute inset-x-1 top-2 h-4 rounded-sm bg-yellow-400/80 text-[8px] flex items-center justify-center">Cours</div>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* Exams */}
    <div className="space-y-2 mt-4">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Target className="w-3 h-3" /> Prochains examens
      </p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-xs text-foreground">FINANCE</span>
        <span className="text-xs text-muted-foreground">14 janv.</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-foreground">MCG</span>
        <span className="text-xs text-muted-foreground">14 janv.</span>
      </div>
    </div>
  </div>
);

// Progression Card Content
const ProgressionCard = () => (
  <div className="space-y-4">
    {/* Stats Row */}
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/20">
        <p className="text-xl md:text-2xl font-bold text-foreground">3h</p>
        <p className="text-[10px] text-muted-foreground">Heures d'étude</p>
      </div>
      <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/20">
        <p className="text-xl md:text-2xl font-bold text-foreground">33%</p>
        <p className="text-[10px] text-muted-foreground">Complétion</p>
      </div>
      <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/20">
        <p className="text-xl md:text-2xl font-bold text-foreground">2</p>
        <p className="text-[10px] text-muted-foreground">Sessions</p>
      </div>
    </div>

    {/* Subject Progress */}
    <div className="space-y-3 mt-4">
      <p className="text-xs font-medium text-muted-foreground">Progrès par matière</p>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-400">
          <span className="text-[10px] font-medium bg-blue-400 text-white px-1.5 py-0.5 rounded">MSI</span>
          <p className="text-sm font-bold mt-2">3h</p>
          <p className="text-[10px] text-muted-foreground">2 sessions</p>
        </div>
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border-l-4 border-red-400">
          <span className="text-[10px] font-medium bg-red-400 text-white px-1.5 py-0.5 rounded">FIN</span>
          <p className="text-sm font-bold mt-2">0h</p>
          <p className="text-[10px] text-muted-foreground">0 sessions</p>
        </div>
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border-l-4 border-green-400">
          <span className="text-[10px] font-medium bg-green-400 text-white px-1.5 py-0.5 rounded">MCG</span>
          <p className="text-sm font-bold mt-2">0h</p>
          <p className="text-[10px] text-muted-foreground">0 sessions</p>
        </div>
      </div>
    </div>

    {/* Progress Bar */}
    <div className="space-y-1 mt-2">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">MSI</span>
        <span className="text-foreground">3h / 19h</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-blue-400 rounded-full" style={{ width: '16%' }} />
      </div>
      <p className="text-[10px] text-blue-500">16% effectué</p>
    </div>
  </div>
);

// Matieres Card Content
const MatieresCard = () => (
  <div className="space-y-4">
    {/* Stats Row */}
    <div className="grid grid-cols-3 gap-2">
      <div className="p-3 rounded-xl bg-muted/30 border border-border/20 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">4</p>
          <p className="text-[9px] text-muted-foreground">Matières</p>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-muted/30 border border-border/20 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-red-500">J-24</p>
          <p className="text-[9px] text-muted-foreground">Examen</p>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-muted/30 border border-border/20 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Target className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">90h</p>
          <p className="text-[9px] text-muted-foreground">Objectif</p>
        </div>
      </div>
    </div>

    {/* Subjects List */}
    <div className="space-y-2">
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-sm font-medium">FINANCE</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>35h</span>
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px]">Haute</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-sm font-medium">MCG</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>25h</span>
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px]">Haute</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-sm font-medium">MSI</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>20h</span>
          <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px]">Moyenne</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  </div>
);

export default StackedCardsLayout;
