import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkooAvatar } from './SkooAvatar';

const greetings = [
  "Salut ! Je suis Skoo, ton coach d'études ! 👋",
  "Prêt à booster tes révisions ? 🚀",
  "Ensemble, on va cartonner tes exams ! 💪",
  "Je suis là pour t'aider à réussir ! ✨",
];

export function SkooLanding() {
  const [currentGreeting, setCurrentGreeting] = useState(0);
  const [isWaving, setIsWaving] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Wave animation on mount
    const timeout = setTimeout(() => setIsWaving(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-40 flex items-end gap-4"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 100 }}
    >
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGreeting}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className="relative bg-card border border-border rounded-2xl px-4 py-3 shadow-xl max-w-[240px]"
        >
          <p className="text-sm text-foreground font-medium">
            {greetings[currentGreeting]}
          </p>
          {/* Bubble tail */}
          <div className="absolute -right-2 bottom-4 w-4 h-4 bg-card border-r border-b border-border transform rotate-[-45deg]" />
        </motion.div>
      </AnimatePresence>

      {/* Skoo avatar with wave animation */}
      <motion.div
        animate={isWaving ? {
          rotate: [0, 14, -8, 14, -4, 10, 0],
          transition: { duration: 1.5, ease: 'easeInOut' }
        } : {}}
        className="origin-bottom"
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <SkooAvatar 
            size="xl" 
            animate={false}
            className="shadow-2xl ring-4 ring-primary/20"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
