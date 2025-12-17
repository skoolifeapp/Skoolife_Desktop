import { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, FileText, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useSessionFiles, SessionFile } from '@/hooks/useSessionFiles';
import { cn } from '@/lib/utils';

interface FileUploadPopoverProps {
  targetId: string;
  targetType: 'session' | 'event';
  onFileChange?: () => void;
  compact?: boolean;
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📈';
  if (fileType.includes('image')) return '🖼️';
  return '📎';
}

export function FileUploadPopover({ targetId, targetType, onFileChange, compact = false }: FileUploadPopoverProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<SessionFile[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploading, uploadFile, getFilesForSession, getFilesForEvent, getFileUrl, deleteFile } = useSessionFiles();

  const loadFiles = async () => {
    setLoading(true);
    const result = targetType === 'session' 
      ? await getFilesForSession(targetId)
      : await getFilesForEvent(targetId);
    setFiles(result);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open, targetId, targetType]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, targetId, targetType);
    if (result) {
      setFiles(prev => [result, ...prev]);
      onFileChange?.();
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenFile = async (file: SessionFile) => {
    const url = await getFileUrl(file.file_path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleDeleteFile = async (file: SessionFile) => {
    const success = await deleteFile(file);
    if (success) {
      setFiles(prev => prev.filter(f => f.id !== file.id));
      onFileChange?.();
    }
  };

  const hasFiles = files.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className={cn(
            "flex items-center justify-center rounded transition-colors",
            compact 
              ? "w-4 h-4 hover:bg-white/20" 
              : "w-6 h-6 hover:bg-gray-200 dark:hover:bg-gray-700",
            hasFiles && "text-primary"
          )}
          title="Fichiers attachés"
        >
          <Paperclip className={compact ? "w-3 h-3" : "w-4 h-4"} />
          {hasFiles && !compact && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary text-[8px] text-primary-foreground rounded-full flex items-center justify-center">
              {files.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-3" 
        onClick={(e) => e.stopPropagation()}
        align="start"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Fichiers</h4>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-7 text-xs"
            >
              {uploading ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Upload className="w-3 h-3 mr-1" />
              )}
              Ajouter
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Aucun fichier attaché
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map(file => (
                <div 
                  key={file.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <span className="text-lg">{getFileIcon(file.file_type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{file.file_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(file.file_size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenFile(file)}
                      className="p-1 hover:bg-background rounded"
                      title="Ouvrir"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className="p-1 hover:bg-background rounded text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
