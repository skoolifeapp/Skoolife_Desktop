import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useActivityTracker = () => {
  const { user } = useAuth();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const trackAppOpen = async () => {
      if (!user || hasTrackedRef.current) return;
      
      hasTrackedRef.current = true;

      // Detect source from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('utm_source') || 'organic';

      try {
        await supabase.from('user_activity').insert({
          user_id: user.id,
          activity_type: 'app_open',
          source: source,
        });
      } catch (error) {
        console.error('Failed to track activity:', error);
      }
    };

    trackAppOpen();
  }, [user]);
};
