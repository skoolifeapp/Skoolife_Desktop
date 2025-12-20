import { Check, Calendar, Brain, Clock, Target } from 'lucide-react';
import pomodoroScreenshot from '@/assets/pomodoro-screenshot.png';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

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
              <div className="rounded-xl overflow-hidden border border-border shadow-lg">
                <div className="bg-card p-4">
                  {/* Mock calendar header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Décembre 2024</span>
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded bg-muted" />
                      <div className="w-6 h-6 rounded bg-muted" />
                    </div>
                  </div>
                  {/* Mock calendar grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { day: 16, events: [{ color: 'bg-green-400', title: 'Maths' }] },
                      { day: 17, events: [{ color: 'bg-blue-400', title: 'Physique' }] },
                      { day: 18, events: [{ color: 'bg-purple-400', title: 'Chimie' }, { color: 'bg-pink-400', title: 'SVT' }] },
                    ].map((day, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium text-foreground">{day.day}</span>
                        <div className="mt-2 space-y-1">
                          {day.events.map((event, j) => (
                            <div key={j} className={`text-xs px-2 py-1 rounded ${event.color} text-white font-medium truncate`}>
                              {event.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {[
                      { day: 19, events: [{ color: 'bg-orange-400', title: 'Anglais' }] },
                      { day: 20, events: [{ color: 'bg-green-400', title: 'Maths J7' }, { color: 'bg-blue-400', title: 'Physique J3' }] },
                      { day: 21, events: [] },
                    ].map((day, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium text-foreground">{day.day}</span>
                        <div className="mt-2 space-y-1">
                          {day.events.map((event, j) => (
                            <div key={j} className={`text-xs px-2 py-1 rounded ${event.color} text-white font-medium truncate`}>
                              {event.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
          <div className="grid md:grid-cols-5 gap-0">
            {/* Screenshot - larger */}
            <div className="md:col-span-3 p-4 md:p-6 bg-muted/30">
              <div className="rounded-xl overflow-hidden border border-border shadow-lg">
                <img 
                  src={pomodoroScreenshot} 
                  alt="Timer Pomodoro Skoolife" 
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Text side */}
            <div className="md:col-span-2 p-6 md:p-10 flex flex-col justify-center">
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
          </div>
        </div>
      </div>

      {/* Feature 4: Two cards row */}
      <div className="max-w-6xl mx-auto px-4 mb-20 md:mb-32">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Suivi de progression */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
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
            <div className="space-y-3">
              {[
                { name: 'Mathématiques', progress: 85, color: 'bg-blue-400' },
                { name: 'Physique', progress: 65, color: 'bg-green-400' },
                { name: 'Chimie', progress: 45, color: 'bg-purple-400' },
              ].map((subject, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{subject.name}</span>
                    <span className="text-muted-foreground">{subject.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${subject.color} rounded-full transition-all duration-500`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                </div>
              ))}
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
            <div className="space-y-2">
              {[
                { name: 'Maths', date: '15 Jan', color: 'bg-blue-400', difficulty: 'Difficile' },
                { name: 'Physique', date: '18 Jan', color: 'bg-green-400', difficulty: 'Moyen' },
                { name: 'Anglais', date: '20 Jan', color: 'bg-orange-400', difficulty: 'Facile' },
              ].map((subject, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                  <span className="font-medium text-foreground flex-1">{subject.name}</span>
                  <span className="text-xs text-muted-foreground">{subject.date}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{subject.difficulty}</span>
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
