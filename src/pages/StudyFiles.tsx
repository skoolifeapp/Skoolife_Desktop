import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStudyFiles, StudyFile } from '@/hooks/useStudyFiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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

// iCloud-style file item
const FileItem = ({
  file,
  onOpen,
  onDownload,
  onRename,
  onMove,
  onDelete,
  folders
}: {
  file: StudyFile;
  onOpen: () => void;
  onDownload: () => void;
  onRename: () => void;
  onMove: (folder: string | null) => void;
  onDelete: () => void;
  folders: string[];
}) => {
  const { icon: FileIcon, color, bg } = getFileIcon(file.file_type);

  return (
    <div className="group relative flex flex-col items-center p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
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

// iCloud-style folder item
const FolderItem = ({
  name,
  fileCount,
  onClick
}: {
  name: string;
  fileCount: number;
  onClick: () => void;
}) => (
  <div 
    className="group relative flex flex-col items-center p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
    onClick={onClick}
  >
    <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center mb-2">
      <Folder className="w-9 h-9 text-blue-500" />
    </div>
    <p className="text-xs text-center font-medium leading-tight line-clamp-2 w-full px-1">
      {name}
    </p>
    <p className="text-[10px] text-muted-foreground mt-0.5">
      {fileCount} fichier{fileCount !== 1 ? 's' : ''}
    </p>
  </div>
);

export default function StudyFiles() {
  const { subscriptionTier, subscriptionLoading, user } = useAuth();
  const navigate = useNavigate();
  const {
    uploading,
    loading,
    uploadFile,
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

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<StudyFile | null>(null);
  const [newFilename, setNewFilename] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

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

  // Global drag & drop handlers
  useEffect(() => {
    if (subscriptionTier !== 'major') return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null || !(e.relatedTarget as Element)?.closest?.('#study-files-container')) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
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
  }, [subscriptionTier, currentFolder, uploadMultipleFiles, loadData]);

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
        <div className="fixed inset-0 z-50 bg-primary/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-background border-2 border-dashed border-primary rounded-2xl p-12 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Dépose tes fichiers ici</p>
            <p className="text-sm text-muted-foreground mt-1">Tous les types de fichiers sont acceptés</p>
          </div>
        </div>
      )}

      <div className="space-y-4 p-6">
        {/* Header */}
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
            <label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button asChild disabled={uploading} size="sm" className="gap-1.5 h-8 text-xs">
                <span>
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Importer</span>
                </span>
              </Button>
            </label>
          </div>
        </div>

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
    </div>
  );
}
