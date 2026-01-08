import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface School {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  subscription_tier: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  is_active: boolean;
}

interface SchoolMember {
  id: string;
  user_id: string;
  role: string;
  cohort_id: string | null;
  class_id: string | null;
  is_active: boolean;
  joined_at: string | null;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    is_onboarding_complete: boolean | null;
  };
  cohort?: {
    name: string;
  };
  class?: {
    name: string;
  };
}

interface Cohort {
  id: string;
  name: string;
  year_start: number;
  year_end: number;
  is_active: boolean;
}

interface Class {
  id: string;
  name: string;
  cohort_id: string;
  is_active: boolean;
}

interface AccessCode {
  id: string;
  code: string;
  cohort_id: string | null;
  class_id: string | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface SchoolStats {
  totalStudents: number;
  activeStudents: number;
  totalSessions: number;
  completedSessions: number;
  totalHours: number;
  avgSessionsPerStudent: number;
}

export const useSchoolAdmin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<School | null>(null);
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [isSchoolAdmin, setIsSchoolAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    fetchSchoolData();
  }, [user]);

  const fetchSchoolData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First, check if user is a school admin
      const { data: membership, error: memberError } = await supabase
        .from('school_members')
        .select('school_id, role')
        .eq('user_id', user.id)
        .eq('role', 'admin_school')
        .eq('is_active', true)
        .single();

      if (memberError || !membership) {
        setIsSchoolAdmin(false);
        setLoading(false);
        return;
      }

      setIsSchoolAdmin(true);
      const schoolId = membership.school_id;

      // Fetch school details
      const { data: schoolData } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();

      if (schoolData) {
        setSchool(schoolData);
      }

      // Fetch all members with their profiles
      const { data: membersData } = await supabase
        .from('school_members')
        .select(`
          id,
          user_id,
          role,
          cohort_id,
          class_id,
          is_active,
          joined_at
        `)
        .eq('school_id', schoolId)
        .order('joined_at', { ascending: false });

      if (membersData) {
        // Fetch profiles for all members
        const userIds = membersData.map(m => m.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, is_onboarding_complete')
          .in('id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        // Fetch cohorts
        const { data: cohortsData } = await supabase
          .from('cohorts')
          .select('id, name, year_start, year_end, is_active')
          .eq('school_id', schoolId)
          .order('year_start', { ascending: false });

        if (cohortsData) {
          setCohorts(cohortsData);
        }

        const cohortsMap = new Map(cohortsData?.map(c => [c.id, c]) || []);

        // Fetch classes
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name, cohort_id, is_active')
          .eq('school_id', schoolId);

        if (classesData) {
          setClasses(classesData);
        }

        const classesMap = new Map(classesData?.map(c => [c.id, c]) || []);

        // Combine data
        const enrichedMembers: SchoolMember[] = membersData.map(m => ({
          ...m,
          profile: profilesMap.get(m.user_id) || undefined,
          cohort: m.cohort_id ? cohortsMap.get(m.cohort_id) : undefined,
          class: m.class_id ? classesMap.get(m.class_id) : undefined,
        }));

        setMembers(enrichedMembers);
      }

      // Fetch access codes
      const { data: codesData } = await supabase
        .from('access_codes')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (codesData) {
        setAccessCodes(codesData);
      }

      // Calculate stats
      await calculateStats(schoolId, membersData || []);

    } catch (error) {
      console.error('Error fetching school data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (schoolId: string, membersData: SchoolMember[]) => {
    const studentIds = membersData
      .filter(m => m.role === 'student' && m.is_active)
      .map(m => m.user_id);

    if (studentIds.length === 0) {
      setStats({
        totalStudents: 0,
        activeStudents: 0,
        totalSessions: 0,
        completedSessions: 0,
        totalHours: 0,
        avgSessionsPerStudent: 0,
      });
      return;
    }

    // Fetch sessions for these students
    const { data: sessionsData } = await supabase
      .from('revision_sessions')
      .select('id, user_id, status, start_time, end_time')
      .in('user_id', studentIds);

    const totalSessions = sessionsData?.length || 0;
    const completedSessions = sessionsData?.filter(s => s.status === 'done').length || 0;

    // Calculate total hours
    let totalHours = 0;
    sessionsData?.forEach(session => {
      const start = new Date(`1970-01-01T${session.start_time}`);
      const end = new Date(`1970-01-01T${session.end_time}`);
      totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    });

    // Count active students (those who have at least one session)
    const activeStudentIds = new Set(sessionsData?.map(s => s.user_id) || []);

    setStats({
      totalStudents: studentIds.length,
      activeStudents: activeStudentIds.size,
      totalSessions,
      completedSessions,
      totalHours: Math.round(totalHours * 10) / 10,
      avgSessionsPerStudent: studentIds.length > 0 ? Math.round((totalSessions / studentIds.length) * 10) / 10 : 0,
    });
  };

  const createAccessCode = async (data: {
    code: string;
    cohortId?: string;
    classId?: string;
    maxUses?: number;
    expiresAt?: string;
  }) => {
    if (!school) return { error: 'No school found' };

    const { error } = await supabase.from('access_codes').insert({
      school_id: school.id,
      code: data.code.toUpperCase(),
      cohort_id: data.cohortId || null,
      class_id: data.classId || null,
      max_uses: data.maxUses || 100,
      expires_at: data.expiresAt || null,
      is_active: true,
      created_by: user?.id,
    });

    if (!error) {
      await fetchSchoolData();
    }

    return { error };
  };

  const toggleAccessCode = async (codeId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('access_codes')
      .update({ is_active: isActive })
      .eq('id', codeId);

    if (!error) {
      await fetchSchoolData();
    }

    return { error };
  };

  const createCohort = async (data: { name: string; yearStart: number; yearEnd: number }) => {
    if (!school) return { error: 'No school found' };

    const { error } = await supabase.from('cohorts').insert({
      school_id: school.id,
      name: data.name,
      year_start: data.yearStart,
      year_end: data.yearEnd,
      is_active: true,
    });

    if (!error) {
      await fetchSchoolData();
    }

    return { error };
  };

  const createClass = async (data: { name: string; cohortId: string }) => {
    if (!school) return { error: 'No school found' };

    const { error } = await supabase.from('classes').insert({
      school_id: school.id,
      cohort_id: data.cohortId,
      name: data.name,
      is_active: true,
    });

    if (!error) {
      await fetchSchoolData();
    }

    return { error };
  };

  return {
    loading,
    isSchoolAdmin,
    school,
    members,
    cohorts,
    classes,
    accessCodes,
    stats,
    refetch: fetchSchoolData,
    createAccessCode,
    toggleAccessCode,
    createCohort,
    createClass,
  };
};
