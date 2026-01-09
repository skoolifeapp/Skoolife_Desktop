import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings, Clock, Bell, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureSidebar from '@/components/FeatureSidebar';
import ParallaxBackground from '@/components/ParallaxBackground';
import { useConfetti } from '@/hooks/useConfetti';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

// Static Settings Card Component with routing navigation
const StaticSettingsCard = () => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  return (
    <div className="h-[520px] md:h-[620px] flex bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-2xl">
      {/* Yellow Sidebar - Navigation between feature pages */}
      <FeatureSidebar />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Settings className="w-4 h-4" />
            <span className="text-sm">/</span>
            <span className="text-sm font-medium text-foreground">Paramètres</span>
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

        {/* Page Header */}
        <div className="px-6 py-4">
          <h2 className="text-xl font-bold text-foreground">Paramètres</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Configure tes préférences de révisions</p>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-4 overflow-hidden">
          <div className="rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm p-6">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Préférences de révisions</h3>
                <p className="text-sm text-muted-foreground">Configure quand et comment tu veux réviser. Ces préférences seront prises en compte lors de la prochaine génération de planning.</p>
              </div>
            </div>

            {/* Weekly Goal Slider */}
            <div className="mb-6">
              <p className="text-sm font-medium text-foreground mb-3">Objectif hebdomadaire : <span className="text-primary">40h</span></p>
              <div className="relative h-2 bg-muted rounded-full">
                <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: '100%' }} />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Entre 2h et 40h par semaine</p>
            </div>

            {/* Preferred Days */}
            <div className="mb-6">
              <p className="text-sm font-medium text-foreground mb-3">Jours de révision préférés</p>
              <div className="flex gap-2 flex-wrap">
                {days.map((day) => (
                  <span 
                    key={day} 
                    className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Heure de début</p>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border/40 bg-muted/20">
                  <span className="text-sm font-medium text-foreground">08:00</span>
                  <Clock className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Heure de fin</p>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border/40 bg-muted/20">
                  <span className="text-sm font-medium text-foreground">23:00</span>
                  <Clock className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              </div>
            </div>

            {/* Max Hours per Day Slider */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Heures max par jour : <span className="text-primary">6h</span></p>
              <div className="relative h-2 bg-muted rounded-full">
                <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: '60%' }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow" style={{ left: 'calc(60% - 8px)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureSettings = () => {
  const { triggerConfetti } = useConfetti();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background decorations with parallax */}
      <ParallaxBackground />

      {/* Hero Section */}
      <main className="relative pt-24 md:pt-32">
        <motion.div 
          className="max-w-5xl mx-auto px-4 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          {/* Main heading */}
          <div className="space-y-4 md:space-y-6 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Paramètres
              <br />
              <span className="gradient-text-animated font-heading">
                Personnalisés
              </span>
            </h1>
          </div>

          {/* Description */}
          <motion.p 
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Configure tes préférences de révisions selon ton emploi du temps. 
            Définis tes jours préférés, tes horaires et la durée de tes sessions 
            pour un planning parfaitement adapté à ta vie.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/auth?mode=signup" onClick={triggerConfetti}>
              <Button variant="outline" size="lg" className="rounded-full px-6 group">
                Personnaliser mes révisions
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Static Settings Preview */}
        <motion.div 
          className="relative max-w-6xl mx-auto px-4 mt-16 pb-16"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <StaticSettingsCard />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureSettings;