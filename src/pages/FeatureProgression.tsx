import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CheckCircle2, TrendingUp, ChevronLeft, ChevronRight, BookOpen, Target, BarChart3, Bell, Sun } from 'lucide-react';
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

// Static Progression Card Component - Reproduit l'interface exacte de l'app
const StaticProgressionCard = () => (
  <div className="h-[520px] md:h-[620px] flex bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-2xl">
    {/* Yellow Sidebar - Navigation between feature pages */}
    <FeatureSidebar />

    {/* Main Content */}
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm">/</span>
          <span className="text-sm font-medium text-foreground">Progression</span>
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
              style={{ 
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)',
              }}
            >
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-blue-500" />
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2" style={{ backgroundColor: '#3b82f6' }}>
                MSI
              </span>
              <h4 className="font-bold text-foreground text-lg mb-3">MSI</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3" /> Temps d'étude
                  </p>
                  <p className="text-xl font-bold text-foreground">3h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <BookOpen className="w-3 h-3" /> Sessions
                  </p>
                  <p className="text-xl font-bold text-foreground">2</p>
                </div>
              </div>
            </div>

            {/* Subject Card 2 - FINANCE (Red/Salmon) */}
            <div 
              className="p-4 rounded-xl shadow-sm overflow-hidden relative"
              style={{ 
                background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
              }}
            >
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500" />
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2" style={{ backgroundColor: '#ef4444' }}>
                FIN
              </span>
              <h4 className="font-bold text-foreground text-lg mb-3">FINANCE</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3" /> Temps d'étude
                  </p>
                  <p className="text-xl font-bold text-foreground">0h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <BookOpen className="w-3 h-3" /> Sessions
                  </p>
                  <p className="text-xl font-bold text-foreground">0</p>
                </div>
              </div>
            </div>

            {/* Subject Card 3 - MCG (Green) */}
            <div 
              className="p-4 rounded-xl shadow-sm overflow-hidden relative"
              style={{ 
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)',
              }}
            >
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-green-500" />
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2" style={{ backgroundColor: '#22c55e' }}>
                MCG
              </span>
              <h4 className="font-bold text-foreground text-lg mb-3">MCG</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <Clock className="w-3 h-3" /> Temps d'étude
                  </p>
                  <p className="text-xl font-bold text-foreground">0h</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                    <BookOpen className="w-3 h-3" /> Sessions
                  </p>
                  <p className="text-xl font-bold text-foreground">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cumulative Progress Section */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Heures cumulées par Matière</h3>
          </div>
          
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm space-y-4">
            {/* MSI Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">MSI</span>
                </div>
                <span className="text-xs text-muted-foreground">3h / 19h</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-500" style={{ width: '16%' }} />
              </div>
              <p className="text-xs text-blue-600 mt-1">16% effectué</p>
            </div>

            {/* FINANCE Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium">FINANCE</span>
                </div>
                <span className="text-xs text-muted-foreground">0h / 32h</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-red-500" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FeatureProgression = () => {
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
              Suivi de
              <br />
              <span className="gradient-text-animated font-heading">
                Progression
              </span>
            </h1>
          </div>

          {/* Description */}
          <motion.p 
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Visualise tes progrès en temps réel. Suis ton temps d'étude par matière, 
            ton taux de complétion et atteins tes objectifs de révision semaine après semaine.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/auth?mode=signup" onClick={triggerConfetti}>
              <Button variant="outline" size="lg" className="rounded-full px-6 group">
                Suivre ma progression
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Static Progression Preview */}
        <motion.div 
          className="relative max-w-6xl mx-auto px-4 mt-16 pb-16"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div>
            <StaticProgressionCard />
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureProgression;