import { useEffect, useRef, useState } from 'react';
import { Clock, CheckCircle2, Eye, Trash2, ChevronLeft, ChevronRight, RefreshCw, Sparkles, HelpCircle, Plus } from 'lucide-react';

const DAYS = [
  { short: 'LUN.', num: 8 },
  { short: 'MAR.', num: 9, isToday: true },
  { short: 'MER.', num: 10 },
  { short: 'JEU.', num: 11 },
  { short: 'VEN.', num: 12 },
  { short: 'SAM.', num: 13 },
  { short: 'DIM.', num: 14 },
];

const HOURS = ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

// Mock events exactly matching screenshot
const MOCK_EVENTS = [
  // Monday - VBA (blue)
  { day: 0, startHour: 1, duration: 2, title: 'VBA', time: '08:00 - 09:30', type: 'revision' },
  { day: 0, startHour: 3, duration: 2, title: 'VBA', time: '10:00 - 11:30', type: 'revision' },
  // Tuesday - VBA (blue)
  { day: 1, startHour: 1, duration: 2, title: 'VBA', time: '08:00 - 09:30', type: 'revision' },
  { day: 1, startHour: 3, duration: 2, title: 'VBA', time: '10:00 - 11:30', type: 'revision' },
  // Wednesday
  { day: 2, startHour: 1.5, duration: 2, title: 'Politiques et ...', time: '08:30 - 10:30', type: 'cours' },
  { day: 2, startHour: 4, duration: 1, title: 'Business engl...', time: '10:45 - 11:45', type: 'revision' },
  { day: 2, startHour: 6, duration: 1, title: 'Business engl...', time: '13:00 - 14:00', type: 'revision' },
  { day: 2, startHour: 7, duration: 1, title: 'Management ...', time: '14:00 - 15:00', type: 'revision' },
  // Thursday
  { day: 3, startHour: 1.5, duration: 4, title: 'Financement ...', time: '08:30 - 10:30', type: 'cours' },
  { day: 3, startHour: 4, duration: 2, title: 'Droit du trava...', time: '10:45 - 12:45', type: 'revision' },
  { day: 3, startHour: 7, duration: 1, title: 'Droits des so...', time: '14:00 - 15:00', type: 'revision' },
  // Friday
  { day: 4, startHour: 4, duration: 1, title: 'Business engl...', time: '10:45 - 11:45', type: 'revision' },
  { day: 4, startHour: 6, duration: 1, title: 'Business engl...', time: '13:00 - 14:00', type: 'revision' },
  { day: 4, startHour: 7, duration: 1, title: 'Politiques et ...', time: '14:00 - 15:00', type: 'revision' },
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
      className="relative w-full max-w-[750px] mx-auto mt-8 md:mt-0"
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
        {/* Dashboard Base - Exact gradient from screenshot */}
        <div 
          className="hero-dashboard relative rounded-2xl overflow-hidden shadow-2xl border border-border/30"
          style={{
            animation: 'breathing 8s ease-in-out infinite',
          }}
        >
          <div className="flex" style={{ minHeight: '380px' }}>
            {/* Left Sidebar */}
            <div 
              className="w-[180px] flex-shrink-0 flex flex-col p-4 gap-3"
              style={{
                transform: `translateZ(${isMobile ? '10px' : 20 + rotation.y * 0.5}px)`,
                animation: 'floatSlow 10s ease-in-out infinite',
              }}
            >
              {/* Hello Card */}
              <div className="p-4 rounded-2xl hero-card shadow-sm">
                <p className="text-sm font-bold hero-text-primary">Bonjour Alex 👋</p>
                <p className="text-xs hero-text-secondary mt-1">Prêt pour une session productive ?</p>
              </div>

              {/* This Week Stats */}
              <div className="p-4 rounded-2xl hero-card shadow-sm flex-1">
                <p className="text-xs font-bold hero-text-primary mb-3">Cette semaine</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full hero-icon-bg flex items-center justify-center">
                      <Clock className="w-4 h-4 hero-icon-muted" />
                    </div>
                    <div>
                      <span className="text-lg font-bold hero-text-primary">6h</span>
                      <p className="text-[10px] hero-text-secondary">planifiées</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full hero-icon-green flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <span className="text-lg font-bold hero-text-primary">0</span>
                      <p className="text-[10px] hero-text-secondary">sessions terminées</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Exams */}
              <div className="p-4 rounded-2xl hero-card shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <Eye className="w-3.5 h-3.5 hero-icon-muted" />
                  <p className="text-xs font-bold hero-text-primary">Prochains examens</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-xs font-medium hero-text-primary">VBA</p>
                    <p className="text-[10px] hero-text-secondary">12 déc.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="px-4 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                  <RefreshCw className="w-4 h-4" />
                  Générer mon planning
                </div>
                <div className="px-4 py-3 rounded-xl hero-btn-secondary text-xs font-medium flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
                  <Sparkles className="w-4 h-4" />
                  Ajuster ma semaine
                </div>
              </div>
            </div>

            {/* Right - Main Content */}
            <div 
              className="flex-1 flex flex-col p-4 pl-0"
              style={{
                transform: `translateZ(${isMobile ? '0px' : rotation.y * 0.2}px)`,
              }}
            >
              {/* Header with title and actions */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold hero-text-primary">Semaine du 08 déc.</h2>
                <div className="flex items-center gap-1.5">
                  <div className="px-3 py-1.5 rounded-lg border border-primary/40 text-primary text-[10px] font-medium flex items-center gap-1 cursor-pointer hover:bg-primary/5 transition-colors">
                    <Plus className="w-3 h-3" />
                    Ajouter un évènement
                  </div>
                  <div className="w-7 h-7 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/30 dark:border-red-700 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div className="w-7 h-7 rounded-lg border border-primary/40 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="px-3 py-1.5 rounded-lg border border-primary/40 text-primary text-[10px] font-medium cursor-pointer hover:bg-primary/5 transition-colors">
                    Aujourd'hui
                  </div>
                  <div className="w-7 h-7 rounded-lg border border-primary/40 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              </div>

              {/* Weekly Grid */}
              <div className="flex-1 rounded-2xl hero-card shadow-sm overflow-hidden">
                {/* Days Header */}
                <div className="flex border-b hero-border">
                  <div className="w-12 flex-shrink-0" />
                  {DAYS.map((day) => (
                    <div 
                      key={day.short} 
                      className={`flex-1 text-center py-3 ${
                        day.isToday ? 'text-primary' : 'hero-text-secondary'
                      }`}
                    >
                      <p className="text-[10px] font-medium">{day.short}</p>
                      <p className={`text-base font-bold ${day.isToday ? 'text-primary' : 'hero-text-primary'}`}>{day.num}</p>
                    </div>
                  ))}
                </div>

                {/* Grid with hours and events */}
                <div className="relative">
                  {/* Hours rows */}
                  {HOURS.map((hour) => (
                    <div key={hour} className="flex h-8 border-b hero-border-light">
                      <div className="w-12 flex-shrink-0 text-[10px] hero-text-secondary pr-2 text-right pt-1.5">
                        {hour}
                      </div>
                      {DAYS.map((_, dayIndex) => (
                        <div 
                          key={dayIndex} 
                          className="flex-1 border-l hero-border-light"
                        />
                      ))}
                    </div>
                  ))}

                  {/* Events overlay */}
                  {MOCK_EVENTS.map((event, i) => (
                    <div
                      key={i}
                      className={`absolute rounded-lg text-[9px] font-medium px-2 py-1 overflow-hidden border ${
                        event.type === 'cours' 
                          ? 'hero-event-cours' 
                          : 'hero-event-revision'
                      }`}
                      style={{
                        left: `calc(48px + ${event.day} * ((100% - 48px) / 7) + 2px)`,
                        width: `calc((100% - 48px) / 7 - 4px)`,
                        top: `${event.startHour * 32 + 2}px`,
                        height: `${event.duration * 32 - 4}px`,
                      }}
                    >
                      <p className="font-semibold truncate leading-tight">{event.title}</p>
                      <p className="text-[7px] opacity-80 truncate">{event.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Help Button - Bottom right */}
          <div 
            className="absolute bottom-4 right-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-2 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              animation: 'floatCard 6s ease-in-out infinite',
            }}
          >
            <HelpCircle className="w-4 h-4" />
            Besoin d'aide ?
          </div>
        </div>

        {/* Subtle floating elements */}
        <div 
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary/15"
          style={{
            transform: `translateZ(${isMobile ? '30px' : 40 + rotation.y * 1.5}px)`,
            animation: 'floatCard 8s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-blue-300/40 dark:bg-blue-500/30"
          style={{
            transform: `translateZ(${isMobile ? '25px' : 35 + rotation.y * 1.2}px)`,
            animation: 'floatCard 10s ease-in-out infinite 2s',
          }}
        />
      </div>

      {/* Styles */}
      <style>{`
        /* Light mode (default) - matches screenshot exactly */
        .hero-dashboard {
          background: linear-gradient(135deg, hsl(45 100% 96%) 0%, hsl(43 100% 94%) 50%, hsl(40 100% 92%) 100%);
        }
        .hero-card {
          background: hsl(0 0% 100%);
          border: 1px solid hsl(40 30% 90%);
        }
        .hero-text-primary {
          color: hsl(220 20% 20%);
        }
        .hero-text-secondary {
          color: hsl(220 10% 50%);
        }
        .hero-icon-bg {
          background: hsl(220 20% 95%);
        }
        .hero-icon-green {
          background: hsl(142 76% 94%);
        }
        .hero-icon-muted {
          color: hsl(220 10% 55%);
        }
        .hero-border {
          border-color: hsl(220 20% 92%);
        }
        .hero-border-light {
          border-color: hsl(220 20% 95%);
        }
        .hero-btn-secondary {
          background: hsl(213 90% 96%);
          color: hsl(213 90% 45%);
          border: 1px solid hsl(213 60% 88%);
        }
        .hero-event-revision {
          background: hsl(213 90% 95%);
          border-color: hsl(213 60% 85%);
          color: hsl(213 70% 40%);
        }
        .hero-event-cours {
          background: hsl(45 100% 94%);
          border-color: hsl(45 80% 80%);
          color: hsl(35 80% 35%);
        }
        
        /* Dark mode */
        .dark .hero-dashboard {
          background: linear-gradient(135deg, hsl(220 20% 12%) 0%, hsl(220 25% 10%) 50%, hsl(220 30% 8%) 100%);
        }
        .dark .hero-card {
          background: hsl(220 20% 16%);
          border: 1px solid hsl(220 15% 22%);
        }
        .dark .hero-text-primary {
          color: hsl(220 20% 95%);
        }
        .dark .hero-text-secondary {
          color: hsl(220 10% 60%);
        }
        .dark .hero-icon-bg {
          background: hsl(220 15% 22%);
        }
        .dark .hero-icon-green {
          background: hsl(142 40% 18%);
        }
        .dark .hero-icon-muted {
          color: hsl(220 10% 55%);
        }
        .dark .hero-border {
          border-color: hsl(220 15% 22%);
        }
        .dark .hero-border-light {
          border-color: hsl(220 15% 18%);
        }
        .dark .hero-btn-secondary {
          background: hsl(213 40% 20%);
          color: hsl(213 80% 70%);
          border: 1px solid hsl(213 40% 30%);
        }
        .dark .hero-event-revision {
          background: hsl(213 40% 22%);
          border-color: hsl(213 40% 35%);
          color: hsl(213 70% 75%);
        }
        .dark .hero-event-cours {
          background: hsl(45 40% 20%);
          border-color: hsl(45 40% 30%);
          color: hsl(45 70% 70%);
        }

        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.003); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateZ(20px); }
          50% { transform: translateY(-2px) translateZ(22px); }
        }
        
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
};

export default HeroMiniDashboard3D;
