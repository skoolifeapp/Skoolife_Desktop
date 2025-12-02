import { Calendar, BookOpen } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface GridClickPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number };
  onAddEvent: () => void;
  onAddSession: () => void;
}

const GridClickPopover = ({ 
  open, 
  onOpenChange, 
  position, 
  onAddEvent, 
  onAddSession 
}: GridClickPopoverProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div 
          className="fixed w-0 h-0"
          style={{ 
            left: position.x, 
            top: position.y,
            pointerEvents: 'none'
          }}
        />
      </PopoverTrigger>
      <PopoverContent 
        className="w-52 p-2" 
        align="start"
        side="right"
        sideOffset={5}
      >
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
            Créer sur ce créneau
          </p>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9"
            onClick={() => {
              onAddSession();
              onOpenChange(false);
            }}
          >
            <BookOpen className="w-4 h-4 text-primary" />
            Session de révision
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9"
            onClick={() => {
              onAddEvent();
              onOpenChange(false);
            }}
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            Évènement
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default GridClickPopover;
