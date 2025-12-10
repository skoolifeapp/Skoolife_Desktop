import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get real-time count of connected users via Supabase Presence.
 * No manual heartbeat, no polling - pure Supabase Presence.
 */
export function useLiveUserCount() {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const channel = supabase.channel('skoolife-presence', {
      config: {
        presence: { key: 'admin-observer' }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Get all presence entries and flatten
        const allUsers = Object.values(state).flat() as Array<{ userId?: string }>;
        // Exclude admin from count
        const filtered = allUsers.filter(u => u.userId !== 'admin-observer');
        setOnlineCount(filtered.length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Admin tracks to be able to see others
          await channel.track({ userId: 'admin-observer' });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return onlineCount;
}
