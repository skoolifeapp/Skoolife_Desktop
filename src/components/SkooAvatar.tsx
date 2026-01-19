import { motion } from 'framer-motion';
import skooAvatar from '@/assets/skoo-avatar.png';

interface SkooAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  speaking?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

export function SkooAvatar({ 
  size = 'md', 
  animate = true, 
  speaking = false,
  className = '',
  onClick 
}: SkooAvatarProps) {
  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow effect when speaking */}
      {speaking && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      
      {/* Avatar image */}
      <motion.img
        src={skooAvatar}
        alt="Skoo - Ton coach d'études"
        className="w-full h-full rounded-full object-cover shadow-lg ring-2 ring-primary/20"
        animate={speaking ? {
          y: [0, -2, 0],
        } : undefined}
        transition={speaking ? {
          duration: 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        } : undefined}
      />
      
      {/* Speech indicator */}
      {speaking && (
        <motion.div
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}
