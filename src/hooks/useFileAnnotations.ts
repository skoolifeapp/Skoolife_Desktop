import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Annotation {
  id: string;
  user_id: string;
  file_id: string;
  page_number: number;
  annotation_type: 'highlight' | 'note' | 'drawing';
  color: string;
  content: string | null;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    path?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateAnnotationParams {
  file_id: string;
  page_number: number;
  annotation_type: 'highlight' | 'note' | 'drawing';
  color: string;
  content?: string;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    path?: string;
  };
}

export const useFileAnnotations = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getAnnotations = useCallback(async (fileId: string): Promise<Annotation[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('file_annotations')
        .select('*')
        .eq('file_id', fileId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        annotation_type: item.annotation_type as 'highlight' | 'note' | 'drawing',
        position: item.position as Annotation['position']
      }));
    } catch (error) {
      console.error('Error fetching annotations:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createAnnotation = useCallback(async (params: CreateAnnotationParams): Promise<Annotation | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('file_annotations')
        .insert({
          user_id: user.id,
          file_id: params.file_id,
          page_number: params.page_number,
          annotation_type: params.annotation_type,
          color: params.color,
          content: params.content || null,
          position: params.position
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        annotation_type: data.annotation_type as 'highlight' | 'note' | 'drawing',
        position: data.position as Annotation['position']
      };
    } catch (error) {
      console.error('Error creating annotation:', error);
      return null;
    }
  }, [user]);

  const updateAnnotation = useCallback(async (
    annotationId: string, 
    updates: Partial<Pick<Annotation, 'color' | 'content' | 'position'>>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('file_annotations')
        .update(updates)
        .eq('id', annotationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating annotation:', error);
      return false;
    }
  }, [user]);

  const deleteAnnotation = useCallback(async (annotationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('file_annotations')
        .delete()
        .eq('id', annotationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting annotation:', error);
      return false;
    }
  }, [user]);

  const deleteAllAnnotations = useCallback(async (fileId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('file_annotations')
        .delete()
        .eq('file_id', fileId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting all annotations:', error);
      return false;
    }
  }, [user]);

  return {
    loading,
    getAnnotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    deleteAllAnnotations
  };
};
