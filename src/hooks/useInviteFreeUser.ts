import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Cache for invite status to avoid redundant queries
const inviteCache = new Map<string, { value: boolean; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

export function useInviteFreeUser() {
  const { user, isSubscribed, subscriptionLoading } = useAuth();
  const [signedUpViaInvite, setSignedUpViaInvite] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const fetchInProgress = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user) {
        setSignedUpViaInvite(false);
        setProfileLoading(false);
        return;
      }

      // Check cache first
      const cached = inviteCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setSignedUpViaInvite(cached.value);
        setProfileLoading(false);
        return;
      }

      // Prevent duplicate concurrent fetches
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;

      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("signed_up_via_invite")
        .eq("id", user.id)
        .maybeSingle();

      fetchInProgress.current = false;
      if (cancelled) return;

      if (error) {
        console.error("Error loading signed_up_via_invite:", error);
        setSignedUpViaInvite(false);
      } else {
        const value = Boolean((data as any)?.signed_up_via_invite);
        setSignedUpViaInvite(value);
        // Cache the result
        inviteCache.set(user.id, { value, timestamp: Date.now() });
      }

      setProfileLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const loading = subscriptionLoading || profileLoading;

  const isInviteFreeUser = useMemo(() => {
    if (loading) return false;
    return signedUpViaInvite && !isSubscribed;
  }, [loading, signedUpViaInvite, isSubscribed]);

  return { loading, signedUpViaInvite, isInviteFreeUser };
}
