import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SchoolRole = 'admin_school' | 'teacher' | 'student' | null;

interface SchoolMembership {
  schoolId: string;
  schoolName: string;
  role: SchoolRole;
  cohortId: string | null;
  classId: string | null;
}

interface SchoolRoleContextType {
  membership: SchoolMembership | null;
  loading: boolean;
  isSchoolAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  hasSchool: boolean;
  refetch: () => Promise<void>;
}

const SchoolRoleContext = createContext<SchoolRoleContextType | undefined>(undefined);

export function SchoolRoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [membership, setMembership] = useState<SchoolMembership | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMembership = async () => {
    if (!user) {
      setMembership(null);
      setLoading(false);
      return;
    }

    try {
      // Get user's school membership
      const { data: memberData, error: memberError } = await supabase
        .from('school_members')
        .select(`
          school_id,
          role,
          cohort_id,
          class_id,
          schools!inner(name)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching school membership:', memberError);
        setMembership(null);
      } else if (memberData) {
        setMembership({
          schoolId: memberData.school_id,
          schoolName: (memberData.schools as any)?.name || '',
          role: memberData.role as SchoolRole,
          cohortId: memberData.cohort_id,
          classId: memberData.class_id,
        });
      } else {
        setMembership(null);
      }
    } catch (err) {
      console.error('Error in fetchMembership:', err);
      setMembership(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, [user]);

  const contextValue = useMemo(() => ({
    membership,
    loading,
    isSchoolAdmin: membership?.role === 'admin_school',
    isTeacher: membership?.role === 'teacher',
    isStudent: membership?.role === 'student',
    hasSchool: membership !== null,
    refetch: fetchMembership,
  }), [membership, loading]);

  return (
    <SchoolRoleContext.Provider value={contextValue}>
      {children}
    </SchoolRoleContext.Provider>
  );
}

export function useSchoolRole() {
  const context = useContext(SchoolRoleContext);
  if (context === undefined) {
    throw new Error('useSchoolRole must be used within a SchoolRoleProvider');
  }
  return context;
}
