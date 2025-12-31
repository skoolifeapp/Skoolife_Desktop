import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStudyFiles, StudyFile } from '@/hooks/useStudyFiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  ArrowUpDown,
  Folder,
  X,
  File,
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

// iCloud-style file item with drag support
const FileItem = ({
  file,
  onOpen,
  onDownload,
  onRename,
  onMove,
  onDelete,
  folders,
  onDragStart,
  onDragEnd
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

  return (
    <div 
      className="group relative flex flex-col items-center p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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

      {/* Actions dropdown */}
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
  const { user, loading: authLoading } = useAuth();
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const loadData = useCallback(async () => {
    const [filesData, foldersData] = await Promise.all([
      getAllFiles(),
      getFolders()
    ]);
    setFiles(filesData);
    setFolders(foldersData);
  }, [getAllFiles, getFolders]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Global drag & drop handlers
  useEffect(() => {
    if (!user) return;

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

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);
      
      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      if (droppedFiles.length === 0) return;

      const result = await uploadMultipleFiles(droppedFiles, currentFolder || undefined);
      if (result.length > 0) {
        await loadData();
      }
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
    };
  }, [user, currentFolder, uploadMultipleFiles, loadData]);

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
    if (!newFolderName.trim()) return;
    
    // Create folder by adding a placeholder file (folders are virtual)
    // Actually, we'll just add it to the local state and it will be created when a file is moved there
    if (!folders.includes(newFolderName.trim())) {
      setFolders(prev => [...prev, newFolderName.trim()]);
    }
    setNewFolderDialogOpen(false);
    setNewFolderName('');
  };

  const handleRenameFolder = async () => {
    if (!selectedFolder || !newFolderName.trim() || selectedFolder === newFolderName.trim()) {
      setRenameFolderDialogOpen(false);
      return;
    }

    // Update all files in this folder to the new folder name
    const filesToUpdate = files.filter(f => f.folder_name === selectedFolder);
    for (const file of filesToUpdate) {
      await moveToFolder(file.id, newFolderName.trim());
    }

    await loadData();
    setRenameFolderDialogOpen(false);
    setSelectedFolder(null);
    setNewFolderName('');
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;
    
    // Check if folder is empty
    const filesInFolder = files.filter(f => f.folder_name === selectedFolder);
    if (filesInFolder.length > 0) {
      setDeleteFolderDialogOpen(false);
      return;
    }

    // Remove from local state (folder doesn't really exist in DB)
    setFolders(prev => prev.filter(f => f !== selectedFolder));
    setDeleteFolderDialogOpen(false);
    setSelectedFolder(null);
  };

  const handleFileDrop = async (folderName: string) => {
    if (!draggedFileId) return;
    
    const file = files.find(f => f.id === draggedFileId);
    if (file && file.folder_name !== folderName) {
      const success = await moveToFolder(file.id, folderName);
      if (success) {
        await loadData();
      }
    }
    setDraggedFileId(null);
    setIsDraggingFile(false);
  };

  // Filter and sort files
  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = currentFolder ? file.folder_name === currentFolder : !file.folder_name;
      return matchesSearch && matchesFolder;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === 'desc' 
          ? b.filename.localeCompare(a.filename)
          : a.filename.localeCompare(b.filename);
      }
    });

  // Get folder file counts
  const folderFileCounts = folders.reduce((acc, folder) => {
    acc[folder] = files.filter(f => f.folder_name === folder).length;
    return acc;
  }, {} as Record<string, number>);

  if (authLoading || loading) {
    return (
      <div className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
      {/* Upload progress bar */}
      {uploading && uploadProgress && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b p-3">
          <div className="max-w-xl mx-auto space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate max-w-[200px]">{uploadProgress.currentFileName}</span>
              <span className="text-muted-foreground">
                {uploadProgress.current} / {uploadProgress.total}
              </span>
            </div>
            <Progress value={(uploadProgress.current / uploadProgress.total) * 100} className="h-2" />
          </div>
        </div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-card border-2 border-dashed border-primary rounded-2xl p-12 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-xl font-medium">Dépose tes fichiers ici</p>
            <p className="text-muted-foreground mt-1">pour les ajouter à {currentFolder || 'Mes fiches'}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Mes fiches</h1>
            <p className="text-muted-foreground">Organise tes documents de cours</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setNewFolderDialogOpen(true)}
              className="gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau dossier</span>
            </Button>
            <Button asChild className="gap-2">
              <label>
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </Button>
          </div>
        </div>

        {/* Breadcrumb */}
        {currentFolder && (
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 h-8 px-2"
              onClick={() => setCurrentFolder(null)}
            >
              <Home className="w-4 h-4" />
              Mes fiches
            </Button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{currentFolder}</span>
          </div>
        )}

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un fichier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v: 'date' | 'name') => setSortBy(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Par date</SelectItem>
                <SelectItem value="name">Par nom</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className={cn("w-4 h-4", sortOrder === 'asc' && "rotate-180")} />
            </Button>
          </div>
        </div>

        {/* Folders (only at root) */}
        {!currentFolder && folders.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Dossiers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {folders.map(folder => (
                <FolderItem
                  key={folder}
                  name={folder}
                  fileCount={folderFileCounts[folder] || 0}
                  onClick={() => setCurrentFolder(folder)}
                  onRename={() => {
                    setSelectedFolder(folder);
                    setNewFolderName(folder);
                    setRenameFolderDialogOpen(true);
                  }}
                  onDelete={() => {
                    setSelectedFolder(folder);
                    setDeleteFolderDialogOpen(true);
                  }}
                  onFileDrop={handleFileDrop}
                  isDraggingFile={isDraggingFile}
                />
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          {!currentFolder && folders.length > 0 && (
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Fichiers</h2>
          )}
          
          {filteredFiles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">
                {searchQuery ? 'Aucun fichier trouvé' : 'Aucun fichier'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery 
                  ? 'Essaie avec d\'autres termes de recherche'
                  : 'Glisse-dépose des fichiers ici ou clique sur Ajouter'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {filteredFiles.map(file => (
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
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete File Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le fichier ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le fichier "{selectedFile?.filename}" sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename File Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer le fichier</DialogTitle>
          </DialogHeader>
          <Input
            value={newFilename}
            onChange={(e) => setNewFilename(e.target.value)}
            placeholder="Nouveau nom"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRenameConfirm}>
              Renommer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nom du dossier"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateFolder}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={renameFolderDialogOpen} onOpenChange={setRenameFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer le dossier</DialogTitle>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nouveau nom"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameFolderDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRenameFolder}>
              Renommer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={deleteFolderDialogOpen} onOpenChange={setDeleteFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le dossier ?</DialogTitle>
            <DialogDescription>
              Le dossier "{selectedFolder}" sera supprimé. Cette action ne supprime pas les fichiers qu'il contient.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFolderDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
