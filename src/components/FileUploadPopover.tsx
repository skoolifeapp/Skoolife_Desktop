import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Trash2, ExternalLink, Loader2, X } from 'lucide-react';
import { useSessionFiles, SessionFile } from '@/hooks/useSessionFiles';

export interface FileUploadPopoverRef {
  uploadPendingFiles: () => Promise<boolean>;
  hasPendingFiles: () => boolean;
}

interface FileUploadPopoverProps {
  targetId: string;
  targetType: 'session' | 'event';
  onFileChange?: () => void;
}

interface PendingFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
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

export const FileUploadPopover = forwardRef<FileUploadPopoverRef, FileUploadPopoverProps>(
  ({ targetId, targetType, onFileChange }, ref) => {
    const [existingFiles, setExistingFiles] = useState<SessionFile[]>([]);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { uploadFile, getFilesForSession, getFilesForEvent, getFileUrl, deleteFile } = useSessionFiles();

    const loadFiles = async () => {
      setLoading(true);
      const result = targetType === 'session' 
        ? await getFilesForSession(targetId)
        : await getFilesForEvent(targetId);
      setExistingFiles(result);
      setLoading(false);
    };

    useEffect(() => {
      loadFiles();
      setPendingFiles([]); // Reset pending files when target changes
    }, [targetId, targetType]);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      uploadPendingFiles: async () => {
        if (pendingFiles.length === 0) return true;
        
        setUploading(true);
        try {
          for (const pending of pendingFiles) {
            const result = await uploadFile(pending.file, targetId, targetType);
            if (!result) {
              setUploading(false);
              return false;
            }
          }
          setPendingFiles([]);
          onFileChange?.();
          return true;
        } catch (err) {
          console.error('Error uploading files:', err);
          return false;
        } finally {
          setUploading(false);
        }
      },
      hasPendingFiles: () => pendingFiles.length > 0
    }));

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Add to pending files (not uploaded yet)
      const pendingFile: PendingFile = {
        id: `pending-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type
      };
      
      setPendingFiles(prev => [...prev, pendingFile]);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleRemovePending = (id: string) => {
      setPendingFiles(prev => prev.filter(f => f.id !== id));
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
        setExistingFiles(prev => prev.filter(f => f.id !== file.id));
        onFileChange?.();
      }
    };

    const totalFiles = existingFiles.length + pendingFiles.length;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {totalFiles} fichier{totalFiles !== 1 ? 's' : ''}
            {pendingFiles.length > 0 && (
              <span className="text-primary ml-1">
                ({pendingFiles.length} en attente)
              </span>
            )}
          </span>
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
            className="h-8 text-xs"
          >
            <Upload className="w-3 h-3 mr-1" />
            Ajouter un fichier
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : totalFiles === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            Aucun fichier attaché
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Pending files (not yet uploaded) */}
            {pendingFiles.map(file => (
              <div 
                key={file.id}
                className="flex items-center gap-2 p-2 rounded-md bg-primary/10 border border-primary/30 group"
              >
                <span className="text-lg">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-[10px] text-primary">
                    En attente • {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemovePending(file.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive"
                  title="Retirer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Existing files (already uploaded) */}
            {existingFiles.map(file => (
              <div 
                key={file.id}
                className="flex items-center gap-2 p-2 rounded-md bg-background border hover:bg-muted/50 transition-colors group"
              >
                <span className="text-lg">{getFileIcon(file.file_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{file.file_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(file.file_size)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenFile(file)}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                    title="Ouvrir"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file)}
                    className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

FileUploadPopover.displayName = 'FileUploadPopover';
