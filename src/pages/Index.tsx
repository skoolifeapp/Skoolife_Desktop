import logoSkoolife from '@/assets/logo-skoolife.png';
import screenshotPlanning from '@/assets/screenshot-planning.png';
import screenshotFiches from '@/assets/screenshot-fiches.png';
import screenshotQuizz from '@/assets/screenshot-quizz.png';
import screenshotMatieres from '@/assets/screenshot-matieres.png';
import { CalendarDays, BookOpen, BrainCircuit, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Planning intelligent',
    description: 'Ton planning de révisions généré automatiquement, adapté à tes examens et ton rythme. Vue semaine ou jour.',
    screenshot: screenshotPlanning,
    color: 'from-primary/20 to-primary/5',
  },
  {
    icon: BookOpen,
    title: 'Fiches de révision IA',
    description: 'Des fiches claires et structurées, générées par l\'IA à partir de tes cours. Classées par matière, toujours accessibles.',
    screenshot: screenshotFiches,
    color: 'from-pink-500/20 to-pink-500/5',
  },
  {
    icon: BrainCircuit,
    title: 'Quizz interactifs',
    description: 'Teste tes connaissances avec des quizz générés à partir de tes fiches. Feedback instantané et explications détaillées.',
    screenshot: screenshotQuizz,
    color: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    icon: GraduationCap,
    title: 'Suivi par matière',
    description: 'Visualise ta progression, tes heures de travail et la difficulté de chaque matière. Rien ne t\'échappe.',
    screenshot: screenshotMatieres,
    color: 'from-amber-500/20 to-amber-500/5',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoSkoolife} alt="Skoolife" className="w-9 h-9 rounded-xl" />
            <span className="text-lg font-bold">Skoolife</span>
          </div>
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Fonctionnalités
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-[5%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-[5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeIn} transition={{ duration: 0.5 }}>
            <img
              src={logoSkoolife}
              alt="Skoolife mascotte"
              className="w-24 h-24 md:w-32 md:h-32 rounded-3xl shadow-lg mx-auto animate-float"
            />
          </motion.div>

          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mt-8"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4" />
            Disponible sur iOS
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold mt-6 leading-[1.1] tracking-tight"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            Révise plus smart,{' '}
            <span className="text-primary">pas plus dur.</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mt-6 max-w-xl mx-auto leading-relaxed"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            Skoolife organise tes révisions avec l'IA : planning auto, fiches, quizz. 
            Tout ce qu'il te faut pour réussir tes examens.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl hover:bg-accent transition-colors text-lg group shadow-lg shadow-primary/25"
            >
              Télécharger l'app
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16 md:mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold">
              Tout pour tes révisions.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-lg mx-auto">
              Quatre outils pensés pour les étudiants, propulsés par l'intelligence artificielle.
            </p>
          </motion.div>

          <div className="space-y-24 md:space-y-40">
            {FEATURES.map((feature, index) => {
              const isReversed = index % 2 !== 0;
              return (
                <motion.div
                  key={feature.title}
                  className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-20`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  variants={stagger}
                >
                  {/* Text */}
                  <motion.div className="flex-1 max-w-md" variants={fadeIn} transition={{ duration: 0.6 }}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground mt-4 text-base md:text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>

                  {/* Screenshot */}
                  <motion.div
                    className="flex-1 flex justify-center"
                    variants={fadeIn}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-[3rem] blur-2xl scale-90`} />
                      <img
                        src={feature.screenshot}
                        alt={feature.title}
                        className="relative w-[260px] md:w-[300px] rounded-[2.5rem] shadow-2xl border-8 border-foreground/5"
                        loading="lazy"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4">
        <motion.div
          className="max-w-2xl mx-auto text-center bg-primary rounded-3xl p-10 md:p-16 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <img src={logoSkoolife} alt="" className="w-16 h-16 rounded-2xl mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-extrabold text-primary-foreground">
              Prêt à cartonner tes exams ?
            </h2>
            <p className="text-primary-foreground/80 mt-4 text-base md:text-lg">
              Rejoins les étudiants qui révisent plus efficacement avec Skoolife.
            </p>
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:bg-white/90 transition-colors text-lg group"
            >
              Télécharger gratuitement
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={logoSkoolife} alt="" className="w-6 h-6 rounded-lg" />
            <span className="font-medium text-foreground">Skoolife</span>
          </div>
          <p>© {new Date().getFullYear()} Skoolife. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
