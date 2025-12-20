import { 
  Video, 
  Mic, 
  MonitorUp, 
  Phone, 
  MessageSquare,
  PanelLeftClose,
  Bell,
  Calendar,
  BarChart3,
  GraduationCap,
  Settings,
  Timer,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const LandingVideoCallPreview = () => {
  // Mock participants for the demo
  const mockParticipants = [
    { id: '1', name: 'Ridouane', initial: 'R', color: 'from-blue-500 to-blue-700', isLocal: true },
    { id: '2', name: 'Djamel', initial: 'D', color: 'from-amber-500 to-orange-600', isLocal: false },
  ];

  const navItems = [
    { icon: Calendar, active: false },
    { icon: BarChart3, active: false },
    { icon: Share2, active: false },
    { icon: Settings, active: false },
  ];

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-sidebar" style={{ minHeight: '420px' }}>
      {/* Simulated app chrome */}
      <div className="flex h-full">
        {/* Collapsed sidebar - icons only like in the screenshot */}
        <div className="w-14 bg-sidebar hidden sm:flex flex-col items-center py-4 border-r border-sidebar-border">
          {/* Logo */}
          <div className="mb-8">
            <img src={logo} alt="Skoolife" className="h-8 w-auto rounded-xl" />
          </div>

          {/* Navigation icons */}
          <nav className="flex-1 flex flex-col items-center gap-2">
            {navItems.map((item, index) => (
              <div
                key={index}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  item.active 
                    ? 'bg-sidebar-accent text-sidebar-foreground' 
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </div>
            ))}
            
            {/* Separator */}
            <div className="w-8 h-px bg-sidebar-border my-2" />
            
            {/* Pomodoro/Timer */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sidebar-accent text-sidebar-foreground">
              <Timer className="w-5 h-5" />
            </div>
          </nav>

          {/* Profile avatar at bottom */}
          <div className="mt-auto pt-4">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-foreground">R</span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col bg-background rounded-r-xl sm:rounded-l-none rounded-xl overflow-hidden m-1.5">
          {/* Header */}
          <div className="flex h-12 items-center justify-between px-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <PanelLeftClose className="w-4 h-4 hidden sm:block" />
              <span className="hidden sm:inline text-sm">/</span>
              <span className="font-semibold text-foreground">FINANCE</span>
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-medium rounded-full ml-1">
                Mode présentation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium">2 participants</span>
              </div>
              <Bell className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </div>
          </div>

          {/* Video area */}
          <div className="flex-1 p-3 min-h-0">
            <div className="h-full rounded-xl bg-card border border-border p-3 flex flex-col">
              {/* Presentation mode layout */}
              <div className="flex-1 relative rounded-lg overflow-hidden bg-black/5 dark:bg-white/5" style={{ minHeight: '280px' }}>
                {/* Shared screen content - Excel mockup */}
                <div className="absolute inset-0 flex items-center justify-center p-3">
                  <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-inner">
                    {/* Excel header */}
                    <div className="bg-[#217346] px-3 py-1.5 flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                      </div>
                      <span className="text-[10px] text-white font-medium ml-1">INSEEC BACHELOR - Indicateurs Financiers</span>
                    </div>
                    {/* Excel content */}
                    <div className="p-2 bg-[#f5f5f5] h-full">
                      <div className="border border-gray-300 rounded text-[8px] overflow-hidden">
                        <div className="grid grid-cols-4 bg-gray-200 border-b border-gray-300">
                          <div className="px-2 py-1 border-r border-gray-300 font-semibold">Indicateurs</div>
                          <div className="px-2 py-1 border-r border-gray-300 font-semibold text-center">Fund</div>
                          <div className="px-2 py-1 border-r border-gray-300 font-semibold text-center">Benchmark</div>
                          <div className="px-2 py-1 font-semibold text-center">Écart</div>
                        </div>
                        <div className="grid grid-cols-4 border-b border-gray-200">
                          <div className="px-2 py-1 border-r border-gray-200">Performance</div>
                          <div className="px-2 py-1 border-r border-gray-200 text-center text-green-600">10.64%</div>
                          <div className="px-2 py-1 border-r border-gray-200 text-center">8.57%</div>
                          <div className="px-2 py-1 text-center text-green-600">+2.07%</div>
                        </div>
                        <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50">
                          <div className="px-2 py-1 border-r border-gray-200">Volatilité</div>
                          <div className="px-2 py-1 border-r border-gray-200 text-center">4.93%</div>
                          <div className="px-2 py-1 border-r border-gray-200 text-center">3.07%</div>
                          <div className="px-2 py-1 text-center text-red-500">+1.86%</div>
                        </div>
                        <div className="grid grid-cols-4 border-b border-gray-200">
                          <div className="px-2 py-1 border-r border-gray-200">Sharpe Ratio</div>
                          <div className="px-2 py-1 border-r border-gray-200 text-center">1.81</div>
                          <div className="px-2 py-1 border-r border-gray-200 text-center">1.85</div>
                          <div className="px-2 py-1 text-center text-red-500">-0.04</div>
                        </div>
                        <div className="grid grid-cols-4 bg-gray-50">
                          <div className="px-2 py-1 border-r border-gray-200">Alpha</div>
                          <div className="px-2 py-1 border-r border-gray-200 text-center">1.85</div>
                          <div className="px-2 py-1 border-r border-gray-200 text-center">—</div>
                          <div className="px-2 py-1 text-center text-green-600">+1.85</div>
                        </div>
                      </div>
                      {/* Mini chart */}
                      <div className="mt-3 h-14 bg-white border border-gray-300 rounded p-2 flex items-end gap-0.5">
                        {[40, 45, 42, 50, 48, 55, 60, 58, 65, 70, 68, 75, 72, 78, 82, 80, 85, 88].map((h, i) => (
                          <div key={i} className="flex-1 bg-blue-500/70 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Camera thumbnails - top right */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                  {mockParticipants.map((participant) => (
                    <div 
                      key={participant.id}
                      className={`w-24 h-16 rounded-xl bg-gradient-to-br ${participant.color} flex items-center justify-center relative border-2 border-card shadow-lg`}
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-base font-bold">
                        {participant.initial}
                      </div>
                      <span className="absolute bottom-1 left-1 text-[9px] text-white bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[90%]">
                        {participant.name} {participant.isLocal && '(Toi)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls Bar */}
              <div className="flex-shrink-0 flex items-center justify-center gap-3 pt-3 mt-3 border-t border-border">
                {/* Mic */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-12 h-12 shadow-sm"
                >
                  <Mic className="w-5 h-5" />
                </Button>

                {/* Camera */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-12 h-12 shadow-sm"
                >
                  <Video className="w-5 h-5" />
                </Button>

                {/* Screen Share - Active */}
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full w-12 h-12 shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-card"
                >
                  <MonitorUp className="w-5 h-5" />
                </Button>

                {/* Chat with badge */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full w-12 h-12 shadow-sm relative"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    1
                  </span>
                </Button>

                {/* Leave */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full w-12 h-12 shadow-sm ml-3"
                >
                  <Phone className="w-5 h-5 rotate-[135deg]" />
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
