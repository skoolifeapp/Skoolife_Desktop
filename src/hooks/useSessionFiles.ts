import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SessionFile {
  id: string;
  user_id: string;
  session_id: string | null;
  event_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  subject_name?: string | null;
}

export function useSessionFiles() {
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(async (
    file: File,
    targetId: string,
    targetType: 'session' | 'event',
    subjectName?: string
  ): Promise<SessionFile | null> => {
    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté pour uploader un fichier');
        return null;
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${targetType}/${targetId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course_files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Erreur lors de l\'upload du fichier');
        return null;
      }

      // Create record in session_files table with subject_name for sharing
      const fileRecord: any = {
        user_id: user.id,
        session_id: targetType === 'session' ? targetId : null,
        event_id: targetType === 'event' ? targetId : null,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        subject_name: subjectName || null
      };

      const { data, error } = await supabase
        .from('session_files')
        .insert(fileRecord)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        // Cleanup uploaded file
        await supabase.storage.from('course_files').remove([filePath]);
        toast.error('Erreur lors de l\'enregistrement du fichier');
        return null;
      }

      return data as SessionFile;
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Erreur lors de l\'upload');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const getFilesForSession = useCallback(async (sessionId: string): Promise<SessionFile[]> => {
    const { data, error } = await supabase
      .from('session_files')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching session files:', error);
      return [];
    }

    return data as SessionFile[];
  }, []);

  const getFilesForEvent = useCallback(async (eventId: string): Promise<SessionFile[]> => {
    const { data, error } = await supabase
      .from('session_files')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching event files:', error);
      return [];
    }

    return data as SessionFile[];
  }, []);

  // Get all files shared at subject level (across all events/sessions of the same subject)
  const getFilesForSubject = useCallback(async (subjectName: string): Promise<SessionFile[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('session_files')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject_name', subjectName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subject files:', error);
      return [];
    }

    return data as SessionFile[];
  }, []);

  const getFileUrl = useCallback(async (filePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('course_files')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error getting file URL:', error);
      return null;
    }

    return data.signedUrl;
  }, []);

  const deleteFile = useCallback(async (file: SessionFile): Promise<boolean> => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('course_files')
        .remove([file.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error } = await supabase
        .from('session_files')
        .delete()
        .eq('id', file.id);

      if (error) {
        console.error('Database delete error:', error);
        toast.error('Erreur lors de la suppression');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, []);

  return {
    uploading,
    uploadFile,
    getFilesForSession,
    getFilesForEvent,
    getFilesForSubject,
    getFileUrl,
    deleteFile
  };
}
