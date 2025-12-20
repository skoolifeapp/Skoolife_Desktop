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
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight font-heading mb-6">
          Étudie plus intelligemment,
          <br />
          <span className="text-muted-foreground">pas plus difficilement.</span>
        </h2>
        <p className="max-w-2xl text-base md:text-lg text-muted-foreground mx-auto">
          De la génération automatique de planning à l'analyse de tes progrès, 
          Skoolife t'aide à optimiser ton temps de révision et à retenir plus efficacement.
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
                Calendrier Intelligent
              </h3>
              <p className="text-muted-foreground mb-6">
                Arrête de perdre du temps sur la planification manuelle. 
                Skoolife génère automatiquement ton planning de révisions 
                en fonction de tes examens et de ton emploi du temps.
              </p>
              <div className="flex items-center gap-2 text-foreground">
                <Check className="w-5 h-5 text-primary" />
                <span>Économise 10+ heures par semaine</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: Méthode scientifique */}
      <div className="max-w-6xl mx-auto px-4 mb-20 md:mb-32">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Text side - left on desktop */}
            <div className="p-6 md:p-10 flex flex-col justify-center order-2 md:order-1">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Apprentissage Basé sur la Science
              </h3>
              <p className="text-muted-foreground mb-6">
                Basé sur la science cognitive, pas sur les tendances de productivité. 
                Skoolife implémente des techniques d'apprentissage prouvées comme la répétition espacée, 
                le rappel actif et la difficulté adaptive.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Basé sur la courbe d'oubli d'Ebbinghaus</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Intervalles de révision optimaux pour la rétention long terme</span>
                </li>
              </ul>
            </div>

            {/* Methods selector side */}
            <div className="p-6 md:p-8 bg-muted/30 order-1 md:order-2">
              <div className="space-y-3">
                {/* Method 1 */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    <div>
                      <h4 className="font-semibold text-foreground">Méthode des 2 semaines</h4>
                      <p className="text-sm text-muted-foreground">Cycle de révision toutes les 2 semaines</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-8">Intervalles: J2 → J7 → J14</p>
                </div>

                {/* Method 2 - Selected */}
                <div className="bg-card rounded-xl border-2 border-primary p-4 relative">
                  <span className="absolute top-3 right-3 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                    Recommandée
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Méthode des J</h4>
                      <p className="text-sm text-muted-foreground">Révision complète selon la courbe d'oubli</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 ml-8">Intervalles: J0 → J1 → J3 → J7 → J15 → J30</p>
                </div>

                {/* Method 3 */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      <div>
                        <h4 className="font-semibold text-foreground">Révision intensive</h4>
                        <p className="text-sm text-muted-foreground">Sessions concentrées de 90min</p>
                      </div>
                    </div>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                      Intensif
                    </span>
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
                  alt="Interface Pomodoro Skoolife" 
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Text side */}
            <div className="md:col-span-2 p-6 md:p-10 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Pomodoro
              </h3>
              <p className="text-muted-foreground mb-4">
                Tes sessions d'étude, intelligemment orchestrées.
              </p>
              <p className="text-sm text-muted-foreground">
                La technique Pomodoro rencontre l'intelligence artificielle. 
                Obtiens des sessions d'étude automatiquement planifiées autour 
                de ton calendrier, avec un timing spécifique aux matières.
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
              Visualise tes progrès en temps réel. Suis le nombre d'heures 
              passées sur chaque matière et atteins tes objectifs.
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
              Organise toutes tes matières avec leurs dates d'examen, 
              niveaux de difficulté et objectifs personnalisés.
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
          Mets les parties fastidieuses des études en pilote automatique. 
          Skoolife t'aide à optimiser ton temps, réduire la planification 
          manuelle et organiser intelligemment ton succès académique.
        </h2>
        <Link to="/auth?mode=signup">
          <Button variant="hero" size="lg" className="md:text-base px-8">
            Commencer maintenant
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default LandingFeatures;
