import { 
  Video, 
  Mic, 
  MonitorUp, 
  Phone, 
  Users,
  MessageSquare,
  PanelLeftClose,
  Bell,
  Calendar,
  BarChart3,
  GraduationCap,
  Settings,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const LandingVideoCallPreview = () => {
  // Mock participants for the demo
  const mockParticipants = [
    { id: '1', name: 'Ridouane', initial: 'R', color: 'from-blue-500 to-blue-700', isLocal: true },
    { id: '2', name: 'Djamel', initial: 'D', color: 'from-amber-500 to-orange-600', isLocal: false },
  ];

  const sidebarIcons = [
    { icon: Calendar, active: false },
    { icon: BarChart3, active: true },
    { icon: GraduationCap, active: false },
    { icon: Settings, active: false },
    { icon: Timer, active: false },
  ];

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-[#FFFDF8] dark:bg-card">
      {/* Simulated app chrome */}
      <div className="flex h-full">
        {/* Sidebar with Skoolife logo */}
        <div className="w-12 bg-primary/10 hidden sm:flex flex-col items-center py-3 border-r border-border">
          {/* Logo Skoolife */}
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mb-4">
            <img src={logo} alt="Skoolife" className="w-5 h-5" />
          </div>
          
          {/* Navigation icons */}
          <div className="flex-1 flex flex-col gap-1.5">
            {sidebarIcons.map((item, i) => (
              <div 
                key={i} 
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
              </div>
            ))}
          </div>
          
          {/* User avatar at bottom */}
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-auto">
            <span className="text-xs font-bold text-primary">S</span>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col bg-background rounded-r-xl sm:rounded-l-none rounded-xl overflow-hidden m-1 sm:m-1.5">
          {/* Header */}
          <div className="flex h-10 items-center justify-between px-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <PanelLeftClose className="w-3.5 h-3.5 hidden sm:block" />
              <span className="hidden sm:inline">/</span>
              <span className="font-medium text-foreground text-xs">FINANCE</span>
              <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[9px] font-medium rounded-full ml-1">
                Mode présentation
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-medium">2 participants</span>
              </div>
              <Bell className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            </div>
          </div>

          {/* Video area */}
          <div className="flex-1 p-2 sm:p-3 min-h-0">
            <div className="h-full rounded-xl bg-card border border-border p-2 sm:p-3 flex flex-col">
              {/* Presentation mode layout */}
              <div className="flex-1 relative rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
                {/* Shared screen content - Excel mockup */}
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-inner">
                    {/* Excel header */}
                    <div className="bg-[#217346] px-2 py-1 flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                        <div className="w-2 h-2 rounded-full bg-white/30" />
                      </div>
                      <span className="text-[8px] text-white font-medium ml-1">INSEEC - Indicateurs Financiers</span>
                    </div>
                    {/* Excel content */}
                    <div className="p-1.5 bg-[#f5f5f5] h-full">
                      <div className="border border-gray-300 rounded text-[6px] overflow-hidden">
                        <div className="grid grid-cols-4 bg-gray-200 border-b border-gray-300">
                          <div className="px-1.5 py-0.5 border-r border-gray-300 font-semibold">Indicateurs</div>
                          <div className="px-1.5 py-0.5 border-r border-gray-300 font-semibold text-center">Fund</div>
                          <div className="px-1.5 py-0.5 border-r border-gray-300 font-semibold text-center">Benchmark</div>
                          <div className="px-1.5 py-0.5 font-semibold text-center">Écart</div>
                        </div>
                        <div className="grid grid-cols-4 border-b border-gray-200">
                          <div className="px-1.5 py-0.5 border-r border-gray-200">Performance</div>
                          <div className="px-1.5 py-0.5 border-r border-gray-200 text-center text-green-600">10.64%</div>
                          <div className="px-1.5 py-0.5 border-r border-gray-200 text-center">8.57%</div>
                          <div className="px-1.5 py-0.5 text-center text-green-600">+2.07%</div>
                        </div>
                        <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50">
                          <div className="px-1.5 py-0.5 border-r border-gray-200">Volatilité</div>
                          <div className="px-1.5 py-0.5 border-r border-gray-200 text-center">4.93%</div>
                          <div className="px-1.5 py-0.5 border-r border-gray-200 text-center">3.07%</div>
                          <div className="px-1.5 py-0.5 text-center text-red-500">+1.86%</div>
                        </div>
                        <div className="grid grid-cols-4">
                          <div className="px-1.5 py-0.5 border-r border-gray-200">Sharpe Ratio</div>
                          <div className="px-1.5 py-0.5 border-r border-gray-200 text-center">1.81</div>
                          <div className="px-1.5 py-0.5 border-r border-gray-200 text-center">1.85</div>
                          <div className="px-1.5 py-0.5 text-center text-red-500">-0.04</div>
                        </div>
                      </div>
                      {/* Mini chart */}
                      <div className="mt-1.5 h-8 bg-white border border-gray-300 rounded p-1 flex items-end gap-0.5">
                        {[40, 45, 42, 50, 48, 55, 60, 58, 65, 70, 68, 75, 72, 78, 82].map((h, i) => (
                          <div key={i} className="flex-1 bg-blue-500/70 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Camera thumbnails - top right */}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                  {mockParticipants.map((participant) => (
                    <div 
                      key={participant.id}
                      className={`w-16 h-11 sm:w-20 sm:h-14 rounded-lg bg-gradient-to-br ${participant.color} flex items-center justify-center relative border-2 border-card shadow-lg`}
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                        {participant.initial}
                      </div>
                      <span className="absolute bottom-0.5 left-0.5 text-[6px] sm:text-[8px] text-white bg-black/60 px-1 rounded truncate max-w-[90%]">
                        {participant.name} {participant.isLocal && '(Toi)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls Bar */}
              <div className="flex-shrink-0 flex items-center justify-center gap-2 sm:gap-3 pt-2 mt-2 border-t border-border">
                {/* Mic */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-9 h-9 sm:w-11 sm:h-11 shadow-sm"
                >
                  <Mic className="w-4 h-4" />
                </Button>

                {/* Camera */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-9 h-9 sm:w-11 sm:h-11 shadow-sm"
                >
                  <Video className="w-4 h-4" />
                </Button>

                {/* Screen Share - Active */}
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full w-9 h-9 sm:w-11 sm:h-11 shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-card"
                >
                  <MonitorUp className="w-4 h-4" />
                </Button>

                {/* Chat with badge */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-9 h-9 sm:w-11 sm:h-11 shadow-sm relative"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    1
                  </span>
                </Button>

                {/* Leave */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full w-9 h-9 sm:w-11 sm:h-11 shadow-sm ml-2"
                >
                  <Phone className="w-4 h-4 rotate-[135deg]" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingVideoCallPreview;
