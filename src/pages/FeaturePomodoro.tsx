import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import pomodoroScreenshot from '@/assets/pomodoro-screenshot.png';

const FeaturePomodoro = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-5 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft delay-1000" />
      </div>

      {/* Hero Section */}
      <main className="relative pt-24 md:pt-32">
        <div className="max-w-5xl mx-auto px-4 text-center">
          {/* Main heading */}
          <div className="space-y-4 md:space-y-6 animate-slide-up mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Pomodoro
              <br />
              <span className="gradient-text-animated font-heading">
                Timer
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Concentre-toi avec la méthode Pomodoro 25/5. Des sessions de travail 
            intensives suivies de pauses régulières pour maximiser ta productivité 
            et maintenir ta concentration sur la durée.
          </p>

          {/* CTA Button */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link to="/auth?mode=signup">
              <Button variant="outline" size="lg" className="rounded-full px-6">
                Commencer à réviser efficacement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Pomodoro Screenshot */}
        <div className="relative max-w-6xl mx-auto px-4 mt-16 pb-16">
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <img 
              src={pomodoroScreenshot} 
              alt="Capture d'écran du timer Pomodoro" 
              className="w-full h-auto rounded-xl md:rounded-2xl border border-border/20 shadow-xl"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturePomodoro;
