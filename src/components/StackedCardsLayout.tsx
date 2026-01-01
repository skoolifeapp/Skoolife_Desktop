import { useState, useEffect, createContext, useContext } from 'react';
import { StaticCalendarCard, StaticProgressionCard, StaticSubjectsCard, StaticSettingsCard } from './StaticAppCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, BarChart3, GraduationCap, Settings } from 'lucide-react';

// Context to allow sidebar to change active card
interface LandingPreviewContextType {
  activeIndex: number;
  setActiveCard: (index: number) => void;
}

const LandingPreviewContext = createContext<LandingPreviewContextType | null>(null);

export const useLandingPreview = () => useContext(LandingPreviewContext);

interface CardData {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  content: React.ReactNode;
}

const StackedCardsLayout = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isMobile = useIsMobile();

  const setActiveCard = (index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const cards: CardData[] = [
    {
      id: 0,
      title: 'Calendrier',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Planifie tes révisions automatiquement',
      content: <StaticCalendarCard />,
    },
    {
      id: 1,
      title: 'Progression',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Suis tes progrès en temps réel',
      content: <StaticProgressionCard />,
    },
    {
      id: 2,
      title: 'Matières',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Gère tes matières et examens',
      content: <StaticSubjectsCard />,
    },
    {
      id: 3,
      title: 'Paramètres',
      icon: <Settings className="w-5 h-5" />,
      description: 'Personnalise ton expérience',
      content: <StaticSettingsCard />,
    },
  ];

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isPaused, cards.length]);

  const getCardStyle = (index: number) => {
    const position = (index - activeIndex + cards.length) % cards.length;
    
    // Cards stack BEHIND (negative Y = up) - 5 cards
    if (position === 0) {
      return {
        zIndex: 50,
        transform: 'translateY(0) scale(1)',
        opacity: 1,
      };
    } else if (position === 1) {
      return {
        zIndex: 40,
        transform: 'translateY(-12px) scale(0.975)',
        opacity: 0.88,
      };
    } else if (position === 2) {
      return {
        zIndex: 30,
        transform: 'translateY(-24px) scale(0.95)',
        opacity: 0.72,
      };
    } else if (position === 3) {
      return {
        zIndex: 20,
        transform: 'translateY(-36px) scale(0.925)',
        opacity: 0.55,
      };
    } else {
      return {
        zIndex: 10,
        transform: 'translateY(-48px) scale(0.9)',
        opacity: 0.38,
      };
    }
  };

  const handleCardClick = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      setIsPaused(true);
      // Resume auto-scroll after 10 seconds of inactivity
      setTimeout(() => setIsPaused(false), 10000);
    }
  };

  // Mobile version: Simple card list with indicators
  if (isMobile) {
    return (
      <LandingPreviewContext.Provider value={{ activeIndex, setActiveCard }}>
        <div className="relative w-full px-4 pb-8">
          {/* Feature cards - stacked vertically */}
          <div className="space-y-3">
            {cards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  index === activeIndex
                    ? 'bg-primary/10 border-primary/30 shadow-md'
                    : 'bg-white dark:bg-card border-border/30 hover:border-primary/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    index === activeIndex 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>
      </LandingPreviewContext.Provider>
    );
  }

  // Desktop version: Stacked cards
  return (
    <LandingPreviewContext.Provider value={{ activeIndex, setActiveCard }}>
      <div className="relative w-full max-w-6xl mx-auto pb-8">
        {/* Cards container */}
        <div className="relative h-[580px] md:h-[680px]">
          {cards.map((card, index) => {
            const style = getCardStyle(index);
            const isActive = index === activeIndex;
            
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`absolute inset-x-0 rounded-xl md:rounded-2xl bg-white dark:bg-card border border-border/20 overflow-hidden
                  transition-all duration-500 ease-out
                  ${!isActive ? 'cursor-pointer hover:opacity-90' : ''}`}
                style={{
                  zIndex: style.zIndex,
                  transform: style.transform,
                  opacity: style.opacity,
                  height: '540px',
                  top: '40px',
                  boxShadow: '0 8px 40px -10px rgba(0, 0, 0, 0.2)',
                }}
              >
                {card.content}
              </div>
            );
          })}
        </div>
      </div>
    </LandingPreviewContext.Provider>
  );
};

export default StackedCardsLayout;
