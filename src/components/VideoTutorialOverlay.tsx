import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Play, GraduationCap } from 'lucide-react';

interface VideoTutorialOverlayProps {
  onClose: () => void;
}

export const VideoTutorialOverlay = ({ onClose }: VideoTutorialOverlayProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-4xl mx-4"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute -top-12 right-0 text-white hover:bg-white/10 z-10"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Card container */}
          <div className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Bienvenue sur Skoolife ! 🎉
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Découvre comment optimiser tes révisions en 2 minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Video container */}
            <div className="relative aspect-video bg-muted">
              {!isPlaying ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  {/* Placeholder illustration */}
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <Play className="w-12 h-12 text-primary ml-1" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Vidéo de présentation à venir
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsPlaying(true)}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Lancer la vidéo
                  </Button>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  {/* Placeholder for actual video - replace with YouTube/Vimeo embed or video element */}
                  <div className="text-center text-white">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                      <Play className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium mb-2">Vidéo en cours de préparation</p>
                    <p className="text-sm text-white/60">
                      La vidéo de présentation sera bientôt disponible !
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Tu peux revoir cette vidéo depuis les paramètres
              </p>
              <Button onClick={onClose} size="lg" className="gap-2">
                Passer et commencer
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
