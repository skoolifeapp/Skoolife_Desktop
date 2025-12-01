import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  shape: 'circle' | 'square' | 'triangle';
  duration: number;
  delay: number;
  opacity: number;
}

const HeroParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const shapes: Particle['shape'][] = ['circle', 'square', 'triangle'];
    const generatedParticles: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    setParticles(generatedParticles);
  }, []);

  const renderShape = (particle: Particle) => {
    const baseClasses = "absolute pointer-events-none";
    const style = {
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      width: particle.size,
      height: particle.size,
      opacity: particle.opacity,
      animationDuration: `${particle.duration}s`,
      animationDelay: `${particle.delay}s`,
    };

    switch (particle.shape) {
      case 'circle':
        return (
          <div
            key={particle.id}
            className={`${baseClasses} rounded-full bg-primary/20 animate-particle-float`}
            style={style}
          />
        );
      case 'square':
        return (
          <div
            key={particle.id}
            className={`${baseClasses} rounded-lg bg-accent/15 animate-particle-spin`}
            style={{
              ...style,
              transform: `rotate(${Math.random() * 45}deg)`,
            }}
          />
        );
      case 'triangle':
        return (
          <div
            key={particle.id}
            className={`${baseClasses} animate-particle-float`}
            style={{
              ...style,
              width: 0,
              height: 0,
              borderLeft: `${particle.size / 2}px solid transparent`,
              borderRight: `${particle.size / 2}px solid transparent`,
              borderBottom: `${particle.size}px solid hsl(var(--skoo-orange) / 0.15)`,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(renderShape)}
      
      {/* Large decorative blurs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
    </div>
  );
};

export default HeroParticles;
