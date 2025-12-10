import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LiveUser {
  odliysfuq: string;
  email: string;
  device: 'desktop' | 'mobile';
  connectedAt: string;
}

/**
 * Hook to get real-time list of connected users via Supabase Presence.
 * No manual heartbeat, no polling - pure Supabase Presence.
 */
export function useLiveUsers() {
  const [users, setUsers] = useState<LiveUser[]>([]);

  useEffect(() => {
    console.log('[LiveUsers] Initializing hook');
    
    const channel = supabase.channel('skoolife-presence');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('[LiveUsers] Presence state:', state);
        
        // Get all presence entries and flatten
        const allEntries: LiveUser[] = [];
        Object.values(state).forEach((presences) => {
          (presences as unknown as LiveUser[]).forEach((p) => {
            if (p.odliysfuq && p.email) {
              allEntries.push(p);
            }
          });
        });
        
        console.log('[LiveUsers] Filtered users:', allEntries);
        setUsers(allEntries);
      })
      .subscribe(async (status) => {
        console.log('[LiveUsers] Subscribe status:', status);
        if (status === 'SUBSCRIBED') {
          // Admin tracks with a special marker
          await channel.track({ 
            odliysfuq: 'admin-observer',
            isAdmin: true 
          });
        }
      });

    return () => {
      console.log('[LiveUsers] Cleanup');
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter out admin observer from count
  return users.filter(u => u.odliysfuq !== 'admin-observer');
}

/**
 * Simple hook that just returns the count
 */
export function useLiveUserCount() {
  const users = useLiveUsers();
  return users.length;
}
