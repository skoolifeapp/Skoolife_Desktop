import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Predefined color palette with HSL values
const COLOR_PALETTE = [
  // Blues
  { hex: '#3B82F6', label: 'Bleu' },
  { hex: '#0EA5E9', label: 'Bleu ciel' },
  { hex: '#06B6D4', label: 'Cyan' },
  // Greens
  { hex: '#22C55E', label: 'Vert' },
  { hex: '#10B981', label: 'Émeraude' },
  { hex: '#14B8A6', label: 'Teal' },
  // Warm colors
  { hex: '#F59E0B', label: 'Ambre' },
  { hex: '#F97316', label: 'Orange' },
  { hex: '#EF4444', label: 'Rouge' },
  // Purples/Pinks
  { hex: '#A855F7', label: 'Violet' },
  { hex: '#8B5CF6', label: 'Indigo' },
  { hex: '#EC4899', label: 'Rose' },
  // Neutrals
  { hex: '#64748B', label: 'Gris' },
  { hex: '#78716C', label: 'Pierre' },
  { hex: '#71717A', label: 'Zinc' },
];

// Default colors for each event type
export const DEFAULT_EVENT_COLORS: Record<string, string> = {
  cours: '#3B82F6',      // Blue
  travail: '#F59E0B',    // Amber
  perso: '#A855F7',      // Purple
  sport: '#22C55E',      // Green
  revision_libre: '#14B8A6', // Teal
  visio: '#8B5CF6',      // Violet
  autre: '#64748B',      // Slate
};

interface EventColorPickerProps {
  eventType: string;
  label: string;
  currentColor: string;
  onChange: (color: string) => void;
  onReset: () => void;
}

export const EventColorPicker = ({
  eventType,
  label,
  currentColor,
  onChange,
  onReset,
}: EventColorPickerProps) => {
  const [open, setOpen] = useState(false);
  const isCustom = currentColor !== DEFAULT_EVENT_COLORS[eventType];

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-6 rounded-full border border-border shadow-sm"
          style={{ backgroundColor: currentColor }}
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {isCustom && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 w-8 p-0"
            title="Réinitialiser la couleur par défaut"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2"
            >
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: currentColor }}
              />
              Modifier
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color.hex}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                    currentColor === color.hex
                      ? "border-foreground"
                      : "border-transparent hover:border-muted-foreground/50"
                  )}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => {
                    onChange(color.hex);
                    setOpen(false);
                  }}
                  title={color.label}
                >
                  {currentColor === color.hex && (
                    <Check className="h-4 w-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default EventColorPicker;
