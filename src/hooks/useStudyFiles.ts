import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudyFile {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  folder_name: string | null;
  created_at: string;
  updated_at: string;
}

// Allowed file types: PDF and Word documents only
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

const isAllowedFileType = (filename: string): boolean => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ALLOWED_EXTENSIONS.includes(ext);
};

export interface UploadProgress {
  current: number;
  total: number;
  currentFileName: string;
}

export function useStudyFiles() {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  // Prevent duplicate uploads when drag & drop fires twice (or when user drops twice quickly)
  const inFlightKeysRef = useRef<Set<string>>(new Set());

  const getFileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const uploadFile = useCallback(async (
    file: File,
    folderName?: string
  ): Promise<StudyFile | null> => {
    let fileKey: string | null = null;
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté pour importer un fichier');
        return null;
      }

      // Check file type
      if (!isAllowedFileType(file.name)) {
        toast.error('Format non supporté. Uniquement PDF et Word.');
        return null;
      }

      fileKey = getFileKey(file);
      if (inFlightKeysRef.current.has(fileKey)) {
        return null;
      }
      inFlightKeysRef.current.add(fileKey);

      const fileExt = getFileExtension(file.name);
      const fileId = crypto.randomUUID();
      const storagePath = `${user.id}/${fileId}-${file.name}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('study-files')
        .upload(storagePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Erreur lors de l\'upload du fichier');
        return null;
      }

      // Create record in study_files table
      const { data, error } = await supabase
        .from('study_files')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_type: fileExt || 'unknown',
          file_size: file.size,
          storage_path: storagePath,
          folder_name: folderName || null
        })
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        // Cleanup uploaded file
        await supabase.storage.from('study-files').remove([storagePath]);
        toast.error('Erreur lors de l\'enregistrement du fichier');
        return null;
      }

      // No success toast - silent upload
      return data as StudyFile;
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Erreur lors de l\'upload');
      return null;
    } finally {
      if (fileKey) {
        inFlightKeysRef.current.delete(fileKey);
      }
      setUploading(false);
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (
    files: File[],
    folderName?: string
  ): Promise<StudyFile[]> => {
    // Filter to only allowed file types
    const allowedFiles = files.filter(f => isAllowedFileType(f.name));
    const rejectedCount = files.length - allowedFiles.length;

    if (rejectedCount > 0) {
      toast.error(`${rejectedCount} fichier(s) ignoré(s). Uniquement PDF et Word.`);
    }

    if (allowedFiles.length === 0) {
      return [];
    }

    // Dedupe within the selection itself (same file dropped twice in the same event)
    const seen = new Set<string>();
    const dedupedFiles = allowedFiles.filter((f) => {
      const key = getFileKey(f);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setUploading(true);
    setUploadProgress({
      current: 0,
      total: dedupedFiles.length,
      currentFileName: dedupedFiles[0]?.name || 'Préparation...'
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté pour importer des fichiers');
        return [];
      }

      // Reserve keys (prevents a second concurrent call from uploading the same file again)
      const uniqueFiles = dedupedFiles.filter((f) => {
        const key = getFileKey(f);
        if (inFlightKeysRef.current.has(key)) return false;
        inFlightKeysRef.current.add(key);
        return true;
      });

      if (uniqueFiles.length === 0) {
        return [];
      }

      // Upload all files in parallel for maximum speed
      let completed = 0;

      const uploadPromises = uniqueFiles.map(async (file) => {
        const key = getFileKey(file);

        try {
          const fileExt = getFileExtension(file.name);
          const fileId = crypto.randomUUID();
          const storagePath = `${user.id}/${fileId}-${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from('study-files')
            .upload(storagePath, file);

          if (uploadError) {
            console.error('Upload error for', file.name, uploadError);
            return null;
          }

          const { data, error } = await supabase
            .from('study_files')
            .insert({
              user_id: user.id,
              filename: file.name,
              file_type: fileExt || 'unknown',
              file_size: file.size,
              storage_path: storagePath,
              folder_name: folderName || null
            })
            .select()
            .single();

          if (error) {
            await supabase.storage.from('study-files').remove([storagePath]);
            return null;
          }

          return data as StudyFile;
        } finally {
          inFlightKeysRef.current.delete(key);
          completed++;
          setUploadProgress({ current: completed, total: uniqueFiles.length, currentFileName: file.name });
        }
      });

      const results = await Promise.all(uploadPromises);
      return results.filter((r): r is StudyFile => r !== null);
    } catch (err) {
      console.error('Error uploading files:', err);
      toast.error('Erreur lors de l\'upload');
      return [];
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, []);

  const getFiles = useCallback(async (folderName?: string | null): Promise<StudyFile[]> => {
    setLoading(true);
    try {
      let query = supabase
        .from('study_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (folderName !== undefined) {
        if (folderName === null) {
          query = query.is('folder_name', null);
        } else {
          query = query.eq('folder_name', folderName);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching files:', error);
        return [];
      }

      return (data || []) as StudyFile[];
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllFiles = useCallback(async (): Promise<StudyFile[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('study_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        return [];
      }

      return (data || []) as StudyFile[];
    } finally {
      setLoading(false);
    }
  }, []);

  const getFolders = useCallback(async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('study_files')
      .select('folder_name')
      .not('folder_name', 'is', null);

    if (error) {
      console.error('Error fetching folders:', error);
      return [];
    }

    // Get unique folder names
    const folders = [...new Set(data?.map(f => f.folder_name).filter(Boolean) as string[])];
    return folders.sort();
  }, []);

  const getFileUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('study-files')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error getting file URL:', error);
      return null;
    }

    return data.signedUrl;
  }, []);

  const renameFile = useCallback(async (fileId: string, newFilename: string): Promise<boolean> => {
    const { error } = await supabase
      .from('study_files')
      .update({ filename: newFilename })
      .eq('id', fileId);

    if (error) {
      console.error('Error renaming file:', error);
      toast.error('Erreur lors du renommage');
      return false;
    }

    // No success toast
    return true;
  }, []);

  const moveToFolder = useCallback(async (fileId: string, folderName: string | null): Promise<boolean> => {
    const { error } = await supabase
      .from('study_files')
      .update({ folder_name: folderName })
      .eq('id', fileId);

    if (error) {
      console.error('Error moving file:', error);
      toast.error('Erreur lors du déplacement');
      return false;
    }

    // No success toast
    return true;
  }, []);

  const deleteFile = useCallback(async (file: StudyFile): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('study-files')
        .remove([file.storage_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error } = await supabase
        .from('study_files')
        .delete()
        .eq('id', file.id);

      if (error) {
        console.error('Database delete error:', error);
        toast.error('Erreur lors de la suppression');
        return false;
      }

      // No success toast
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, []);

  const createFolder = useCallback(async (folderName: string): Promise<boolean> => {
    // Folders are implicit - they exist when files have that folder_name
    // This is just for validation
    if (!folderName.trim()) {
      toast.error('Le nom du dossier ne peut pas être vide');
      return false;
    }
    return true;
  }, []);

  return {
    uploading,
    loading,
    uploadProgress,
    uploadFile,
    uploadMultipleFiles,
    getFiles,
    getAllFiles,
    getFolders,
    getFileUrl,
    renameFile,
    moveToFolder,
    deleteFile,
    createFolder
  };
}
