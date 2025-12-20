import { Check, Calendar, Brain, Clock, Target, Timer, Play, Pause, RotateCcw, Coffee, BookOpen, BarChart3, GraduationCap, Settings, Bell, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.png';

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
            {/* Screenshot side */}
            <div className="p-6 md:p-8 bg-muted/30">
              <div className="rounded-xl overflow-hidden border border-border shadow-lg bg-card">
                {/* Calendar header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h4 className="text-lg font-bold text-foreground">Décembre 2025</h4>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg border border-primary/30 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors">
                      <span className="text-sm">‹</span>
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/10 transition-colors">
                      Aujourd'hui
                    </button>
                    <button className="w-8 h-8 rounded-lg border border-primary/30 text-primary flex items-center justify-center hover:bg-primary/10 transition-colors">
                      <span className="text-sm">›</span>
                    </button>
                  </div>
                </div>
                
                {/* Days header */}
                <div className="grid grid-cols-7 border-b border-border">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground border-r border-border last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {/* Week 1 */}
                  {[
                    { day: 1, events: [] },
                    { day: 2, events: [] },
                    { day: 3, events: [] },
                    { day: 4, events: [{ color: 'bg-indigo-500', title: 'TEC 535 Manage...' }, { color: 'bg-indigo-500', title: 'TEC 535 Manage...' }] },
                    { day: 5, events: [{ color: 'bg-indigo-500', title: 'TEC 536 Anglais d...' }] },
                    { day: 6, events: [] },
                    { day: 7, events: [] },
                  ].map((item, i) => (
                    <div key={i} className="min-h-[80px] p-1.5 border-r border-b border-border last:border-r-0 relative">
                      <span className="text-xs font-medium text-foreground">{item.day}</span>
                      <div className="mt-1 space-y-1">
                        {item.events.slice(0, 2).map((event, j) => (
                          <div key={j} className={`text-[10px] px-1.5 py-0.5 rounded ${event.color} text-white font-medium truncate`}>
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Week 2 */}
                  {[
                    { day: 8, events: [] },
                    { day: 9, events: [] },
                    { day: 10, events: [{ color: 'bg-indigo-500', title: 'TEC 532 Finance...' }, { color: 'bg-indigo-500', title: 'TEC 532 Finance...' }] },
                    { day: 11, events: [{ color: 'bg-indigo-500', title: 'TEC 533 Manage...' }, { color: 'bg-indigo-500', title: 'TEC 533 Manage...' }] },
                    { day: 12, events: [{ color: 'bg-indigo-500', title: 'TEC 532 Finance...' }, { color: 'bg-indigo-500', title: 'TEC 536 Anglais d...' }] },
                    { day: 13, events: [] },
                    { day: 14, events: [] },
                  ].map((item, i) => (
                    <div key={i} className="min-h-[80px] p-1.5 border-r border-b border-border last:border-r-0 relative">
                      <span className="text-xs font-medium text-foreground">{item.day}</span>
                      <div className="mt-1 space-y-1">
                        {item.events.slice(0, 2).map((event, j) => (
                          <div key={j} className={`text-[10px] px-1.5 py-0.5 rounded ${event.color} text-white font-medium truncate`}>
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Week 3 */}
                  {[
                    { day: 15, events: [] },
                    { day: 16, events: [] },
                    { day: 17, events: [] },
                    { day: 18, events: [{ color: 'bg-indigo-500', title: 'TEC 535 Manage...' }, { color: 'bg-indigo-500', title: 'TEC 535 Manage...' }] },
                    { day: 19, events: [{ color: 'bg-blue-500', title: 'MSI' }] },
                    { day: 20, events: [{ color: 'bg-red-500', title: 'FINANCE' }, { color: 'bg-blue-500', title: 'MSI' }], isToday: true, extra: 1 },
                    { day: 21, events: [{ color: 'bg-green-500', title: "Cours d'arabe" }, { color: 'bg-red-500', title: 'FINANCE' }], extra: 1 },
                  ].map((item, i) => (
                    <div key={i} className="min-h-[80px] p-1.5 border-r border-b border-border last:border-r-0 relative">
                      <span className={`text-xs font-medium ${item.isToday ? 'bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center' : 'text-foreground'}`}>
                        {item.day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {item.events.slice(0, 2).map((event, j) => (
                          <div key={j} className={`text-[10px] px-1.5 py-0.5 rounded ${event.color} text-white font-medium truncate`}>
                            {event.title}
                          </div>
                        ))}
                        {item.extra && <span className="text-[9px] text-muted-foreground">+{item.extra} autres</span>}
                      </div>
                    </div>
                  ))}
                  
                  {/* Week 4 */}
                  {[
                    { day: 22, events: [{ color: 'bg-blue-500', title: 'Neosilver' }] },
                    { day: 23, events: [{ color: 'bg-blue-500', title: 'Neosilver' }] },
                    { day: 24, events: [{ color: 'bg-blue-500', title: 'Neosilver' }] },
                    { day: 25, events: [{ color: 'bg-red-500', title: 'FINANCE' }] },
                    { day: 26, events: [{ color: 'bg-blue-500', title: 'Neosilver' }, { color: 'bg-amber-500', title: 'FINANCE' }], extra: 1 },
                    { day: 27, events: [{ color: 'bg-red-500', title: 'FINANCE' }, { color: 'bg-red-500', title: 'FINANCE' }], extra: 1 },
                    { day: 28, events: [{ color: 'bg-green-500', title: "Cours d'arabe" }, { color: 'bg-red-500', title: 'FINANCE' }], extra: 2 },
                  ].map((item, i) => (
                    <div key={i} className="min-h-[80px] p-1.5 border-r border-b border-border last:border-r-0 relative">
                      <span className="text-xs font-medium text-foreground">{item.day}</span>
                      <div className="mt-1 space-y-1">
                        {item.events.slice(0, 2).map((event, j) => (
                          <div key={j} className={`text-[10px] px-1.5 py-0.5 rounded ${event.color} text-white font-medium truncate`}>
                            {event.title}
                          </div>
                        ))}
                        {item.extra && <span className="text-[9px] text-muted-foreground">+{item.extra} autres</span>}
                      </div>
                    </div>
                  ))}
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
                Invite tes amis à réviser avec toi grâce à la visio intégrée. 
                Partage tes sessions directement depuis ton planning 
                et révisez ensemble, même à distance.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Visioconférence intégrée, pas besoin d'app externe</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Partage de session en un clic via lien d'invitation</span>
                </li>
              </ul>
            </div>

            {/* Video call mockup side */}
            <div className="p-6 md:p-8 bg-muted/30 order-1 md:order-2">
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg">
                {/* Video header */}
                <div className="bg-foreground/5 px-4 py-3 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-foreground">Session en cours</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Maths - Chapitre 5</span>
                </div>
                
                {/* Video grid */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Participant 1 */}
                    <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center relative">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                        T
                      </div>
                      <span className="absolute bottom-2 left-2 text-xs text-white bg-black/40 px-2 py-0.5 rounded">Toi</span>
                    </div>
                    {/* Participant 2 */}
                    <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center relative">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                        M
                      </div>
                      <span className="absolute bottom-2 left-2 text-xs text-white bg-black/40 px-2 py-0.5 rounded">Marie</span>
                    </div>
                    {/* Participant 3 */}
                    <div className="aspect-video bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center relative">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                        L
                      </div>
                      <span className="absolute bottom-2 left-2 text-xs text-white bg-black/40 px-2 py-0.5 rounded">Lucas</span>
                    </div>
                    {/* Add participant */}
                    <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                          <span className="text-primary text-xl">+</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Inviter</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="px-4 py-3 border-t border-border flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <div className="w-4 h-4 rounded-sm bg-muted-foreground/50" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <div className="w-4 h-3 rounded-sm bg-muted-foreground/50" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center">
                    <div className="w-5 h-1.5 rounded-full bg-white rotate-45" />
                  </div>
                </div>
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
