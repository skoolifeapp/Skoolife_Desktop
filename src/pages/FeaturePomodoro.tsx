import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Timer, Play, Pause, RotateCcw, Coffee, Brain, BookOpen, Clock, Target, Bell, Sun } from 'lucide-react';
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

// Static Pomodoro Card Component - Reproduit l'interface exacte de l'app
const StaticPomodoroCard = () => (
  <div className="h-[520px] md:h-[620px] flex bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-2xl">
    {/* Yellow Sidebar - Navigation between feature pages */}
    <FeatureSidebar />

    {/* Main Content */}
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Timer className="w-4 h-4" />
          <span className="text-sm">/</span>
          <span className="text-sm font-medium text-foreground">Pomodoro</span>
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
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Timer className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Pomodoro</h2>
          <p className="text-sm text-muted-foreground">Concentre-toi avec la méthode 25/5</p>
        </div>
      </div>

      {/* Session Type Buttons */}
      <div className="flex gap-2 justify-center px-6 mb-4">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
          <Brain className="w-4 h-4" />
          Focus
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 text-muted-foreground text-sm font-medium bg-white dark:bg-card">
          <Coffee className="w-4 h-4" />
          Pause courte
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 text-muted-foreground text-sm font-medium bg-white dark:bg-card">
          <Coffee className="w-4 h-4" />
          Pause longue
        </button>
      </div>

      {/* Content Grid */}
      <div className="flex-1 flex px-6 pb-4 gap-4 overflow-hidden">
        {/* Left Column - Timer */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Timer Card */}
          <div className="flex-1 p-6 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex flex-col items-center justify-center">
            {/* Selected Session */}
            <div className="mb-4 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 bg-blue-100 text-blue-600">
              <Target className="w-4 h-4" />
              MSI
            </div>

            {/* Timer Circle */}
            <div className="relative w-40 h-40 md:w-48 md:h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="283"
                  strokeDashoffset="70"
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl md:text-5xl font-bold tabular-nums">18:42</span>
                <span className="text-sm font-medium mt-2 text-primary">Focus</span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground bg-white dark:bg-card">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Pause className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pomodoros</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Temps focus</p>
                <p className="text-2xl font-bold text-foreground">75 min</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sessions */}
        <div className="hidden md:flex w-64 flex-col gap-3 flex-shrink-0">
          {/* Sessions List */}
          <div className="p-2 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm space-y-2">
            {/* Session 1 - MSI (selected) */}
            <div className="p-2.5 rounded-lg border-2 border-primary bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">MSI</p>
                  <p className="text-[10px] text-muted-foreground">Aujourd'hui</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground leading-tight">14:00</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">15:30</p>
                </div>
                <button className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center gap-0.5 flex-shrink-0">
                  <Play className="w-2.5 h-2.5" />
                  Focus
                </button>
              </div>
            </div>

            {/* Session 2 - FINANCE */}
            <div className="p-2.5 rounded-lg border border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">FINANCE</p>
                  <p className="text-[10px] text-muted-foreground">Aujourd'hui</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground leading-tight">16:00</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">17:30</p>
                </div>
                <button className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center gap-0.5 flex-shrink-0">
                  <Play className="w-2.5 h-2.5" />
                  Focus
                </button>
              </div>
            </div>

            {/* Session 3 - MCG */}
            <div className="p-2.5 rounded-lg border border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">MCG</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground leading-tight">09:00</p>
                </div>
                <button className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center gap-0.5 flex-shrink-0">
                  <Play className="w-2.5 h-2.5" />
                  Focus
                </button>
              </div>
            </div>
          </div>

          {/* Method Card */}
          <div className="p-4 rounded-xl border border-border/30 bg-muted/30 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🍅</div>
              <div>
                <h3 className="font-semibold text-sm mb-1">La méthode Pomodoro</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Travaille 25 minutes avec concentration, puis prends 5 minutes de pause.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FeaturePomodoro = () => {
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
              Pomodoro
              <br />
              <span className="gradient-text-animated font-heading">
                Timer
              </span>
            </h1>
          </div>

          {/* Description */}
          <motion.p 
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Concentre-toi avec la méthode Pomodoro 25/5. Des sessions de travail 
            intensives suivies de pauses régulières pour maximiser ta productivité 
            et maintenir ta concentration sur la durée.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/auth?mode=signup" onClick={triggerConfetti}>
              <Button variant="outline" size="lg" className="rounded-full px-6 group">
                Commencer à réviser efficacement
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Static Pomodoro Preview */}
        <motion.div 
          className="relative max-w-6xl mx-auto px-4 mt-16 pb-16"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div>
            <StaticPomodoroCard />
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturePomodoro;