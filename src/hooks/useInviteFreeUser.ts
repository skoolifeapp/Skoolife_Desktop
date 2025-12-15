import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useInviteFreeUser() {
  const { user, isSubscribed, subscriptionLoading } = useAuth();
  const [signedUpViaInvite, setSignedUpViaInvite] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user) {
        setSignedUpViaInvite(false);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("signed_up_via_invite")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Error loading signed_up_via_invite:", error);
        setSignedUpViaInvite(false);
      } else {
        setSignedUpViaInvite(Boolean((data as any)?.signed_up_via_invite));
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
