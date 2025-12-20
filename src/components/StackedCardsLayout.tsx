import { useState, useEffect } from 'react';
import { StaticCalendarCard, StaticProgressionCard, StaticSubjectsCard, StaticSettingsCard, StaticPomodoroCard } from './StaticAppCards';

interface CardData {
  id: number;
  title: string;
  content: React.ReactNode;
}

const StackedCardsLayout = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const cards: CardData[] = [
    {
      id: 0,
      title: 'Calendrier',
      content: <StaticCalendarCard />,
    },
    {
      id: 1,
      title: 'Progression',
      content: <StaticProgressionCard />,
    },
    {
      id: 2,
      title: 'Matières',
      content: <StaticSubjectsCard />,
    },
    {
      id: 3,
      title: 'Paramètres',
      content: <StaticSettingsCard />,
    },
    {
      id: 4,
      title: 'Pomodoro',
      content: <StaticPomodoroCard />,
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
    
    // Cards stack BEHIND (negative Y = up)
    if (position === 0) {
      return {
        zIndex: 50,
        transform: 'translateY(0) scale(1)',
        opacity: 1,
      };
    } else if (position === 1) {
      return {
        zIndex: 40,
        transform: 'translateY(-12px) scale(0.97)',
        opacity: 0.85,
      };
    } else if (position === 2) {
      return {
        zIndex: 30,
        transform: 'translateY(-24px) scale(0.94)',
        opacity: 0.65,
      };
    } else if (position === 3) {
      return {
        zIndex: 20,
        transform: 'translateY(-36px) scale(0.91)',
        opacity: 0.45,
      };
    } else {
      return {
        zIndex: 10,
        transform: 'translateY(-48px) scale(0.88)',
        opacity: 0.3,
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

  return (
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
  );
};

export default StackedCardsLayout;
