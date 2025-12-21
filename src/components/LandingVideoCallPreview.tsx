import { 
  Video, 
  Mic, 
  MonitorUp, 
  Phone, 
  MessageSquare,
  Bell
} from 'lucide-react';
import logo from '@/assets/logo.png';

const LandingVideoCallPreview = () => {
  const mockParticipants = [
    { id: '1', name: 'Ridouane (Toi)', initial: 'R', color: 'from-blue-500 to-blue-600' },
    { id: '2', name: 'Djamel', initial: 'D', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-border/50 shadow-xl bg-[#FDF8F3] dark:bg-card">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-5 bg-[#FDF8F3] dark:bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img src={logo} alt="Skoolife" className="w-full h-full object-cover" />
          </div>
          <span className="text-muted-foreground">/</span>
          <span className="font-bold text-foreground text-lg tracking-tight">FINANCE</span>
          <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-500 text-sm font-medium rounded-full ml-2">
            Mode présentation
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 text-green-600">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-sm font-semibold">2 participants</span>
          </div>
          <Bell className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Main content area */}
      <div className="p-5 pt-2">
        <div className="rounded-2xl bg-card border border-border/30 p-6 shadow-sm">
          {/* Video area */}
          <div className="relative rounded-xl overflow-hidden bg-muted/30 min-h-[320px]">
            {/* Excel mockup */}
            <div className="absolute inset-4 flex items-start justify-center">
              <div className="w-full max-w-lg bg-white rounded-xl overflow-hidden shadow-lg">
                {/* Excel header */}
                <div className="bg-[#217346] px-4 py-2 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                  </div>
                  <span className="text-sm text-white font-medium">INSEEC - Indicateurs Financiers</span>
                </div>
                {/* Excel content */}
                <div className="p-3 bg-[#f8f8f8]">
                  <div className="border border-gray-300 rounded-lg overflow-hidden text-sm">
                    <div className="grid grid-cols-3 bg-gray-100 border-b border-gray-300">
                      <div className="px-4 py-2 border-r border-gray-300 font-semibold text-gray-700">Indicateurs</div>
                      <div className="px-4 py-2 border-r border-gray-300 font-semibold text-gray-700 text-center">Fund</div>
                      <div className="px-4 py-2 font-semibold text-gray-700 text-center">Benchmark</div>
                    </div>
                    <div className="grid grid-cols-3 border-b border-gray-200">
                      <div className="px-4 py-2 border-r border-gray-200 text-gray-600">Performance</div>
                      <div className="px-4 py-2 border-r border-gray-200 text-center text-green-600 font-medium">10.64%</div>
                      <div className="px-4 py-2 text-center text-gray-600">8.57%</div>
                    </div>
                    <div className="grid grid-cols-3 border-b border-gray-200 bg-white">
                      <div className="px-4 py-2 border-r border-gray-200 text-gray-600">Volatilité</div>
                      <div className="px-4 py-2 border-r border-gray-200 text-center text-gray-600">4.93%</div>
                      <div className="px-4 py-2 text-center text-gray-600">3.07%</div>
                    </div>
                    <div className="grid grid-cols-3">
                      <div className="px-4 py-2 border-r border-gray-200 text-gray-600">Sharpe Ratio</div>
                      <div className="px-4 py-2 border-r border-gray-200 text-center text-gray-600">1.81</div>
                      <div className="px-4 py-2 text-center text-gray-600">1.85</div>
                    </div>
                  </div>
                  {/* Mini chart */}
                  <div className="mt-3 h-12 bg-white border border-gray-300 rounded-lg p-2 flex items-end gap-1">
                    {[45, 50, 45, 55, 50, 60, 55, 65, 60, 70, 65, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Camera thumbnails - right side */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
              {mockParticipants.map((participant) => (
                <div 
                  key={participant.id}
                  className={`w-28 h-24 rounded-xl bg-gradient-to-br ${participant.color} flex items-center justify-center relative shadow-lg`}
                >
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                    {participant.initial}
                  </div>
                  <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                    {participant.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-4 pt-6 mt-4 border-t border-border/30">
            {/* Mic */}
            <button className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
              <Mic className="w-6 h-6" />
            </button>

            {/* Camera */}
            <button className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
              <Video className="w-6 h-6" />
            </button>

            {/* Screen Share - Active */}
            <button className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 ring-4 ring-amber-300 dark:ring-amber-600 ring-offset-4 ring-offset-card">
              <MonitorUp className="w-7 h-7" />
            </button>

            {/* Chat with badge */}
            <button className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors relative">
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                1
              </span>
            </button>

            {/* Leave */}
            <button className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg">
              <Phone className="w-6 h-6 rotate-[135deg]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingVideoCallPreview;
