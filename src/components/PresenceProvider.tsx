import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Detect if user is on mobile device
 */
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth < 768;
};

/**
 * Simple presence provider using Supabase Presence.
 * No manual heartbeat, no polling - Supabase handles everything.
 * Tracks device type (desktop/mobile) for admin visibility.
 */
export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('[Presence] Initializing for user:', user.id);

    const channel = supabase.channel('skoolife-presence');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('[Presence] Sync event, state:', state);
      })
      .subscribe(async (status) => {
        console.log('[Presence] Subscribe status:', status);
        if (status === 'SUBSCRIBED') {
          const trackData = {
            odliysfuq: user.id,
            email: user.email,
            device: isMobileDevice() ? 'mobile' : 'desktop',
            connectedAt: new Date().toISOString(),
          };
          console.log('[Presence] Tracking:', trackData);
          const result = await channel.track(trackData);
          console.log('[Presence] Track result:', result);
        }
      });

    // Cleanup on unmount or user change
    return () => {
      console.log('[Presence] Cleanup for user:', user.id);
      supabase.removeChannel(channel);
    };
  }, [user]);

  return <>{children}</>;
};
