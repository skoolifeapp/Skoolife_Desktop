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

// Mock events - cours, révisions et examens fictifs
const MOCK_EVENTS = [
  // Monday - Cours et révisions
  { day: 0, startHour: 0, duration: 2, title: 'Comptabilité', time: '07:00 - 09:00', type: 'cours' },
  { day: 0, startHour: 3, duration: 1.5, title: 'Révision VBA', time: '10:00 - 11:30', type: 'revision' },
  { day: 0, startHour: 6, duration: 2, title: 'Marketing', time: '13:00 - 15:00', type: 'cours' },
  // Tuesday - Exam day!
  { day: 1, startHour: 1, duration: 3, title: '📝 EXAM VBA', time: '08:00 - 11:00', type: 'exam' },
  { day: 1, startHour: 5, duration: 2, title: 'Droit des affaires', time: '12:00 - 14:00', type: 'cours' },
  // Wednesday
  { day: 2, startHour: 0.5, duration: 2, title: 'Anglais Business', time: '07:30 - 09:30', type: 'cours' },
  { day: 2, startHour: 3, duration: 1.5, title: 'Révision Compta', time: '10:00 - 11:30', type: 'revision' },
  { day: 2, startHour: 5, duration: 2, title: 'Stratégie', time: '12:00 - 14:00', type: 'cours' },
  { day: 2, startHour: 7.5, duration: 1, title: 'Révision Droit', time: '14:30 - 15:30', type: 'revision' },
  // Thursday
  { day: 3, startHour: 1, duration: 2, title: 'Finance', time: '08:00 - 10:00', type: 'cours' },
  { day: 3, startHour: 4, duration: 3, title: '📝 EXAM Compta', time: '11:00 - 14:00', type: 'exam' },
  // Friday
  { day: 4, startHour: 0.5, duration: 2, title: 'RH & Management', time: '07:30 - 09:30', type: 'cours' },
  { day: 4, startHour: 3, duration: 1.5, title: 'Révision Anglais', time: '10:00 - 11:30', type: 'revision' },
  { day: 4, startHour: 5.5, duration: 2, title: 'Économie', time: '12:30 - 14:30', type: 'cours' },
  // Saturday - Révisions
  { day: 5, startHour: 2, duration: 2, title: 'Révision Finance', time: '09:00 - 11:00', type: 'revision' },
  { day: 5, startHour: 4.5, duration: 1.5, title: 'Révision Stratégie', time: '11:30 - 13:00', type: 'revision' },
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

  const getEventClasses = () => {
    return 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700/50 dark:text-blue-300';
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-[700px] mx-auto mt-8 md:mt-0"
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
          className="relative rounded-2xl overflow-hidden shadow-2xl bg-background border border-border"
          style={{
            animation: 'breathing 8s ease-in-out infinite',
          }}
        >
          <div className="flex" style={{ minHeight: '340px' }}>
            {/* Left Sidebar */}
            <div 
              className="w-[160px] flex-shrink-0 flex flex-col p-3 gap-3"
              style={{
                transform: `translateZ(${isMobile ? '10px' : 20 + rotation.y * 0.5}px)`,
                animation: 'floatSlow 10s ease-in-out infinite',
              }}
            >
              {/* Hello Card */}
              <div className="p-3 rounded-xl bg-card shadow-sm border border-border">
                <p className="text-[11px] font-bold text-foreground">Bonjour Alex 👋</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Prêt pour une session productive ?</p>
              </div>

              {/* This Week Stats */}
              <div className="p-3 rounded-xl bg-card shadow-sm border border-border flex-1">
                <p className="text-[10px] font-bold text-foreground mb-2">Cette semaine</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-foreground">11h</span>
                      <p className="text-[8px] text-muted-foreground">planifiées</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-foreground">0</span>
                      <p className="text-[8px] text-muted-foreground">sessions terminées</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Exams */}
              <div className="p-3 rounded-xl bg-card shadow-sm border border-border">
                <div className="flex items-center gap-1 mb-2">
                  <Eye className="w-3 h-3 text-muted-foreground" />
                  <p className="text-[9px] font-bold text-foreground">Prochains examens</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-[9px] font-medium text-foreground">VBA</p>
                    <p className="text-[7px] text-muted-foreground">9/12</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-[9px] font-medium text-foreground">Comptabilité</p>
                    <p className="text-[7px] text-muted-foreground">11/12</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center gap-1 shadow-sm">
                  <RefreshCw className="w-3 h-3" />
                  Générer mon planning
                </div>
                <div className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-[9px] font-medium flex items-center justify-center gap-1 border border-border">
                  <Sparkles className="w-3 h-3" />
                  Ajuster ma semaine
                </div>
              </div>
            </div>

            {/* Right - Main Content */}
            <div 
              className="flex-1 flex flex-col p-3 pl-0"
              style={{
                transform: `translateZ(${isMobile ? '0px' : rotation.y * 0.2}px)`,
              }}
            >
              {/* Header with title and actions */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[12px] font-bold text-foreground">Semaine du 08 déc.</h2>
                <div className="flex items-center gap-1">
                  <div className="px-2 py-1 rounded-md border border-primary/30 text-primary text-[7px] font-medium flex items-center gap-0.5">
                    <Plus className="w-2.5 h-2.5" />
                    Ajouter un évènement
                  </div>
                  <div className="w-5 h-5 rounded-md border border-destructive/30 bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-2.5 h-2.5 text-destructive/60" />
                  </div>
                  <div className="w-5 h-5 rounded-md border border-primary/30 flex items-center justify-center">
                    <ChevronLeft className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <div className="px-2 py-1 rounded-md border border-primary/30 text-primary text-[7px] font-medium">
                    Aujourd'hui
                  </div>
                  <div className="w-5 h-5 rounded-md border border-primary/30 flex items-center justify-center">
                    <ChevronRight className="w-2.5 h-2.5 text-primary" />
                  </div>
                </div>
              </div>

              {/* Weekly Grid */}
              <div className="flex-1 rounded-xl bg-card shadow-sm overflow-hidden border border-border">
                {/* Days Header */}
                <div className="flex border-b border-border">
                  <div className="w-10 flex-shrink-0" />
                  {DAYS.map((day) => (
                    <div 
                      key={day.short} 
                      className={`flex-1 text-center py-2 ${
                        day.isToday ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <p className="text-[7px] font-medium">{day.short}</p>
                      <p className={`text-[11px] font-bold ${day.isToday ? 'text-primary' : 'text-foreground'}`}>{day.num}</p>
                    </div>
                  ))}
                </div>

                {/* Grid with hours and events */}
                <div className="relative">
                  {/* Hours rows */}
                  {HOURS.map((hour) => (
                    <div key={hour} className="flex h-7 border-b border-border/50">
                      <div className="w-10 flex-shrink-0 text-[7px] text-muted-foreground pr-2 text-right pt-1">
                        {hour}
                      </div>
                      {DAYS.map((day, dayIndex) => (
                        <div 
                          key={dayIndex} 
                          className="flex-1 border-l border-border/50"
                        />
                      ))}
                    </div>
                  ))}

                  {/* Events overlay */}
                  {MOCK_EVENTS.map((event, i) => (
                    <div
                      key={i}
                      className={`absolute rounded-md text-[6px] font-medium px-1 py-0.5 overflow-hidden border ${getEventClasses()}`}
                      style={{
                        left: `calc(40px + ${event.day} * ((100% - 40px) / 7) + 2px)`,
                        width: `calc((100% - 40px) / 7 - 4px)`,
                        top: `${event.startHour * 28 + 2}px`,
                        height: `${event.duration * 28 - 4}px`,
                      }}
                    >
                      <p className="font-semibold truncate leading-tight">{event.title}</p>
                      <p className="text-[5px] opacity-75 truncate">{event.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Help Button */}
          <div 
            className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-full bg-primary text-primary-foreground text-[8px] font-medium flex items-center gap-1 shadow-lg"
            style={{
              animation: 'floatCard 6s ease-in-out infinite',
            }}
          >
            <HelpCircle className="w-3 h-3" />
            Besoin d'aide ?
          </div>
        </div>

        {/* Floating decoration elements */}
        <div 
          className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primary/20"
          style={{
            transform: `translateZ(${isMobile ? '30px' : 40 + rotation.y * 1.5}px)`,
            animation: 'floatCard 8s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-accent/60"
          style={{
            transform: `translateZ(${isMobile ? '25px' : 35 + rotation.y * 1.2}px)`,
            animation: 'floatCard 10s ease-in-out infinite 2s',
          }}
        />
      </div>

      {/* Styles */}
      <style>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.005); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateZ(20px); }
          50% { transform: translateY(-3px) translateZ(22px); }
        }
        
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default HeroMiniDashboard3D;
