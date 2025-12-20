import React from 'react';
import { cn } from '@/lib/utils';

interface StackedCardProps {
  children: React.ReactNode;
  className?: string;
  layers?: number;
  offset?: number;
}

export const StackedCard = ({ 
  children, 
  className,
  layers = 2,
  offset = 8
}: StackedCardProps) => {
  return (
    <div className="relative group">
      {/* Background layers */}
      {Array.from({ length: layers }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 rounded-2xl bg-card border border-border/50 transition-all duration-300",
            "group-hover:translate-x-1 group-hover:translate-y-1"
          )}
          style={{
            transform: `translate(${(i + 1) * offset}px, ${(i + 1) * offset}px)`,
            opacity: 1 - (i + 1) * 0.15,
            zIndex: -i - 1,
          }}
        />
      ))}
      
      {/* Main card */}
      <div 
        className={cn(
          "relative bg-card rounded-2xl border border-border/50 transition-all duration-300",
          "shadow-lg group-hover:shadow-xl group-hover:-translate-x-0.5 group-hover:-translate-y-0.5",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default StackedCard;
