import { useState, useCallback } from 'react';
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

// No file type restrictions - accept all files
// No file size limit

export function useStudyFiles() {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const uploadFile = useCallback(async (
    file: File,
    folderName?: string
  ): Promise<StudyFile | null> => {
    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté pour importer un fichier');
        return null;
      }

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

      toast.success('Fichier importé avec succès');
      return data as StudyFile;
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Erreur lors de l\'upload');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (
    files: File[],
    folderName?: string
  ): Promise<StudyFile[]> => {
    setUploading(true);
    const uploaded: StudyFile[] = [];
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté pour importer des fichiers');
        return [];
      }

      for (const file of files) {
        const fileExt = getFileExtension(file.name);
        const fileId = crypto.randomUUID();
        const storagePath = `${user.id}/${fileId}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('study-files')
          .upload(storagePath, file);

        if (uploadError) {
          console.error('Upload error for', file.name, uploadError);
          continue;
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
          continue;
        }

        uploaded.push(data as StudyFile);
      }

      if (uploaded.length > 0) {
        toast.success(`${uploaded.length} fichier${uploaded.length > 1 ? 's' : ''} importé${uploaded.length > 1 ? 's' : ''}`);
      }
      return uploaded;
    } catch (err) {
      console.error('Error uploading files:', err);
      toast.error('Erreur lors de l\'upload');
      return uploaded;
    } finally {
      setUploading(false);
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

    toast.success('Fichier renommé');
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

    toast.success(folderName ? `Déplacé vers ${folderName}` : 'Retiré du dossier');
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

      toast.success('Fichier supprimé');
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
