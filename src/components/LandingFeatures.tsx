import { Check, Calendar, Brain, Clock, Target, Timer, Play, Pause, RotateCcw, Coffee, BookOpen, BarChart3, GraduationCap, Settings, Bell, Sun, CheckCircle2, RefreshCw, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
const LOGO_URL = '/logo.png';

const LandingFeatures = () => {
  return (
    <section className="relative py-20 md:py-32 bg-background">
      {/* Intro Section */}
      <div className="max-w-4xl mx-auto px-4 text-center mb-20 md:mb-32">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight font-heading mb-6">
          Révise plus intelligemment,
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">pas plus longtemps.</span>
        </h2>
        <p className="max-w-2xl text-base md:text-lg text-muted-foreground mx-auto">
          De la génération automatique de ton planning à l'analyse de ta progression, 
          Skoolife t'accompagne pour optimiser chaque minute de révision.
        </p>
      </div>

      {/* Feature 1: Calendrier Intelligent */}
      <div className="max-w-6xl mx-auto px-4 mb-20 md:mb-32">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Screenshot side - Weekly Calendar with mock data */}
            <div className="p-6 md:p-8 bg-muted/30">
              <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-[#FFFDF8] dark:bg-card flex flex-col h-full">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span className="text-xs font-medium text-foreground">Calendrier</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bell className="w-3 h-3 text-muted-foreground" />
                    <Sun className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2">
                  <h4 className="text-sm font-bold text-foreground">Semaine du 22 déc.</h4>
                  <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                    <Plus className="w-3 h-3" />
                    Ajouter
                  </button>
                </div>

                {/* Content Grid */}
                <div className="flex-1 flex px-3 pb-3 gap-2 overflow-hidden">
                  {/* Left Sidebar */}
                  <div className="w-28 flex-shrink-0 flex flex-col gap-2">
                    {/* Stats Card */}
                    <div className="p-2 rounded-lg border border-border/30 bg-white dark:bg-card">
                      <p className="text-[10px] font-semibold text-foreground mb-1.5">Cette semaine</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
                            <Clock className="w-2.5 h-2.5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-tight">18h</p>
                            <p className="text-[8px] text-muted-foreground">planifiées</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-tight">0</p>
                            <p className="text-[8px] text-muted-foreground">terminées</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exams */}
                    <div className="p-2 rounded-lg border border-border/30 bg-white dark:bg-card flex-1">
                      <p className="text-[10px] font-semibold text-foreground mb-1.5 flex items-center gap-1">
                        <Settings className="w-2.5 h-2.5 text-muted-foreground" />
                        Examens
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span className="text-[8px] text-foreground">FINANCE</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[8px] text-foreground">MCG</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-[8px] text-foreground">MSI</span>
                        </div>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-medium">
                      <RefreshCw className="w-2.5 h-2.5" />
                      Générer
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-card overflow-hidden flex flex-col">
                    {/* Days Header */}
                    <div className="grid grid-cols-[24px_repeat(7,1fr)] border-b border-gray-200 dark:border-gray-700">
                      <div></div>
                      {[
                        { day: 'L', num: '22' },
                        { day: 'M', num: '23' },
                        { day: 'M', num: '24' },
                        { day: 'J', num: '25' },
                        { day: 'V', num: '26' },
                        { day: 'S', num: '27' },
                        { day: 'D', num: '28' },
                      ].map((d, i) => (
                        <div key={i} className="py-1 text-center border-l border-gray-200 dark:border-gray-700">
                          <p className="text-[8px] text-muted-foreground">{d.day}</p>
                          <p className="text-[10px] font-semibold text-foreground">{d.num}</p>
                        </div>
                      ))}
                    </div>

                    {/* Time Grid */}
                    <div className="relative flex-1 min-h-[200px]">
                      <div className="absolute inset-0 flex flex-col">
                        {['8:00', '10:00', '12:00', '14:00', '16:00'].map((time, i) => (
                          <div key={i} className="flex-1 flex border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                            <div className="w-6 text-right pr-1 pt-0.5 text-[7px] text-muted-foreground">{time}</div>
                            <div className="flex-1 grid grid-cols-7">
                              {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                                <div key={col} className="border-l border-gray-200 dark:border-gray-700" />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Events overlay */}
                      <div className="absolute inset-0 ml-6">
                        {/* Alternance - Lun, Mar, Mer */}
                        {[0, 1, 2].map((day) => (
                          <div 
                            key={day}
                            className="absolute rounded bg-blue-100 dark:bg-blue-900/40 p-0.5"
                            style={{ left: `calc((${day} * 100% / 7) + 1px)`, width: `calc(100% / 7 - 2px)`, top: '20%', height: '60%' }}
                          >
                            <p className="text-[7px] font-semibold text-blue-700 dark:text-blue-300 truncate">Alternance</p>
                          </div>
                        ))}
                        {/* Alternance - Ven */}
                        <div 
                          className="absolute rounded bg-blue-100 dark:bg-blue-900/40 p-0.5"
                          style={{ left: `calc((4 * 100% / 7) + 1px)`, width: `calc(100% / 7 - 2px)`, top: '20%', height: '40%' }}
                        >
                          <p className="text-[7px] font-semibold text-blue-700 dark:text-blue-300 truncate">Alternance</p>
                        </div>
                        {/* FINANCE - Jeu */}
                        <div 
                          className="absolute rounded bg-red-100 dark:bg-red-900/40 p-0.5 flex items-start justify-between"
                          style={{ left: `calc((3 * 100% / 7) + 1px)`, width: `calc(100% / 7 - 2px)`, top: '60%', height: '20%' }}
                        >
                          <p className="text-[7px] font-semibold text-red-600 dark:text-red-300 truncate">FINANCE</p>
                          <CheckCircle2 className="w-2 h-2 text-red-400 flex-shrink-0" />
                        </div>
                        {/* FINANCE - Sam (3 sessions) */}
                        <div 
                          className="absolute rounded bg-red-100 dark:bg-red-900/40 p-0.5 flex items-start justify-between"
                          style={{ left: `calc((5 * 100% / 7) + 1px)`, width: `calc(100% / 7 - 2px)`, top: '0%', height: '15%' }}
                        >
                          <p className="text-[7px] font-semibold text-red-600 dark:text-red-300 truncate">FINANCE</p>
                          <CheckCircle2 className="w-2 h-2 text-red-400 flex-shrink-0" />
                        </div>
                        <div 
                          className="absolute rounded bg-red-100 dark:bg-red-900/40 p-0.5 flex items-start justify-between"
                          style={{ left: `calc((5 * 100% / 7) + 1px)`, width: `calc(100% / 7 - 2px)`, top: '20%', height: '15%' }}
                        >
                          <p className="text-[7px] font-semibold text-red-600 dark:text-red-300 truncate">FINANCE</p>
                          <CheckCircle2 className="w-2 h-2 text-red-400 flex-shrink-0" />
                        </div>
                        <div 
                          className="absolute rounded bg-red-100 dark:bg-red-900/40 p-0.5 flex items-start justify-between"
                          style={{ left: `calc((5 * 100% / 7) + 1px)`, width: `calc(100% / 7 - 2px)`, top: '60%', height: '20%' }}
                        >
                          <p className="text-[7px] font-semibold text-red-600 dark:text-red-300 truncate">FINANCE</p>
                          <CheckCircle2 className="w-2 h-2 text-red-400 flex-shrink-0" />
                        </div>
                        {/* Cours de piano - Dim */}
                        <div 
                          className="absolute rounded bg-amber-100 dark:bg-amber-900/40 p-0.5"
                          style={{ left: `calc((6 * 100% / 7) + 1px)`, width: `calc(100% / 7 - 2px)`, top: '10%', height: '25%' }}
                        >
                          <p className="text-[7px] font-semibold text-amber-700 dark:text-amber-300 truncate">Piano</p>
                        </div>
                        {/* FINANCE - Dim */}
                        <div 
                          className="absolute rounded bg-red-100 dark:bg-red-900/40 p-0.5 flex items-start justify-between"
                          style={{ left: `calc((6 * 100% / 7) + 1px)`, width: `calc(100% / 7 - 2px)`, top: '60%', height: '20%' }}
                        >
                          <p className="text-[7px] font-semibold text-red-600 dark:text-red-300 truncate">FINANCE</p>
                          <CheckCircle2 className="w-2 h-2 text-red-400 flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Planning Automatique
              </h3>
              <p className="text-muted-foreground mb-6">
                Fini les heures passées à planifier. Skoolife génère ton planning 
                de révisions personnalisé en fonction de tes examens, 
                ton emploi du temps et tes disponibilités.
              </p>
              <div className="flex items-center gap-2 text-foreground">
                <Check className="w-5 h-5 text-primary" />
                <span>Gagne du temps chaque semaine</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: Révisions en groupe */}
      <div className="max-w-6xl mx-auto px-4 mb-20 md:mb-32">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Text side - left on desktop */}
            <div className="p-6 md:p-10 flex flex-col justify-center order-2 md:order-1">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Révise à Plusieurs
              </h3>
              <p className="text-muted-foreground mb-6">
                Invite tes amis à réviser avec toi. 
                Partage tes sessions directement depuis ton planning 
                et révisez ensemble, en présentiel ou à distance.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Partage de session en un clic via lien d'invitation</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Confirmation de participation en temps réel</span>
                </li>
              </ul>
            </div>

            {/* Illustration side */}
            <div className="p-6 md:p-8 bg-muted/30 order-1 md:order-2 flex items-center justify-center">
              <div className="w-full max-w-[280px] aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-border flex items-center justify-center">
                <Users className="w-24 h-24 text-primary/60" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 3: Pomodoro */}
      <div className="max-w-6xl mx-auto px-4 mb-20 md:mb-32">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Text side */}
            <div className="p-6 md:p-10 flex flex-col justify-center order-2 md:order-1">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Timer Pomodoro
              </h3>
              <p className="text-muted-foreground mb-4">
                Reste concentré avec la technique Pomodoro intégrée.
              </p>
              <p className="text-sm text-muted-foreground">
                Lance tes sessions de révision directement depuis ton planning. 
                Le timer te guide avec des cycles de travail et de pause 
                pour une concentration maximale.
              </p>
            </div>

            {/* Pomodoro Card mockup */}
            <div className="p-4 md:p-6 bg-muted/30 order-1 md:order-2">
              <div className="bg-[#FFFDF8] dark:bg-card rounded-xl border border-border/20 overflow-hidden shadow-lg">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Timer className="w-3 h-3" />
                    <span className="text-xs font-medium text-foreground">Pomodoro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="relative p-1.5 rounded-full">
                      <Bell className="w-3 h-3 text-muted-foreground" />
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">3</span>
                    </div>
                  </div>
                </div>

                {/* Session Type Buttons */}
                <div className="flex gap-1.5 justify-center px-4 py-3">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    <Brain className="w-3 h-3" />
                    Focus
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground text-xs font-medium bg-white dark:bg-card">
                    <Coffee className="w-3 h-3" />
                    Pause courte
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground text-xs font-medium bg-white dark:bg-card">
                    <Coffee className="w-3 h-3" />
                    Pause longue
                  </button>
                </div>

                {/* Timer */}
                <div className="px-4 pb-4 flex flex-col items-center">
                  {/* Selected Session */}
                  <div className="mb-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 bg-blue-100 text-blue-600">
                    <Target className="w-3 h-3" />
                    MSI
                  </div>

                  {/* Timer Circle */}
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray="283"
                        strokeDashoffset="70"
                        strokeLinecap="round"
                        className="text-primary"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold tabular-nums">18:42</span>
                      <span className="text-xs font-medium text-primary">Focus</span>
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Pause className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                  <div className="p-3 rounded-lg border border-border/30 bg-white dark:bg-card flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Pomodoros</p>
                      <p className="text-lg font-bold text-foreground">3</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-border/30 bg-white dark:bg-card flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Temps focus</p>
                      <p className="text-lg font-bold text-foreground">75 min</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 4: Two cards row */}
      <div className="max-w-6xl mx-auto px-4 mb-20 md:mb-32">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Suivi de progression */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                Suivi de Progression
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Visualise tes progrès en temps réel. Suis le temps passé 
              sur chaque matière et atteins tes objectifs de révision.
            </p>
            
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Heures d'étude</p>
                  <p className="text-xl font-bold text-foreground">4h</p>
                </div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taux de complétion</p>
                  <p className="text-xl font-bold text-foreground">40%</p>
                </div>
              </div>
            </div>

            {/* Progress by subject */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Progrès par Matière</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* MSI Card */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border-l-4 border-blue-500 relative">
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500" />
                  <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-blue-500 text-white mb-2">MSI</span>
                  <p className="text-lg font-bold text-foreground mb-2">MSI</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>3h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      <span>2</span>
                    </div>
                  </div>
                </div>
                {/* Finance Card */}
                <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border-l-4 border-red-500 relative">
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500" />
                  <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-red-500 text-white mb-2">FIN</span>
                  <p className="text-lg font-bold text-foreground mb-2">FINANCE</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>1h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      <span>1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gestion des matières */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                Gestion des Matières
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Organise toutes tes matières avec leurs dates d'examen 
              et niveaux de difficulté. Skoolife adapte ton planning en conséquence.
            </p>
            
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Matières actives</p>
                  <p className="text-xl font-bold text-foreground">3</p>
                </div>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prochain examen</p>
                  <p className="text-sm font-bold text-foreground">FINANCE <span className="text-primary">J-24</span></p>
                </div>
              </div>
            </div>

            {/* Subject table */}
            <div className="bg-muted/30 rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs text-muted-foreground border-b border-border">
                <span>Matière</span>
                <span>Date</span>
                <span>Objectif</span>
                <span className="text-right">Priorité</span>
              </div>
              {[
                { name: 'FINANCE', date: '14/01/2026', hours: '35h', color: 'bg-red-500', priority: 'Haute', priorityColor: 'bg-red-100 text-red-600' },
                { name: 'MCG', date: '14/01/2026', hours: '25h', color: 'bg-green-500', priority: 'Haute', priorityColor: 'bg-red-100 text-red-600' },
                { name: 'MSI', date: '16/01/2026', hours: '20h', color: 'bg-blue-500', priority: 'Moyenne', priorityColor: 'bg-orange-100 text-orange-600' },
              ].map((subject, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 px-4 py-3 items-center border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                    <span className="font-medium text-foreground text-sm">{subject.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{subject.date}</span>
                  <span className="text-sm text-foreground">{subject.hours}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${subject.priorityColor} text-right w-fit ml-auto`}>{subject.priority}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Quote */}
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight font-heading mb-8">
          Arrête de stresser pour tes révisions. 
          Skoolife planifie tout pour toi, 
          tu te concentres sur ce qui compte vraiment : apprendre.
        </h2>
        <Link to="/auth?mode=signup">
          <Button variant="hero" size="lg" className="md:text-base px-8">
            Commencer gratuitement
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default LandingFeatures;
