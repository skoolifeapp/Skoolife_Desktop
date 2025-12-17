import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useSessionFiles, SessionFile } from '@/hooks/useSessionFiles';
import { toast } from 'sonner';

interface FileUploadPopoverProps {
  targetId: string;
  targetType: 'session' | 'event';
  onFileChange?: () => void;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
].join(',');

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📈';
  if (fileType.includes('image')) return '🖼️';
  return '📎';
};

// Memoized file item component
const FileItem = memo(({ 
  file, 
  onOpen, 
  onDelete 
}: { 
  file: SessionFile; 
  onOpen: (file: SessionFile) => void; 
  onDelete: (file: SessionFile) => void;
}) => (
  <div className="flex items-center gap-2 p-2 rounded-md bg-background border hover:bg-muted/50 transition-colors">
    <span className="text-lg">{getFileIcon(file.file_type)}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate">{file.file_name}</p>
      <p className="text-[10px] text-muted-foreground">{formatFileSize(file.file_size)}</p>
    </div>
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen(file); }}
        className="p-1.5 hover:bg-muted rounded transition-colors"
        title="Ouvrir"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(file); }}
        className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive"
        title="Supprimer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
));

FileItem.displayName = 'FileItem';

export const FileUploadPopover = memo(({ targetId, targetType, onFileChange }: FileUploadPopoverProps) => {
  const [files, setFiles] = useState<SessionFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);
  
  const { uploadFile, getFilesForSession, getFilesForEvent, getFileUrl, deleteFile } = useSessionFiles();

  const loadFiles = useCallback(async () => {
    const result = targetType === 'session' 
      ? await getFilesForSession(targetId)
      : await getFilesForEvent(targetId);
    setFiles(result);
    setLoading(false);
  }, [targetId, targetType, getFilesForSession, getFilesForEvent]);

  // Load files in background without blocking render
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      setLoading(true);
      // Use requestIdleCallback or setTimeout to defer loading
      const timeoutId = setTimeout(() => {
        loadFiles();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [loadFiles]);

  // Reset when target changes
  useEffect(() => {
    loadedRef.current = false;
    setLoading(true);
    const timeoutId = setTimeout(() => {
      loadedRef.current = true;
      loadFiles();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [targetId, targetType]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);

    let hasError = false;
    for (let i = 0; i < selectedFiles.length; i++) {
      try {
        const result = await uploadFile(selectedFiles[i], targetId, targetType);
        if (!result) hasError = true;
      } catch (err) {
        console.error('Error uploading file:', err);
        hasError = true;
      }
    }

    if (hasError) {
      toast.error('Erreur lors de l\'upload d\'un ou plusieurs fichiers');
    }

    await loadFiles();
    onFileChange?.();
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadFile, targetId, targetType, loadFiles, onFileChange]);

  const handleOpenFile = useCallback(async (file: SessionFile) => {
    const url = await getFileUrl(file.file_path);
    if (url) window.open(url, '_blank');
  }, [getFileUrl]);

  const handleDeleteFile = useCallback(async (file: SessionFile) => {
    const success = await deleteFile(file);
    if (success) {
      setFiles(prev => prev.filter(f => f.id !== file.id));
      onFileChange?.();
    }
  }, [deleteFile, onFileChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {loading ? '...' : `${files.length} fichier${files.length !== 1 ? 's' : ''}`}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileSelect}
          multiple
          className="hidden"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={uploading}
          className="h-8 text-xs"
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Upload className="w-3 h-3 mr-1" />
          )}
          {uploading ? 'Upload...' : 'Ajouter des fichiers'}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          Aucun fichier attaché
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {files.map(file => (
            <FileItem
              key={file.id}
              file={file}
              onOpen={handleOpenFile}
              onDelete={handleDeleteFile}
            />
          ))}
        </div>
      )}
    </div>
  );
});

FileUploadPopover.displayName = 'FileUploadPopover';
