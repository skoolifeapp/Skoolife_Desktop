import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Subscription tiers
export type SubscriptionTier = 'free_invite' | 'student' | 'major';

// Stripe product IDs mapping
export const STRIPE_PRODUCTS = {
  student: {
    product_id: 'prod_Tbz5HgJWHbElHU',
    price_id: 'price_1Sel7HCG6ZnJ9jFuMwPpQ6uS',
  },
  major: {
    product_id: 'prod_Tbz59WmKmYF5Jk',
    price_id: 'price_1Sel7UCG6ZnJ9jFuyilMrJzF',
  }
} as const;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkIsAdmin: () => Promise<boolean>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('major');
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const checkIsAdmin = async (): Promise<boolean> => {
    const currentUser = user || (await supabase.auth.getUser()).data.user;
    if (!currentUser) return false;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .eq('role', 'admin')
      .maybeSingle();

    const adminStatus = !!data;
    setIsAdmin(adminStatus);
    return adminStatus;
  };

  const checkSubscription = useCallback(async () => {
    const currentSession = session || (await supabase.auth.getSession()).data.session;
    if (!currentSession) {
      setIsSubscribed(false);
      setSubscriptionTier('major'); // Default for non-logged users
      setSubscriptionLoading(false);
      return;
    }

    try {
      // First check if user signed up via invite (free account)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('signed_up_via_invite')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      const signedUpViaInvite = profileData?.signed_up_via_invite || false;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
        // If signed up via invite and no subscription = free_invite tier
        // Otherwise, existing users default to major
        setSubscriptionTier(signedUpViaInvite ? 'free_invite' : 'major');
      } else {
        const subscribed = data?.subscribed || false;
        const productId = data?.product_id || null;
        setIsSubscribed(subscribed);
        
        if (subscribed && productId) {
          // Map Stripe product_id to tier
          if (productId === STRIPE_PRODUCTS.major.product_id) {
            setSubscriptionTier('major');
          } else if (productId === STRIPE_PRODUCTS.student.product_id) {
            setSubscriptionTier('student');
          } else {
            // Unknown product, default to major for safety
            setSubscriptionTier('major');
          }
        } else if (signedUpViaInvite) {
          // Free invite account (no subscription)
          setSubscriptionTier('free_invite');
        } else {
          // Existing users without subscription = major (grandfathered)
          setSubscriptionTier('major');
        }
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setIsSubscribed(false);
      setSubscriptionTier('major');
    } finally {
      setSubscriptionLoading(false);
    }
  }, [session]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check admin status after auth change
        if (session?.user) {
          setTimeout(() => {
            checkIsAdmin();
            checkSubscription();
          }, 0);
        } else {
          setIsAdmin(false);
          setIsSubscribed(false);
          setSubscriptionLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        checkIsAdmin();
        checkSubscription();
      } else {
        setSubscriptionLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsSubscribed(false);
    setSubscriptionTier('major');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isAdmin, 
      isSubscribed,
      subscriptionTier,
      subscriptionLoading,
      signUp, 
      signIn, 
      signOut, 
      checkIsAdmin,
      checkSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
