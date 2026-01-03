import { Highlighter, MessageSquare, Eraser, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type AnnotationTool = 'select' | 'highlight' | 'note' | 'eraser';

const HIGHLIGHT_COLORS = [
  { name: 'Jaune', value: '#FFEB3B', class: 'bg-yellow-400' },
  { name: 'Vert', value: '#4CAF50', class: 'bg-green-500' },
  { name: 'Rose', value: '#E91E63', class: 'bg-pink-500' },
  { name: 'Bleu', value: '#2196F3', class: 'bg-blue-500' },
  { name: 'Orange', value: '#FF9800', class: 'bg-orange-500' },
  { name: 'Violet', value: '#9C27B0', class: 'bg-purple-500' },
];

interface AnnotationToolbarProps {
  currentTool: AnnotationTool;
  currentColor: string;
  currentPage: number;
  totalPages: number;
  scale: number;
  onToolChange: (tool: AnnotationTool) => void;
  onColorChange: (color: string) => void;
  onPageChange: (page: number) => void;
  onZoomChange: (scale: number) => void;
  onClearAnnotations: () => void;
}

export const AnnotationToolbar = ({
  currentTool,
  currentColor,
  currentPage,
  totalPages,
  scale,
  onToolChange,
  onColorChange,
  onPageChange,
  onZoomChange,
  onClearAnnotations
}: AnnotationToolbarProps) => {
  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-card border-b">
      {/* Navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm min-w-[80px] text-center">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onZoomChange(Math.max(0.5, scale - 0.25))}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm min-w-[50px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onZoomChange(Math.min(2, scale + 0.25))}
          disabled={scale >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Tools */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'highlight' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onToolChange('highlight')}
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Surligner</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'note' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onToolChange('note')}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ajouter une note</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'eraser' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => onToolChange('eraser')}
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Effacer</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          {HIGHLIGHT_COLORS.map((color) => (
            <Tooltip key={color.value}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'w-6 h-6 rounded-full transition-all',
                    color.class,
                    currentColor === color.value 
                      ? 'ring-2 ring-offset-2 ring-foreground scale-110' 
                      : 'hover:scale-105'
                  )}
                  onClick={() => onColorChange(color.value)}
                />
              </TooltipTrigger>
              <TooltipContent>{color.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearAnnotations}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Effacer toutes les annotations</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
