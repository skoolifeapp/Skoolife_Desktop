import { useState, useRef, useCallback, useEffect } from 'react';
import { Annotation } from '@/hooks/useFileAnnotations';
import { AnnotationTool } from './AnnotationToolbar';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';

interface AnnotationLayerProps {
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
  annotations: Annotation[];
  currentTool: AnnotationTool;
  currentColor: string;
  onCreateHighlight: (position: { x: number; y: number; width: number; height: number }) => void;
  onCreateNote: (position: { x: number; y: number }, content: string) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  onUpdateNote: (annotationId: string, content: string) => void;
}

export const AnnotationLayer = ({
  pageNumber,
  width,
  height,
  scale,
  annotations,
  currentTool,
  currentColor,
  onCreateHighlight,
  onCreateNote,
  onDeleteAnnotation,
  onUpdateNote
}: AnnotationLayerProps) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [noteInput, setNoteInput] = useState<{ x: number; y: number; content: string } | null>(null);
  const [editingNote, setEditingNote] = useState<{ id: string; content: string } | null>(null);

  const pageAnnotations = annotations.filter(a => a.page_number === pageNumber);

  const getRelativePosition = useCallback((e: React.MouseEvent) => {
    if (!layerRef.current) return { x: 0, y: 0 };
    const rect = layerRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };
  }, [scale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (currentTool === 'select') return;
    if (noteInput || editingNote) return;

    const pos = getRelativePosition(e);

    if (currentTool === 'highlight') {
      setIsDrawing(true);
      setStartPos(pos);
      setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    } else if (currentTool === 'note') {
      setNoteInput({ x: pos.x, y: pos.y, content: '' });
    }
  }, [currentTool, getRelativePosition, noteInput, editingNote]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !startPos || currentTool !== 'highlight') return;

    const pos = getRelativePosition(e);
    const x = Math.min(startPos.x, pos.x);
    const y = Math.min(startPos.y, pos.y);
    const rectWidth = Math.abs(pos.x - startPos.x);
    const rectHeight = Math.abs(pos.y - startPos.y);

    setCurrentRect({ x, y, width: rectWidth, height: rectHeight });
  }, [isDrawing, startPos, currentTool, getRelativePosition]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentRect && currentRect.width > 5 && currentRect.height > 5) {
      onCreateHighlight(currentRect);
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentRect(null);
  }, [isDrawing, currentRect, onCreateHighlight]);

  const handleAnnotationClick = useCallback((e: React.MouseEvent, annotation: Annotation) => {
    e.stopPropagation();
    
    if (currentTool === 'eraser') {
      onDeleteAnnotation(annotation.id);
    } else if (annotation.annotation_type === 'note' && currentTool === 'select') {
      setEditingNote({ id: annotation.id, content: annotation.content || '' });
    }
  }, [currentTool, onDeleteAnnotation]);

  const handleSaveNote = useCallback(() => {
    if (noteInput && noteInput.content.trim()) {
      onCreateNote({ x: noteInput.x, y: noteInput.y }, noteInput.content);
    }
    setNoteInput(null);
  }, [noteInput, onCreateNote]);

  const handleUpdateNote = useCallback(() => {
    if (editingNote && editingNote.content.trim()) {
      onUpdateNote(editingNote.id, editingNote.content);
    }
    setEditingNote(null);
  }, [editingNote, onUpdateNote]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNoteInput(null);
        setEditingNote(null);
        setIsDrawing(false);
        setCurrentRect(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      ref={layerRef}
      className={cn(
        'absolute inset-0',
        currentTool === 'highlight' && 'cursor-crosshair',
        currentTool === 'note' && 'cursor-cell',
        currentTool === 'eraser' && 'cursor-pointer'
      )}
      style={{ width: width * scale, height: height * scale }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Existing annotations */}
      {pageAnnotations.map((annotation) => {
        if (annotation.annotation_type === 'highlight') {
          return (
            <div
              key={annotation.id}
              className={cn(
                'absolute rounded-sm transition-opacity',
                currentTool === 'eraser' && 'hover:opacity-50 cursor-pointer'
              )}
              style={{
                left: annotation.position.x * scale,
                top: annotation.position.y * scale,
                width: (annotation.position.width || 0) * scale,
                height: (annotation.position.height || 0) * scale,
                backgroundColor: annotation.color,
                opacity: 0.35,
                mixBlendMode: 'multiply'
              }}
              onClick={(e) => handleAnnotationClick(e, annotation)}
            />
          );
        }

        if (annotation.annotation_type === 'note') {
          const isEditing = editingNote?.id === annotation.id;
          
          return (
            <div
              key={annotation.id}
              className={cn(
                'absolute group',
                currentTool === 'eraser' && 'cursor-pointer'
              )}
              style={{
                left: annotation.position.x * scale,
                top: annotation.position.y * scale
              }}
              onClick={(e) => handleAnnotationClick(e, annotation)}
            >
              {isEditing ? (
                <div className="flex flex-col gap-1 bg-card p-2 rounded-lg shadow-lg border min-w-[200px]">
                  <Textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    className="min-h-[60px] text-sm"
                    autoFocus
                  />
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingNote(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                    <Button size="sm" onClick={handleUpdateNote}>
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: annotation.color }}
                  title={annotation.content || ''}
                >
                  📝
                </div>
              )}
              
              {/* Note preview on hover */}
              {!isEditing && annotation.content && (
                <div className="absolute left-8 top-0 hidden group-hover:block bg-card p-2 rounded-lg shadow-lg border max-w-[200px] text-sm z-10">
                  {annotation.content}
                </div>
              )}
            </div>
          );
        }

        return null;
      })}

      {/* Current drawing highlight */}
      {currentRect && (
        <div
          className="absolute rounded-sm pointer-events-none"
          style={{
            left: currentRect.x * scale,
            top: currentRect.y * scale,
            width: currentRect.width * scale,
            height: currentRect.height * scale,
            backgroundColor: currentColor,
            opacity: 0.35,
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* Note input */}
      {noteInput && (
        <div
          className="absolute bg-card p-2 rounded-lg shadow-lg border min-w-[200px] z-20"
          style={{
            left: noteInput.x * scale,
            top: noteInput.y * scale
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Textarea
            value={noteInput.content}
            onChange={(e) => setNoteInput({ ...noteInput, content: e.target.value })}
            placeholder="Écrivez votre note..."
            className="min-h-[60px] text-sm mb-2"
            autoFocus
          />
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => setNoteInput(null)}>
              <X className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={handleSaveNote} disabled={!noteInput.content.trim()}>
              <Check className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
