import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStudyFiles, StudyFile } from '@/hooks/useStudyFiles';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  MoreVertical,
  Trash2,
  Edit2,
  Download,
  ExternalLink,
  FolderPlus,
  Crown,
  Lock,
  FileIcon,
  ArrowUpDown,
  Folder,
  X,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

const EmptyState = ({ onUpload }: { onUpload: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
      <FileText className="w-10 h-10 text-primary" />
    </div>
    <h2 className="text-xl font-semibold mb-2">Aucune fiche importée</h2>
    <p className="text-muted-foreground mb-6 max-w-md">
      Importe tes fiches et organise-les par dossiers.
    </p>
    <Button onClick={onUpload} className="gap-2">
      <Upload className="w-4 h-4" />
      Importer une fiche
    </Button>
  </div>
);

const FileCard = ({
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
  const isPdf = file.file_type === 'pdf';
  const fileSize = file.file_size < 1024 * 1024
    ? `${(file.file_size / 1024).toFixed(1)} KB`
    : `${(file.file_size / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
            isPdf ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          )}>
            <FileIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium truncate" title={file.filename}>
                  {file.filename}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {file.file_type.toUpperCase()}
                  </Badge>
                  <span>{fileSize}</span>
                  <span>•</span>
                  <span>{format(new Date(file.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
                {file.folder_name && (
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                    <FolderOpen className="w-3 h-3" />
                    <span>{file.folder_name}</span>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isPdf ? (
                    <DropdownMenuItem onClick={onOpen}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ouvrir
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem onClick={onDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onRename}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Renommer
                  </DropdownMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DropdownMenuItem>
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Déplacer vers...
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left">
                      {file.folder_name && (
                        <DropdownMenuItem onClick={() => onMove(null)}>
                          <X className="w-4 h-4 mr-2" />
                          Retirer du dossier
                        </DropdownMenuItem>
                      )}
                      {folders.filter(f => f !== file.folder_name).map(folder => (
                        <DropdownMenuItem key={folder} onClick={() => onMove(folder)}>
                          <Folder className="w-4 h-4 mr-2" />
                          {folder}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function StudyFiles() {
  const { subscriptionTier, subscriptionLoading, user } = useAuth();
  const navigate = useNavigate();
  const {
    uploading,
    loading,
    uploadFile,
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
  const [selectedFolder, setSelectedFolder] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const folderName = selectedFolder !== 'all' ? selectedFolder : undefined;
    const result = await uploadFile(file, folderName);
    if (result) {
      await loadData();
    }
    event.target.value = '';
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    const folderName = selectedFolder !== 'all' ? selectedFolder : undefined;
    const result = await uploadFile(file, folderName);
    if (result) {
      await loadData();
    }
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

  // Filter and sort files
  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = selectedFolder === 'all' || 
        (selectedFolder === 'uncategorized' ? !file.folder_name : file.folder_name === selectedFolder);
      return matchesSearch && matchesFolder;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        comparison = a.filename.localeCompare(b.filename);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Show loading state
  if (subscriptionLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mes fiches</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {files.length} fichier{files.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewFolderDialogOpen(true)} variant="outline" size="sm" className="gap-2">
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau dossier</span>
          </Button>
          <label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button asChild disabled={uploading} className="gap-2">
              <span>
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Importer</span>
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFolder} onValueChange={(v) => setSelectedFolder(v as string)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <FolderOpen className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tous les dossiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les fichiers</SelectItem>
            <SelectItem value="uncategorized">Sans dossier</SelectItem>
            {folders.map(folder => (
              <SelectItem key={folder} value={folder}>{folder}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
          const [by, order] = v.split('-');
          setSortBy(by as 'date' | 'name');
          setSortOrder(order as 'asc' | 'desc');
        }}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Plus récent</SelectItem>
            <SelectItem value="date-asc">Plus ancien</SelectItem>
            <SelectItem value="name-asc">A → Z</SelectItem>
            <SelectItem value="name-desc">Z → A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          uploading ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
        )}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-primary">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Upload en cours...</span>
          </div>
        ) : (
          <div className="text-muted-foreground">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Glisse tes fichiers ici ou clique sur "Importer"</p>
            <p className="text-xs mt-1">PDF, Word (.doc, .docx) • Max 25 MB</p>
          </div>
        )}
      </div>

      {/* Files list */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        files.length === 0 ? (
          <EmptyState onUpload={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Aucun résultat pour "{searchQuery}"</p>
          </div>
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFiles.map(file => (
            <FileCard
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
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette fiche ?</DialogTitle>
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

      {/* Rename dialog */}
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
            <Button onClick={handleRenameConfirm} disabled={!newFilename.trim()}>
              Renommer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New folder dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un dossier</DialogTitle>
            <DialogDescription>
              Créez un nouveau dossier pour organiser vos fiches.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nom du dossier (ex: Finance, Compta...)"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
