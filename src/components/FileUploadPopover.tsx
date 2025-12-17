import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, ExternalLink, Loader2, Link, Plus } from 'lucide-react';
import { useSessionFiles, SessionFile } from '@/hooks/useSessionFiles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadPopoverProps {
  targetId: string;
  targetType: 'session' | 'event';
  subjectName?: string; // For subject-level resource sharing
  onFileChange?: () => void;
}

interface SessionLink {
  id: string;
  url: string;
  title: string | null;
  created_at: string;
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

const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.length > 20 ? domain.slice(0, 20) + '...' : domain;
  } catch {
    return url.slice(0, 20) + '...';
  }
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
  <div className="flex items-center gap-2 p-2 rounded-md bg-background border hover:bg-muted/50 transition-colors min-w-0">
    <span className="text-lg flex-shrink-0">{getFileIcon(file.file_type)}</span>
    <div className="flex-1 min-w-0 overflow-hidden">
      <p className="text-xs font-medium truncate max-w-[180px]">{file.file_name}</p>
      <p className="text-[10px] text-muted-foreground">{formatFileSize(file.file_size)}</p>
    </div>
    <div className="flex items-center gap-1 flex-shrink-0">
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

// Memoized link item component
const LinkItem = memo(({ 
  link, 
  onDelete 
}: { 
  link: SessionLink; 
  onDelete: (link: SessionLink) => void;
}) => (
  <div className="flex items-center gap-2 p-2 rounded-md bg-background border hover:bg-muted/50 transition-colors min-w-0">
    <Link className="w-4 h-4 flex-shrink-0 text-blue-500" />
    <div className="flex-1 min-w-0 overflow-hidden">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 hover:underline truncate block max-w-[180px]"
        onClick={(e) => e.stopPropagation()}
      >
        {link.title || extractDomain(link.url)}
      </a>
    </div>
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(link); }}
        className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive"
        title="Supprimer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
));

LinkItem.displayName = 'LinkItem';

export const FileUploadPopover = memo(({ targetId, targetType, subjectName, onFileChange }: FileUploadPopoverProps) => {
  const [files, setFiles] = useState<SessionFile[]>([]);
  const [links, setLinks] = useState<SessionLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [addingLink, setAddingLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);
  
  const { uploadFile, getFilesForSession, getFilesForEvent, getFilesForSubject, getFileUrl, deleteFile } = useSessionFiles();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // If subject name is provided, load all files for that subject (shared across events)
    let fileResult: SessionFile[] = [];
    if (subjectName) {
      fileResult = await getFilesForSubject(subjectName);
    } else if (targetType === 'session') {
      fileResult = await getFilesForSession(targetId);
    } else {
      fileResult = await getFilesForEvent(targetId);
    }
    setFiles(fileResult);

    // Load links - either by subject or by specific target
    let linkQuery = supabase
      .from('session_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (subjectName) {
      linkQuery = linkQuery.eq('subject_name', subjectName);
    } else {
      const columnName = targetType === 'session' ? 'session_id' : 'event_id';
      linkQuery = linkQuery.eq(columnName, targetId);
    }

    const { data: linkData } = await linkQuery;
    
    setLinks((linkData as SessionLink[]) || []);
    setLoading(false);
  }, [targetId, targetType, subjectName, getFilesForSession, getFilesForEvent, getFilesForSubject]);

  // Load data in background without blocking render
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      setLoading(true);
      const timeoutId = setTimeout(() => {
        loadData();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [loadData]);

  // Reset when target changes
  useEffect(() => {
    loadedRef.current = false;
    setLoading(true);
    const timeoutId = setTimeout(() => {
      loadedRef.current = true;
      loadData();
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
        // Pass subject name to link file at subject level
        const result = await uploadFile(selectedFiles[i], targetId, targetType, subjectName);
        if (!result) hasError = true;
      } catch (err) {
        console.error('Error uploading file:', err);
        hasError = true;
      }
    }

    if (hasError) {
      toast.error("Erreur lors de l'upload d'un ou plusieurs fichiers");
    }

    await loadData();
    onFileChange?.();
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadFile, targetId, targetType, subjectName, loadData, onFileChange]);

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

  const handleAddLink = useCallback(async () => {
    if (!newLinkUrl.trim()) return;
    
    // Validate URL
    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    try {
      new URL(url);
    } catch {
      toast.error('URL invalide');
      return;
    }

    setAddingLink(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Non connecté');
      setAddingLink(false);
      return;
    }

    const columnName = targetType === 'session' ? 'session_id' : 'event_id';
    
    const linkRecord: any = {
      user_id: user.id,
      url,
      title: newLinkTitle.trim() || null,
      [columnName]: targetId,
      subject_name: subjectName || null // Link at subject level for sharing
    };

    const { data, error } = await supabase
      .from('session_links')
      .insert(linkRecord)
      .select()
      .single();

    if (error) {
      console.error('Error adding link:', error);
      toast.error("Erreur lors de l'ajout du lien");
    } else if (data) {
      setLinks(prev => [data as SessionLink, ...prev]);
      setNewLinkUrl('');
      setNewLinkTitle('');
      onFileChange?.();
    }
    
    setAddingLink(false);
  }, [newLinkUrl, newLinkTitle, targetId, targetType, subjectName, onFileChange]);

  const handleDeleteLink = useCallback(async (link: SessionLink) => {
    const { error } = await supabase
      .from('session_links')
      .delete()
      .eq('id', link.id);

    if (error) {
      console.error('Error deleting link:', error);
      toast.error('Erreur lors de la suppression du lien');
    } else {
      setLinks(prev => prev.filter(l => l.id !== link.id));
      onFileChange?.();
    }
  }, [onFileChange]);

  return (
    <div className="space-y-4">
      {/* Files section */}
      <div className="space-y-2">
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
            {uploading ? 'Upload...' : 'Ajouter'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : files.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-1">
            Aucun fichier
          </p>
        ) : (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
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

      {/* Links section */}
      <div className="space-y-2 border-t pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Link className="w-3.5 h-3.5" />
            {links.length} lien{links.length !== 1 ? 's' : ''} URL
          </span>
        </div>

        {/* Add link input */}
        <div className="space-y-1.5">
          <Input
            type="text"
            placeholder="Titre (optionnel)"
            value={newLinkTitle}
            onChange={(e) => setNewLinkTitle(e.target.value)}
            className="h-7 text-xs"
          />
          <div className="flex items-center gap-2">
            <Input
              type="url"
              placeholder="https://..."
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
              className="h-7 text-xs flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddLink();
              }}
              disabled={addingLink || !newLinkUrl.trim()}
              className="h-7 px-2"
            >
              {addingLink ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {links.length > 0 && (
          <div className="space-y-1.5 max-h-24 overflow-y-auto">
            {links.map(link => (
              <LinkItem
                key={link.id}
                link={link}
                onDelete={handleDeleteLink}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

FileUploadPopover.displayName = 'FileUploadPopover';
