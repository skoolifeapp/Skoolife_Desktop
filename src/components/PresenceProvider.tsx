import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Simple presence provider using Supabase Presence.
 * No manual heartbeat, no polling - Supabase handles everything.
 */
export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('skoolife-presence', {
      config: {
        presence: { key: user.id }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        // Nothing to do here for students, counting happens on admin side
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: user.id,
            email: user.email,
          });
        }
      });

    // Cleanup on unmount or user change
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return <>{children}</>;
};
