import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { AnnotationToolbar, AnnotationTool } from './AnnotationToolbar';
import { AnnotationLayer } from './AnnotationLayer';
import { useFileAnnotations, Annotation } from '@/hooks/useFileAnnotations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFAnnotationViewerProps {
  fileId: string;
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export const PDFAnnotationViewer = ({ fileId, fileUrl, fileName, onClose }: PDFAnnotationViewerProps) => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [currentTool, setCurrentTool] = useState<AnnotationTool>('select');
  const [currentColor, setCurrentColor] = useState('#FFEB3B');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const { getAnnotations, createAnnotation, updateAnnotation, deleteAnnotation, deleteAllAnnotations } = useFileAnnotations();

  // Load annotations
  useEffect(() => {
    const loadAnnotations = async () => {
      const data = await getAnnotations(fileId);
      setAnnotations(data);
    };
    loadAnnotations();
  }, [fileId, getAnnotations]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handlePageLoadSuccess = (page: { width: number; height: number }) => {
    setPageSize({ width: page.width, height: page.height });
  };

  const handleCreateHighlight = useCallback(async (position: { x: number; y: number; width: number; height: number }) => {
    const newAnnotation = await createAnnotation({
      file_id: fileId,
      page_number: currentPage,
      annotation_type: 'highlight',
      color: currentColor,
      position
    });
    if (newAnnotation) {
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  }, [fileId, currentPage, currentColor, createAnnotation]);

  const handleCreateNote = useCallback(async (position: { x: number; y: number }, content: string) => {
    const newAnnotation = await createAnnotation({
      file_id: fileId,
      page_number: currentPage,
      annotation_type: 'note',
      color: currentColor,
      content,
      position
    });
    if (newAnnotation) {
      setAnnotations(prev => [...prev, newAnnotation]);
      toast.success('Note ajoutée');
    }
  }, [fileId, currentPage, currentColor, createAnnotation]);

  const handleDeleteAnnotation = useCallback(async (annotationId: string) => {
    const success = await deleteAnnotation(annotationId);
    if (success) {
      setAnnotations(prev => prev.filter(a => a.id !== annotationId));
    }
  }, [deleteAnnotation]);

  const handleUpdateNote = useCallback(async (annotationId: string, content: string) => {
    const success = await updateAnnotation(annotationId, { content });
    if (success) {
      setAnnotations(prev => prev.map(a => 
        a.id === annotationId ? { ...a, content } : a
      ));
      toast.success('Note modifiée');
    }
  }, [updateAnnotation]);

  const handleClearAnnotations = useCallback(async () => {
    const success = await deleteAllAnnotations(fileId);
    if (success) {
      setAnnotations([]);
      toast.success('Toutes les annotations ont été supprimées');
    }
    setShowClearDialog(false);
  }, [fileId, deleteAllAnnotations]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(p => p - 1);
      } else if (e.key === 'ArrowRight' && currentPage < numPages) {
        setCurrentPage(p => p + 1);
      } else if (e.key === 'Escape') {
        setCurrentTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <h2 className="font-semibold truncate max-w-[300px]">{fileName}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Toolbar */}
      <AnnotationToolbar
        currentTool={currentTool}
        currentColor={currentColor}
        currentPage={currentPage}
        totalPages={numPages}
        scale={scale}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onPageChange={setCurrentPage}
        onZoomChange={setScale}
        onClearAnnotations={() => setShowClearDialog(true)}
      />

      {/* PDF Viewer */}
      <ScrollArea className="flex-1">
        <div className="flex justify-center p-4 min-h-full">
          {loading && (
            <Skeleton className="w-[600px] h-[800px]" />
          )}
          <Document
            file={fileUrl}
            onLoadSuccess={handleDocumentLoadSuccess}
            loading={null}
            error={
              <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                Erreur lors du chargement du PDF
              </div>
            }
          >
            <div className="relative shadow-lg">
              <Page
                pageNumber={currentPage}
                scale={scale}
                onLoadSuccess={handlePageLoadSuccess}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
              {pageSize.width > 0 && (
                <AnnotationLayer
                  pageNumber={currentPage}
                  width={pageSize.width}
                  height={pageSize.height}
                  scale={scale}
                  annotations={annotations}
                  currentTool={currentTool}
                  currentColor={currentColor}
                  onCreateHighlight={handleCreateHighlight}
                  onCreateNote={handleCreateNote}
                  onDeleteAnnotation={handleDeleteAnnotation}
                  onUpdateNote={handleUpdateNote}
                />
              )}
            </div>
          </Document>
        </div>
      </ScrollArea>

      {/* Help text */}
      <div className="p-2 border-t bg-muted/50 text-center text-xs text-muted-foreground">
        ← → pour naviguer • Échap pour désélectionner l'outil • Cliquez et glissez pour surligner
      </div>

      {/* Clear confirmation dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Effacer toutes les annotations ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes vos annotations sur ce document seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAnnotations} className="bg-destructive text-destructive-foreground">
              Effacer tout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
