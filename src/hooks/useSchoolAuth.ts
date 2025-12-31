import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface School {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  contact_email: string;
  subscription_tier: string | null;
  is_active: boolean;
}

interface SchoolMembership {
  school: School;
  role: string;
}

export const useSchoolAuth = () => {
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<SchoolMembership | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    checkSchoolMembership();
  }, [user, navigate]);

  const checkSchoolMembership = async () => {
    if (!user) return;

    try {
      // Get user's school membership
      const { data: memberData, error: memberError } = await supabase
        .from('school_members')
        .select('role, school_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('role', ['admin_school', 'teacher'])
        .maybeSingle();

      if (memberError) throw memberError;

      if (!memberData) {
        setError('no_access');
        setLoading(false);
        return;
      }

      // Get school details
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id, name, logo_url, primary_color, contact_email, subscription_tier, is_active')
        .eq('id', memberData.school_id)
        .single();

      if (schoolError) throw schoolError;

      setMembership({
        school: schoolData,
        role: memberData.role,
      });
    } catch (err) {
      console.error('Error checking school membership:', err);
      setError('error');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = membership?.role === 'admin_school';
  const isTeacher = membership?.role === 'teacher';

  return {
    loading,
    membership,
    error,
    isAdmin,
    isTeacher,
    school: membership?.school || null,
    refetch: checkSchoolMembership,
  };
};
