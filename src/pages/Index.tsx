import { useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
const LOGO_URL = '/logo.png';
import StackedCardsLayout from '@/components/StackedCardsLayout';
import LandingFeatures from '@/components/LandingFeatures';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useConfetti } from '@/hooks/useConfetti';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
  }
};

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax scroll effects
  const { scrollY } = useScroll();
  const blob1Y = useTransform(scrollY, [0, 500], [0, 150]);
  const blob2Y = useTransform(scrollY, [0, 500], [0, -100]);
  const blob3Y = useTransform(scrollY, [0, 500], [0, 80]);
  const blob1Scale = useTransform(scrollY, [0, 300], [1, 1.2]);
  const blob2Scale = useTransform(scrollY, [0, 300], [1, 0.9]);

  useEffect(() => {
    if (!loading && user) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  // On mobile, redirect to desktop-only page instead of auth
  const ctaLink = isMobile ? '/desktop-only' : '/auth?mode=signup';

  const { triggerConfetti } = useConfetti();

  return (
    <div className="min-h-screen bg-background" ref={containerRef}>
      <Navbar />

      {/* Hero */}
      <main className="relative pt-16 md:pt-20">
        {/* Background decorations with parallax */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ y: blob1Y, scale: blob1Scale }}
            className="absolute top-20 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            style={{ y: blob2Y, scale: blob2Scale }}
            className="absolute top-40 right-5 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft delay-1000" 
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.4 }}
            style={{ y: blob3Y }}
            className="absolute bottom-20 left-1/3 w-40 md:w-64 h-40 md:h-64 bg-primary/10 rounded-full blur-3xl" 
          />
        </div>

        {/* Hero Section - Centered Text */}
        <motion.div 
          className="relative max-w-4xl mx-auto px-4 pt-12 md:pt-20 pb-8 md:pb-16 text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Main heading */}
          <motion.div className="space-y-4 md:space-y-6" variants={fadeInUp} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Tes révisions,
              <br />
              <span className="gradient-text-animated font-heading">
                enfin organisées
              </span>
            </h1>
            <motion.p 
              className="max-w-2xl text-base md:text-lg lg:text-xl text-muted-foreground mx-auto"
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Skoolife génère automatiquement ton planning de révisions personnalisé 
              en fonction de tes examens, ton emploi du temps et ton rythme.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 md:mt-10"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to={ctaLink} onClick={triggerConfetti}>
              <Button variant="default" size="lg" className="md:text-base px-8 group">
                Commencer gratuitement
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Free text */}
          <motion.p 
            className="text-sm text-muted-foreground mt-4"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Gratuit pendant 7 jours.
          </motion.p>
        </motion.div>

        {/* Dashboard Preview - Rising from bottom */}
        <motion.div 
          className="relative max-w-6xl mx-auto px-4"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="relative">
            <StackedCardsLayout />
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <LandingFeatures />

      <Footer />
    </div>
  );
};

export default Index;
