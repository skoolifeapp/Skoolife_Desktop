import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStudyFiles, StudyFile } from '@/hooks/useStudyFiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Upload,
  Search,
  FolderOpen,
  MoreHorizontal,
  Trash2,
  Edit2,
  Download,
  ExternalLink,
  FolderPlus,
  Crown,
  Lock,
  ArrowUpDown,
  Folder,
  X,
  File,
  Check,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Presentation,
  ChevronRight,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// File type icon mapping
const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();
  if (['pdf'].includes(type)) return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' };
  if (['doc', 'docx'].includes(type)) return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' };
  if (['xls', 'xlsx', 'csv'].includes(type)) return { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' };
  if (['ppt', 'pptx', 'key'].includes(type)) return { icon: Presentation, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' };
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'heic'].includes(type)) return { icon: FileImage, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' };
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(type)) return { icon: FileVideo, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30' };
  if (['mp3', 'wav', 'aac', 'm4a', 'ogg'].includes(type)) return { icon: FileAudio, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' };
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) return { icon: FileArchive, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' };
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(type)) return { icon: FileCode, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/30' };
  return { icon: File, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/30' };
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const StudyFilesPaywall = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Mes fiches</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Disponible uniquement avec l'abonnement Major.
      </p>
      <Button onClick={() => navigate('/subscription')} className="gap-2">
        <Crown className="w-4 h-4" />
        Passer à Major
      </Button>
    </div>
  );
};

// iCloud-style file item with drag support and multi-select
const FileItem = ({
  file,
  onOpen,
  onDownload,
  onRename,
  onMove,
  onDelete,
  folders,
  onDragStart,
  onDragEnd,
  isSelected,
  onSelect,
  selectionMode
}: {
  file: StudyFile;
  onOpen: () => void;
  onDownload: () => void;
  onRename: () => void;
  onMove: (folder: string | null) => void;
  onDelete: () => void;
  folders: string[];
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isSelected: boolean;
  onSelect: () => void;
  selectionMode: boolean;
}) => {
  const { icon: FileIcon, color, bg } = getFileIcon(file.file_type);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'file', fileId: file.id }));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.();
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div 
      className={cn(
        "group relative flex flex-col items-center p-3 rounded-xl transition-colors cursor-pointer",
        isSelected ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted/50"
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Checkbox - visible on hover or in selection mode */}
      <div 
        className={cn(
          "absolute top-1.5 left-1.5 z-10 transition-opacity",
          selectionMode || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={handleCheckboxClick}
      >
        <div 
          className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer",
            isSelected 
              ? "bg-primary border-primary" 
              : "bg-background/80 border-muted-foreground/40 hover:border-primary"
          )}
        >
          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>

      {/* Icon */}
      <div 
        className={cn("w-16 h-16 rounded-xl flex items-center justify-center mb-2", bg)}
        onClick={onOpen}
      >
        <FileIcon className={cn("w-8 h-8", color)} />
      </div>
      
      {/* Filename */}
      <p 
        className="text-xs text-center font-medium leading-tight line-clamp-2 w-full px-1"
        title={file.filename}
        onClick={onOpen}
      >
        {file.filename}
      </p>
      
      {/* Size & Date */}
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {formatFileSize(file.file_size)}
      </p>

      {/* Actions dropdown - hidden when in selection mode */}
      {!selectionMode && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onOpen}>
              <ExternalLink className="w-3.5 h-3.5 mr-2" />
              <span className="text-xs">Ouvrir</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload}>
              <Download className="w-3.5 h-3.5 mr-2" />
              <span className="text-xs">Télécharger</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRename}>
              <Edit2 className="w-3.5 h-3.5 mr-2" />
              <span className="text-xs">Renommer</span>
            </DropdownMenuItem>
            {folders.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem>
                    <FolderOpen className="w-3.5 h-3.5 mr-2" />
                    <span className="text-xs">Déplacer vers...</span>
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="left">
                  {file.folder_name && (
                    <DropdownMenuItem onClick={() => onMove(null)}>
                      <X className="w-3.5 h-3.5 mr-2" />
                      <span className="text-xs">Retirer du dossier</span>
                    </DropdownMenuItem>
                  )}
                  {folders.filter(f => f !== file.folder_name).map(folder => (
                    <DropdownMenuItem key={folder} onClick={() => onMove(folder)}>
                      <Folder className="w-3.5 h-3.5 mr-2" />
                      <span className="text-xs">{folder}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              <span className="text-xs">Supprimer</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

// iCloud-style folder item with drop zone and actions
const FolderItem = ({
  name,
  fileCount,
  onClick,
  onRename,
  onDelete,
  onFileDrop,
  isDraggingFile
}: {
  name: string;
  fileCount: number;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
  onFileDrop: (folderName: string) => void;
  isDraggingFile: boolean;
}) => {
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDraggingFile) {
      e.dataTransfer.dropEffect = 'move';
      setIsDropTarget(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'file') {
        onFileDrop(name);
      }
    } catch {
      // Not a file drag
    }
  };

  return (
    <div 
      className={cn(
        "group relative flex flex-col items-center p-3 rounded-xl transition-all cursor-pointer",
        isDropTarget 
          ? "bg-primary/20 ring-2 ring-primary scale-105" 
          : "hover:bg-muted/50",
        isDraggingFile && "ring-1 ring-dashed ring-primary/50"
      )}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={cn(
        "w-16 h-16 rounded-xl flex items-center justify-center mb-2 transition-colors",
        isDropTarget ? "bg-primary/30" : "bg-blue-100 dark:bg-blue-950/50"
      )}>
        <Folder className={cn("w-9 h-9", isDropTarget ? "text-primary" : "text-blue-500")} />
      </div>
      <p className="text-xs text-center font-medium leading-tight line-clamp-2 w-full px-1">
        {name}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {fileCount} fichier{fileCount !== 1 ? 's' : ''}
      </p>

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
            <Edit2 className="w-3.5 h-3.5 mr-2" />
            <span className="text-xs">Renommer</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            className="text-destructive focus:text-destructive"
            disabled={fileCount > 0}
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            <span className="text-xs">{fileCount > 0 ? 'Vider d\'abord' : 'Supprimer'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
export default function StudyFiles() {
  const { subscriptionTier, subscriptionLoading, user } = useAuth();
  const navigate = useNavigate();
  const {
    uploading,
    loading,
    uploadProgress,
    uploadMultipleFiles,
    getAllFiles,
    getFolders,
    getFileUrl,
    renameFile,
    moveToFolder,
    deleteFile
  } = useStudyFiles();

  const [files, setFiles] = useState<StudyFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const dropProcessingRef = useRef(false);
  const [progressCenterX, setProgressCenterX] = useState<number | null>(null);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [renameFolderDialogOpen, setRenameFolderDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<StudyFile | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFilename, setNewFilename] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  
  // Multi-select state
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false);
  
  const selectionMode = selectedFileIds.size > 0;
  
  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };
  
  const clearSelection = () => {
    setSelectedFileIds(new Set());
  };
  
  const handleBulkDelete = async () => {
    for (const fileId of selectedFileIds) {
      const file = files.find(f => f.id === fileId);
      if (file) {
        await deleteFile(file);
      }
    }
    clearSelection();
    setBulkDeleteDialogOpen(false);
    await loadData();
  };
  
  const handleBulkMove = async (folderName: string | null) => {
    for (const fileId of selectedFileIds) {
      await moveToFolder(fileId, folderName);
    }
    clearSelection();
    setBulkMoveDialogOpen(false);
    await loadData();
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!subscriptionLoading && !user) {
      navigate('/auth');
    }
  }, [user, subscriptionLoading, navigate]);

  const loadData = useCallback(async () => {
    const [filesData, foldersData] = await Promise.all([
      getAllFiles(),
      getFolders()
    ]);
    setFiles(filesData);
    setFolders(foldersData);
  }, [getAllFiles, getFolders]);

  useEffect(() => {
    if (subscriptionTier === 'major') {
      loadData();
    }
  }, [subscriptionTier, loadData]);

  // Keep progress centered in the content area (not including the sidebar)
  useEffect(() => {
    const el = document.getElementById('study-files-container');
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setProgressCenterX(rect.left + rect.width / 2);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleDropFiles = useCallback(async (droppedFiles: File[]) => {
    if (dropProcessingRef.current) return;

    dropProcessingRef.current = true;
    try {
      const result = await uploadMultipleFiles(droppedFiles, currentFolder || undefined);
      if (result.length > 0) {
        await loadData();
      }
    } finally {
      dropProcessingRef.current = false;
    }
  }, [uploadMultipleFiles, currentFolder, loadData]);

  const handleOverlayDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    setIsDragging(false);

    if (droppedFiles.length === 0) return;
    await handleDropFiles(droppedFiles);
  }, [handleDropFiles]);

  // Global drag handlers (upload is handled only by the overlay drop to avoid duplicates)
  useEffect(() => {
    if (subscriptionTier !== 'major') return;

    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;

      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDropPrevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDropPrevent);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDropPrevent);
    };
  }, [subscriptionTier]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const result = await uploadMultipleFiles(selectedFiles, currentFolder || undefined);
    if (result.length > 0) {
      await loadData();
    }
    event.target.value = '';
  };

  const handleOpenFile = async (file: StudyFile) => {
    const url = await getFileUrl(file.storage_path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleDownloadFile = async (file: StudyFile) => {
    const url = await getFileUrl(file.storage_path);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      link.click();
    }
  };

  const handleRenameClick = (file: StudyFile) => {
    setSelectedFile(file);
    setNewFilename(file.filename);
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = async () => {
    if (selectedFile && newFilename.trim()) {
      const success = await renameFile(selectedFile.id, newFilename.trim());
      if (success) {
        await loadData();
      }
    }
    setRenameDialogOpen(false);
    setSelectedFile(null);
    setNewFilename('');
  };

  const handleMoveFile = async (file: StudyFile, folder: string | null) => {
    const success = await moveToFolder(file.id, folder);
    if (success) {
      await loadData();
    }
  };

  const handleDeleteClick = (file: StudyFile) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedFile) {
      const success = await deleteFile(selectedFile);
      if (success) {
        await loadData();
      }
    }
    setDeleteDialogOpen(false);
    setSelectedFile(null);
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      setFolders(prev => [...prev, newFolderName.trim()].sort());
      setNewFolderDialogOpen(false);
      setNewFolderName('');
    }
  };

  // Folder actions
  const handleRenameFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
    setNewFolderName(folderName);
    setRenameFolderDialogOpen(true);
  };

  const handleRenameFolderConfirm = async () => {
    if (selectedFolder && newFolderName.trim() && newFolderName.trim() !== selectedFolder) {
      // Update all files in the folder to the new folder name
      const folderFiles = files.filter(f => f.folder_name === selectedFolder);
      for (const file of folderFiles) {
        await moveToFolder(file.id, newFolderName.trim());
      }
      // Update local folders list
      setFolders(prev => prev.map(f => f === selectedFolder ? newFolderName.trim() : f).sort());
      await loadData();
    }
    setRenameFolderDialogOpen(false);
    setSelectedFolder(null);
    setNewFolderName('');
  };

  const handleDeleteFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
    setDeleteFolderDialogOpen(true);
  };

  const handleDeleteFolderConfirm = async () => {
    if (selectedFolder) {
      const folderFileCount = files.filter(f => f.folder_name === selectedFolder).length;
      if (folderFileCount === 0) {
        setFolders(prev => prev.filter(f => f !== selectedFolder));
      }
    }
    setDeleteFolderDialogOpen(false);
    setSelectedFolder(null);
  };

  const handleFileDropOnFolder = async (folderName: string) => {
    if (draggedFileId) {
      const success = await moveToFolder(draggedFileId, folderName);
      if (success) {
        await loadData();
      }
      setDraggedFileId(null);
      setIsDraggingFile(false);
    }
  };

  // Get files for current view
  const currentFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = currentFolder === null 
      ? !file.folder_name 
      : file.folder_name === currentFolder;
    return matchesSearch && matchesFolder;
  });

  // Sort files
  const sortedFiles = [...currentFiles].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else {
      comparison = a.filename.localeCompare(b.filename);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get folder file counts
  const getFolderFileCount = (folderName: string) => 
    files.filter(f => f.folder_name === folderName).length;

  // Show loading state
  if (subscriptionLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Show paywall for non-Major users
  if (subscriptionTier !== 'major') {
    return <StudyFilesPaywall />;
  }

  return (
    <div id="study-files-container" className="relative min-h-full">
      {/* Global drag overlay */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleOverlayDrop}
        >
          <div className="bg-background border-2 border-dashed border-primary rounded-2xl p-12 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Dépose tes fichiers ici</p>
            <p className="text-sm text-muted-foreground mt-1">Formats acceptés : PDF, Word</p>
          </div>
        </div>
      )}

      {/* Upload progress bar (centered in the content area) */}
      {uploading && uploadProgress && (
        <div
          className="fixed bottom-4 z-50 bg-background border rounded-xl shadow-lg p-4 w-80 animate-fade-in"
          style={{
            left: progressCenterX ? `${progressCenterX}px` : '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{uploadProgress.currentFileName}</p>
              <p className="text-xs text-muted-foreground">
                {uploadProgress.current + 1} / {uploadProgress.total} fichier{uploadProgress.total > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Progress
            value={((uploadProgress.current + 1) / uploadProgress.total) * 100}
            className="h-2"
          />
        </div>
      )}

      <div className="space-y-4 p-6">
        {/* Selection bar */}
        {selectionMode && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedFileIds.size} fichier{selectedFileIds.size > 1 ? 's' : ''} sélectionné{selectedFileIds.size > 1 ? 's' : ''}
              </span>
              <Button variant="ghost" size="sm" onClick={clearSelection} className="h-7 text-xs">
                <X className="w-3.5 h-3.5 mr-1" />
                Annuler
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {folders.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setBulkMoveDialogOpen(true)} className="h-7 text-xs gap-1">
                  <FolderOpen className="w-3.5 h-3.5" />
                  Déplacer
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={() => setBulkDeleteDialogOpen(true)} className="h-7 text-xs gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        {!selectionMode && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Mes fiches</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {files.length} fichier{files.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setNewFolderDialogOpen(true)} variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
              <FolderPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nouveau dossier</span>
            </Button>
            <Button 
              onClick={() => document.getElementById('file-upload-input')?.click()}
              disabled={uploading} 
              size="sm" 
              className="gap-1.5 h-8 text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Importer</span>
            </Button>
            <input
              id="file-upload-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-[10px] text-muted-foreground">PDF, Word</p>
          </div>
        </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs">
          <button 
            onClick={() => setCurrentFolder(null)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors",
              currentFolder === null && "text-primary font-medium"
            )}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Tous les fichiers</span>
          </button>
          {currentFolder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="px-2 py-1 text-primary font-medium">{currentFolder}</span>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
            const [by, order] = v.split('-');
            setSortBy(by as 'date' | 'name');
            setSortOrder(order as 'asc' | 'desc');
          }}>
            <SelectTrigger className="w-full sm:w-[140px] h-8 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc" className="text-xs">Plus récent</SelectItem>
              <SelectItem value="date-asc" className="text-xs">Plus ancien</SelectItem>
              <SelectItem value="name-asc" className="text-xs">A → Z</SelectItem>
              <SelectItem value="name-desc" className="text-xs">Z → A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-2 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Folders (only show at root level) */}
            {currentFolder === null && folders.length > 0 && (
              <div className="grid gap-2 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                {folders.map(folder => (
                  <FolderItem
                    key={folder}
                    name={folder}
                    fileCount={getFolderFileCount(folder)}
                    onClick={() => setCurrentFolder(folder)}
                    onRename={() => handleRenameFolderClick(folder)}
                    onDelete={() => handleDeleteFolderClick(folder)}
                    onFileDrop={handleFileDropOnFolder}
                    isDraggingFile={isDraggingFile}
                  />
                ))}
              </div>
            )}

            {/* Files */}
            {sortedFiles.length > 0 ? (
              <div className="grid gap-2 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                {sortedFiles.map(file => (
                  <FileItem
                    key={file.id}
                    file={file}
                    onOpen={() => handleOpenFile(file)}
                    onDownload={() => handleDownloadFile(file)}
                    onRename={() => handleRenameClick(file)}
                    onMove={(folder) => handleMoveFile(file, folder)}
                    onDelete={() => handleDeleteClick(file)}
                    folders={folders}
                    onDragStart={() => {
                      setDraggedFileId(file.id);
                      setIsDraggingFile(true);
                    }}
                    onDragEnd={() => {
                      setDraggedFileId(null);
                      setIsDraggingFile(false);
                    }}
                    isSelected={selectedFileIds.has(file.id)}
                    onSelect={() => toggleFileSelection(file.id)}
                    selectionMode={selectionMode}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">
                  {searchQuery ? 'Aucun résultat' : 'Aucun fichier'}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {searchQuery 
                    ? `Aucun fichier ne correspond à "${searchQuery}"`
                    : 'Glisse des fichiers ici ou clique sur Importer'
                  }
                </p>
                {!searchQuery && (
                  <label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button asChild size="sm" className="gap-1.5 text-xs">
                      <span>
                        <Upload className="w-3.5 h-3.5" />
                        Importer des fichiers
                      </span>
                    </Button>
                  </label>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Supprimer ce fichier ?</DialogTitle>
            <DialogDescription className="text-xs">
              Cette action est irréversible. Le fichier "{selectedFile?.filename}" sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Renommer le fichier</DialogTitle>
          </DialogHeader>
          <Input
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            placeholder="Nouveau nom"
            className="text-sm"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRenameDialogOpen(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleRenameConfirm} disabled={!newFilename.trim()}>
              Renommer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New folder dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Créer un dossier</DialogTitle>
            <DialogDescription className="text-xs">
              Créez un nouveau dossier pour organiser vos fichiers.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nom du dossier (ex: Finance, Compta...)"
            className="text-sm"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setNewFolderDialogOpen(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename folder dialog */}
      <Dialog open={renameFolderDialogOpen} onOpenChange={setRenameFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Renommer le dossier</DialogTitle>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nouveau nom"
            className="text-sm"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setRenameFolderDialogOpen(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleRenameFolderConfirm} disabled={!newFolderName.trim()}>
              Renommer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete folder dialog */}
      <Dialog open={deleteFolderDialogOpen} onOpenChange={setDeleteFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Supprimer le dossier ?</DialogTitle>
            <DialogDescription className="text-xs">
              Le dossier "{selectedFolder}" sera supprimé. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteFolderDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteFolderConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk delete dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Supprimer {selectedFileIds.size} fichier{selectedFileIds.size > 1 ? 's' : ''} ?</DialogTitle>
            <DialogDescription className="text-xs">
              Cette action est irréversible. Les fichiers sélectionnés seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setBulkDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk move dialog */}
      <Dialog open={bulkMoveDialogOpen} onOpenChange={setBulkMoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Déplacer {selectedFileIds.size} fichier{selectedFileIds.size > 1 ? 's' : ''}</DialogTitle>
            <DialogDescription className="text-xs">
              Choisissez le dossier de destination.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-9 text-xs"
              onClick={() => handleBulkMove(null)}
            >
              <X className="w-3.5 h-3.5" />
              Retirer du dossier (racine)
            </Button>
            {folders.map(folder => (
              <Button
                key={folder}
                variant="outline"
                className="w-full justify-start gap-2 h-9 text-xs"
                onClick={() => handleBulkMove(folder)}
              >
                <Folder className="w-3.5 h-3.5" />
                {folder}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setBulkMoveDialogOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
