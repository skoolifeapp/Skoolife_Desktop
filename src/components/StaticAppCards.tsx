import { 
  Calendar, 
  BarChart3, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Upload, 
  RefreshCw, 
  Bell, 
  Sun, 
  Settings, 
  Timer,
  TrendingUp,
  BookOpen,
  Target
} from 'lucide-react';
import logo from '@/assets/logo.png';
import studentAvatar from '@/assets/student-avatar.png';

// Sidebar partagée pour toutes les cartes - Design compact avec icônes uniquement
interface SidebarProps {
  activePage: 'calendrier' | 'progression' | 'matieres';
}

const Sidebar = ({ activePage }: SidebarProps) => (
  <div className="hidden md:flex w-16 flex-col bg-primary text-primary-foreground items-center py-4">
    {/* Logo */}
    <div className="w-10 h-10 rounded-xl overflow-hidden mb-8">
      <img src={logo} alt="Skoolife" className="w-full h-full object-cover" />
    </div>

    {/* Navigation Icons */}
    <div className="flex-1 flex flex-col items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activePage === 'calendrier' ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}>
        <Calendar className="w-5 h-5" />
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activePage === 'progression' ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}>
        <BarChart3 className="w-5 h-5" />
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activePage === 'matieres' ? 'bg-primary-foreground/20' : 'hover:bg-primary-foreground/10'}`}>
        <GraduationCap className="w-5 h-5" />
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
        <Settings className="w-5 h-5" />
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
        <Timer className="w-5 h-5" />
      </div>
    </div>

    {/* User Avatar */}
    <div className="mt-auto pt-4 border-t border-primary-foreground/20 w-full flex justify-center">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-foreground/30 p-1">
        <img src={studentAvatar} alt="Étudiant" className="w-full h-full object-cover" />
      </div>
    </div>
  </div>
);

// Top Bar partagée
interface TopBarProps {
  icon: React.ReactNode;
  label: string;
}

const TopBar = ({ icon, label }: TopBarProps) => (
  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-sm">/</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <button className="relative p-2 rounded-full hover:bg-muted/50">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
      </button>
      <button className="p-2 rounded-full hover:bg-muted/50">
        <Sun className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  </div>
);

// ===== CALENDAR CARD =====
export const StaticCalendarCard = () => (
  <div className="h-full flex bg-[#FFFDF8] dark:bg-card">
    <Sidebar activePage="calendrier" />

    <div className="flex-1 flex flex-col">
      <TopBar icon={<Calendar className="w-4 h-4" />} label="Calendrier" />

      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-bold text-foreground">Semaine du 15 déc.</h2>
        <div className="hidden md:flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" />
            Ajouter un évènement
          </button>
          <button className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
            <Upload className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 rounded-full border border-primary/40 text-primary text-sm font-medium bg-white dark:bg-card">
            Aujourd'hui
          </button>
          <button className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex px-6 pb-4 gap-4 overflow-hidden">
        {/* Left Sidebar */}
        <div className="hidden md:flex w-52 flex-col gap-3">
          {/* Stats Card */}
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm">
            <p className="text-sm font-semibold text-foreground mb-3">Cette semaine</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-tight">6h</p>
                  <p className="text-xs text-muted-foreground">planifiées</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-tight">2</p>
                  <p className="text-xs text-muted-foreground">sessions terminées</p>
                </div>
              </div>
            </div>
          </div>

          {/* Exams */}
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex-1">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
              Prochains examens
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">FINANCE <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                  <p className="text-xs text-muted-foreground">14 janv.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">MCG <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                  <p className="text-xs text-muted-foreground">14 janv.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">MSI <span className="text-muted-foreground font-normal">(Partiel)</span></p>
                  <p className="text-xs text-muted-foreground">16 janv.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            <RefreshCw className="w-3.5 h-3.5" />
            Générer mon planning
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 rounded-xl border border-border/30 bg-white dark:bg-card overflow-hidden shadow-sm">
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
              <div key={i} className="py-2 text-center border-r border-border/10 last:border-r-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{d.day}</p>
                <p className={`text-base font-semibold ${d.today ? 'text-red-500' : 'text-foreground'}`}>{d.num}</p>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="relative h-[240px] overflow-hidden">
            <div className="h-full">
              {['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00'].map((time, i) => (
                <div key={i} className="h-[30px] flex border-b border-border/10">
                  <div className="w-12 text-right pr-2 pt-0.5 text-[10px] text-muted-foreground">{time}</div>
                  <div className="flex-1 grid grid-cols-7">
                    {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                      <div key={col} className="border-r border-border/10 last:border-r-0" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Events overlay */}
            <div className="absolute inset-0 pl-12">
              <div className="absolute rounded-md bg-blue-400 p-1.5 text-white text-[10px]"
                style={{ left: `calc(3 * 100% / 7 + 2px)`, width: `calc(100% / 7 - 4px)`, top: '60px', height: '100px' }}>
                <p className="font-semibold truncate">TEC 535 M...</p>
                <p className="opacity-80">09:00 - 12:30</p>
              </div>
              
              <div className="absolute rounded-md bg-green-200 dark:bg-green-800/50 border border-green-300 p-1.5 text-[10px] flex items-start justify-between"
                style={{ left: `calc(5 * 100% / 7 + 2px)`, width: `calc(100% / 7 - 4px)`, top: '60px', height: '30px' }}>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300">MSI</p>
                </div>
                <CheckCircle2 className="w-3 h-3 text-green-600" />
              </div>
              
              <div className="absolute rounded-md bg-yellow-400 p-1.5 text-white text-[10px]"
                style={{ left: `calc(6 * 100% / 7 + 2px)`, width: `calc(100% / 7 - 4px)`, top: '60px', height: '90px' }}>
                <p className="font-semibold truncate">Cours d'ara...</p>
                <p className="opacity-80">09:00 - 12:00</p>
              </div>
              
              <div className="absolute h-0.5 bg-red-500"
                style={{ left: `calc(5 * 100% / 7)`, width: `calc(100% / 7)`, top: '135px' }}>
                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ===== PROGRESSION CARD =====
export const StaticProgressionCard = () => (
  <div className="h-full flex bg-[#FFFDF8] dark:bg-card">
    <Sidebar activePage="progression" />

    <div className="flex-1 flex flex-col">
      <TopBar icon={<BarChart3 className="w-4 h-4" />} label="Progression" />

      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Tableau de Bord des Progrès</h2>
        </div>
        <div className="hidden md:flex items-center gap-1 border border-border/30 rounded-lg p-1 bg-white dark:bg-card">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 text-sm font-medium">Cette semaine</span>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-4 gap-4 overflow-hidden">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Heures d'étude</p>
              <p className="text-2xl font-bold text-foreground">3h</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taux de complétion</p>
              <p className="text-2xl font-bold text-foreground">33<span className="text-lg">%</span></p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sessions réalisées</p>
              <p className="text-2xl font-bold text-foreground">2</p>
            </div>
          </div>
        </div>

        {/* Subject Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Progrès par Matière</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Card 1 - MSI (Blue) */}
            <div 
              className="p-4 rounded-xl shadow-sm overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)' }}
            >
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-blue-500" />
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2" style={{ backgroundColor: '#3b82f6' }}>
                MSI
              </span>
              <p className="text-lg font-bold text-foreground">MSI</p>
              <div className="flex gap-6 mt-2">
                <div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Temps</p>
                  <p className="text-base font-bold text-foreground">3h</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> Sessions</p>
                  <p className="text-base font-bold text-foreground">2</p>
                </div>
              </div>
            </div>

            {/* Subject Card 2 - FINANCE (Red) */}
            <div 
              className="p-4 rounded-xl shadow-sm overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)' }}
            >
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500" />
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2" style={{ backgroundColor: '#ef4444' }}>
                FINANCE
              </span>
              <p className="text-lg font-bold text-foreground">FINANCE</p>
              <div className="flex gap-6 mt-2">
                <div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Temps</p>
                  <p className="text-base font-bold text-foreground">0h</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> Sessions</p>
                  <p className="text-base font-bold text-foreground">0</p>
                </div>
              </div>
            </div>

            {/* Subject Card 3 - MCG (Green) */}
            <div 
              className="p-4 rounded-xl shadow-sm overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)' }}
            >
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500" />
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2" style={{ backgroundColor: '#22c55e' }}>
                MCG
              </span>
              <p className="text-lg font-bold text-foreground">MCG</p>
              <div className="flex gap-6 mt-2">
                <div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Temps</p>
                  <p className="text-base font-bold text-foreground">0h</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> Sessions</p>
                  <p className="text-base font-bold text-foreground">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ===== SUBJECTS CARD =====
export const StaticSubjectsCard = () => (
  <div className="h-full flex bg-[#FFFDF8] dark:bg-card">
    <Sidebar activePage="matieres" />

    <div className="flex-1 flex flex-col">
      <TopBar icon={<GraduationCap className="w-4 h-4" />} label="Matières" />

      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Mes matières & examens</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Ajoute tes matières, leurs dates d'examen et ton objectif d'heures.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" />
          Ajouter une matière
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-4 gap-4 overflow-hidden">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Matières actives</p>
              <p className="text-2xl font-bold text-foreground">4</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prochain examen</p>
              <p className="text-base font-bold text-foreground">FINANCE <span className="text-primary">J-24</span></p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Target className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Heures totales visées</p>
              <p className="text-2xl font-bold text-foreground">90h</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <span className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium">Toutes (4)</span>
          <span className="px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium bg-primary/5">Partiel (4)</span>
          <span className="px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium bg-primary/5">Contrôle continu (0)</span>
          <span className="px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium bg-primary/5">Oral (0)</span>
        </div>

        {/* Subjects Table */}
        <div className="flex-1 rounded-xl border border-border/30 bg-white dark:bg-card overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Matière</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date d'examen</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Objectif</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Priorité</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'FINANCE', color: '#ef4444', date: '14 janv. 2025', hours: '20h', priority: 'Élevée', status: 'À réviser' },
                { name: 'MCG', color: '#22c55e', date: '14 janv. 2025', hours: '25h', priority: 'Élevée', status: 'À réviser' },
                { name: 'MSI', color: '#3b82f6', date: '16 janv. 2025', hours: '30h', priority: 'Moyenne', status: 'En cours' },
                { name: 'DROIT', color: '#f59e0b', date: '18 janv. 2025', hours: '15h', priority: 'Basse', status: 'À réviser' },
              ].map((subject, i) => (
                <tr key={i} className="border-b border-border/10 last:border-b-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                      <span className="text-sm font-medium text-foreground">{subject.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{subject.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{subject.hours}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      subject.priority === 'Élevée' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      subject.priority === 'Moyenne' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {subject.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      subject.status === 'En cours' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {subject.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
