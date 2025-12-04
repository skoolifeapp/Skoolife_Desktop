import { useEffect, useRef, useState } from 'react';
import { Sparkles, Calendar, CheckCircle2 } from 'lucide-react';

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];
const HOURS = ['7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h'];

const MOCK_EVENTS = [
  { day: 0, startHour: 1, duration: 2, title: 'Maths', color: 'hsl(var(--subject-blue))' },
  { day: 2, startHour: 2, duration: 1.5, title: 'Compta', color: 'hsl(var(--subject-purple))' },
  { day: 3, startHour: 0, duration: 2, title: 'Alternance', color: 'hsl(var(--subject-teal))' },
  { day: 4, startHour: 3, duration: 1, title: 'Droit', color: 'hsl(var(--subject-green))' },
  { day: 1, startHour: 4, duration: 1.5, title: 'Anglais', color: 'hsl(var(--subject-orange))' },
];

const HeroMiniDashboard3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateY = ((e.clientX - centerX) / rect.width) * 6;
      const rotateX = ((centerY - e.clientY) / rect.height) * 6;
      
      setRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[600px] mx-auto mt-16 md:mt-0"
      style={{ perspective: '1200px' }}
      aria-label="Aperçu du dashboard Skoolife montrant un planning de révisions hebdomadaire"
    >
      {/* Main 3D Container */}
      <div 
        className="relative transition-transform duration-200 ease-out"
        style={{
          transform: isMobile 
            ? 'rotateX(2deg) rotateY(-3deg)' 
            : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Dashboard Base */}
        <div 
          className="relative rounded-2xl bg-card/90 border border-border shadow-2xl overflow-hidden"
          style={{
            animation: 'breathing 8s ease-in-out infinite',
          }}
        >
          <div className="flex p-3 gap-3" style={{ minHeight: '280px' }}>
            {/* Left Column - Cards */}
            <div 
              className="w-[140px] flex-shrink-0 flex flex-col gap-2"
              style={{
                transform: `translateZ(${isMobile ? '10px' : 20 + rotation.y * 0.5}px)`,
                animation: 'floatSlow 10s ease-in-out infinite',
              }}
            >
              {/* Hello Card */}
              <div className="p-2 rounded-lg bg-secondary/80 border border-border/50">
                <p className="text-[9px] font-semibold text-foreground truncate">Bonjour Alex 👋</p>
                <p className="text-[7px] text-muted-foreground">Prêt à réviser ?</p>
              </div>

              {/* Stats Card */}
              <div className="p-2 rounded-lg bg-card border border-border/50 flex-1">
                <p className="text-[8px] font-semibold text-foreground mb-1">Cette semaine</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 text-primary" />
                    <span className="text-[7px] text-muted-foreground">6h planifiées</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
                    <span className="text-[7px] text-muted-foreground">2 sessions terminées</span>
                  </div>
                  {/* Mini Progress */}
                  <div className="mt-2">
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-primary"
                        style={{ width: '33%' }}
                      />
                    </div>
                    <p className="text-[6px] text-muted-foreground mt-0.5">33% complété</p>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="px-2 py-1.5 rounded-lg bg-primary text-primary-foreground text-[8px] font-semibold text-center shadow-sm">
                Générer mon planning
              </div>
            </div>

            {/* Right - Weekly Grid */}
            <div 
              className="flex-1 rounded-lg bg-secondary/30 border border-border/30 overflow-hidden"
              style={{
                transform: `translateZ(${isMobile ? '0px' : rotation.y * 0.2}px)`,
              }}
            >
              {/* Days Header */}
              <div className="flex border-b border-border/30 bg-card/50">
                <div className="w-6 flex-shrink-0" />
                {DAYS.map((day, i) => (
                  <div 
                    key={day} 
                    className={`flex-1 text-center py-1 text-[6px] font-medium ${
                      i === 2 ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="relative">
                {/* Hours */}
                {HOURS.map((hour, i) => (
                  <div key={hour} className="flex h-6 border-b border-border/20">
                    <div className="w-6 flex-shrink-0 text-[6px] text-muted-foreground pr-1 text-right pt-0.5">
                      {hour}
                    </div>
                    {DAYS.map((_, dayIndex) => (
                      <div 
                        key={dayIndex} 
                        className="flex-1 border-l border-border/20"
                      />
                    ))}
                  </div>
                ))}

                {/* Events */}
                {MOCK_EVENTS.map((event, i) => (
                  <div
                    key={i}
                    className="absolute rounded text-[6px] font-medium text-white px-1 py-0.5 overflow-hidden shadow-sm"
                    style={{
                      left: `calc(24px + ${event.day * (100 / 7)}% * (1 - 24px/100%))`,
                      width: `calc((100% - 24px) / 7 - 2px)`,
                      top: `${event.startHour * 24 + 2}px`,
                      height: `${event.duration * 24 - 4}px`,
                      backgroundColor: event.color,
                      animation: `eventGlow 6s ease-in-out infinite ${i * 0.5}s`,
                    }}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Hologram Cards */}
        <div 
          className="absolute -top-4 -right-4 md:-right-8 p-2 rounded-lg bg-card/95 border border-primary/30 shadow-lg backdrop-blur-sm"
          style={{
            transform: `translateZ(${isMobile ? '30px' : 40 + rotation.y * 1.5}px) rotateX(${isMobile ? 0 : -rotation.x * 0.3}deg)`,
            animation: 'floatCard 8s ease-in-out infinite',
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Calendar className="w-2.5 h-2.5 text-primary" />
            </div>
            <div>
              <p className="text-[8px] font-semibold text-foreground">+6h planifiées</p>
              <p className="text-[6px] text-muted-foreground">cette semaine</p>
            </div>
          </div>
        </div>

        <div 
          className="absolute -bottom-2 -left-4 md:-left-6 p-2 rounded-lg bg-card/95 border border-destructive/30 shadow-lg backdrop-blur-sm"
          style={{
            transform: `translateZ(${isMobile ? '25px' : 35 + rotation.y * 1.2}px) rotateX(${isMobile ? 0 : -rotation.x * 0.2}deg)`,
            animation: 'floatCard 10s ease-in-out infinite 2s',
          }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-[8px]">
              📚
            </div>
            <div>
              <p className="text-[8px] font-semibold text-foreground">Comptabilité</p>
              <p className="text-[6px] text-destructive font-medium">Examen J-12</p>
            </div>
          </div>
        </div>

        {/* AI Badge */}
        <div 
          className="absolute top-1/2 -right-2 md:-right-4"
          style={{
            transform: `translateY(-50%) translateZ(${isMobile ? '40px' : 50 + rotation.y * 2}px)`,
            animation: 'orbitBadge 12s ease-in-out infinite',
          }}
        >
          <div 
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg"
            style={{
              boxShadow: '0 0 20px hsl(var(--primary) / 0.5)',
            }}
          >
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.008); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateZ(20px); }
          50% { transform: translateY(-4px) translateZ(22px); }
        }
        
        @keyframes floatCard {
          0%, 100% { transform: translateY(0) translateZ(40px); }
          50% { transform: translateY(-6px) translateZ(45px); }
        }
        
        @keyframes orbitBadge {
          0%, 100% { transform: translateY(-50%) translateZ(50px) rotate(0deg); }
          25% { transform: translateY(-55%) translateZ(55px) rotate(3deg); }
          50% { transform: translateY(-50%) translateZ(50px) rotate(0deg); }
          75% { transform: translateY(-45%) translateZ(55px) rotate(-3deg); }
        }
        
        @keyframes eventGlow {
          0%, 100% { opacity: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
          50% { opacity: 0.95; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
        }
      `}</style>
    </div>
  );
};

export default HeroMiniDashboard3D;
