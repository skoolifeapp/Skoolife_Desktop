import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SchoolTrialState {
  loading: boolean;
  isSchoolAdmin: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  trialEndDate: Date | null;
  schoolName: string | null;
}

export const useSchoolTrial = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<{
    isSchoolAdmin: boolean;
    subscriptionTier: string | null;
    subscriptionEndDate: string | null;
    schoolName: string | null;
  }>({
    isSchoolAdmin: false,
    subscriptionTier: null,
    subscriptionEndDate: null,
    schoolName: null,
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSchoolStatus = async () => {
      try {
        // Check if user is a school admin
        const { data: membership } = await supabase
          .from('school_members')
          .select('school_id, role')
          .eq('user_id', user.id)
          .eq('role', 'admin_school')
          .eq('is_active', true)
          .maybeSingle();

        if (!membership) {
          setSchoolData({
            isSchoolAdmin: false,
            subscriptionTier: null,
            subscriptionEndDate: null,
            schoolName: null,
          });
          setLoading(false);
          return;
        }

        // Fetch school details
        const { data: school } = await supabase
          .from('schools')
          .select('name, subscription_tier, subscription_end_date')
          .eq('id', membership.school_id)
          .single();

        setSchoolData({
          isSchoolAdmin: true,
          subscriptionTier: school?.subscription_tier || null,
          subscriptionEndDate: school?.subscription_end_date || null,
          schoolName: school?.name || null,
        });
      } catch (error) {
        console.error('Error fetching school status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolStatus();
  }, [user]);

  const trialState = useMemo((): SchoolTrialState => {
    if (!schoolData.isSchoolAdmin) {
      return {
        loading,
        isSchoolAdmin: false,
        isTrialActive: false,
        isTrialExpired: false,
        daysRemaining: 0,
        trialEndDate: null,
        schoolName: null,
      };
    }

    const isTrial = schoolData.subscriptionTier === 'trial' || schoolData.subscriptionTier === 'demo';
    const endDate = schoolData.subscriptionEndDate 
      ? new Date(schoolData.subscriptionEndDate) 
      : null;
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    let isExpired = false;
    let daysRemaining = 0;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
      isExpired = now > endDate;
      
      if (!isExpired) {
        const diffTime = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    return {
      loading,
      isSchoolAdmin: true,
      isTrialActive: isTrial && !isExpired,
      isTrialExpired: isTrial && isExpired,
      daysRemaining,
      trialEndDate: endDate,
      schoolName: schoolData.schoolName,
    };
  }, [loading, schoolData]);

  return trialState;
};
