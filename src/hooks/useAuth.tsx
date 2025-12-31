import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { STRIPE_PRODUCTS } from '@/config/stripe';

export type SubscriptionTier = 'free' | 'student' | 'major' | null;

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
  checkSubscription: () => Promise<
    | {
        subscribed: boolean;
        product_id?: string | null;
        subscription_end?: string | null;
        subscription_status?: string | null;
      }
    | null
  >;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache for subscription data to avoid redundant calls
const subscriptionCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const subscriptionCheckInProgress = useRef(false);

  const checkIsAdmin = useCallback(async (): Promise<boolean> => {
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
  }, [user]);

  const checkSubscription = useCallback(async () => {
    const currentSession = session || (await supabase.auth.getSession()).data.session;

    if (!currentSession) {
      setIsSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionLoading(false);
      return null;
    }

    // Prevent duplicate concurrent calls
    if (subscriptionCheckInProgress.current) {
      return null;
    }

    // Check cache first
    const cacheKey = currentSession.user.id;
    const cached = subscriptionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const data = cached.data;
      const subscribed = data?.subscribed || false;
      const isLifetime = data?.is_lifetime || false;
      setIsSubscribed(subscribed || isLifetime);
      if (isLifetime && data?.lifetime_tier === 'major') {
        setSubscriptionTier('major');
      } else if (subscribed && data?.product_id) {
        setSubscriptionTier(data.product_id === STRIPE_PRODUCTS.major ? 'major' : 'student');
      } else {
        setSubscriptionTier(subscribed ? 'student' : null);
      }
      setSubscriptionLoading(false);
      return data;
    }

    subscriptionCheckInProgress.current = true;
    setSubscriptionLoading(true);

    try {
      // First check for lifetime tier in profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('lifetime_tier')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      if (profileData?.lifetime_tier) {
        const lifetimeData = {
          subscribed: true,
          is_lifetime: true,
          lifetime_tier: profileData.lifetime_tier,
          product_id: null,
          subscription_end: null,
        };
        subscriptionCache.set(cacheKey, { data: lifetimeData, timestamp: Date.now() });
        setIsSubscribed(true);
        setSubscriptionTier(profileData.lifetime_tier as SubscriptionTier);
        setSubscriptionLoading(false);
        subscriptionCheckInProgress.current = false;
        return lifetimeData;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
        setSubscriptionTier(null);
        return null;
      }

      // Cache the result
      subscriptionCache.set(cacheKey, { data, timestamp: Date.now() });

      const subscribed = data?.subscribed || false;
      setIsSubscribed(subscribed);

      // Determine tier from product_id
      if (subscribed && data?.product_id) {
        if (data.product_id === STRIPE_PRODUCTS.major) {
          setSubscriptionTier('major');
        } else if (data.product_id === STRIPE_PRODUCTS.student) {
          setSubscriptionTier('student');
        } else {
          setSubscriptionTier('student');
        }
      } else {
        setSubscriptionTier(subscribed ? 'student' : null);
      }

      return data ?? { subscribed };
    } catch (err) {
      console.error('Error checking subscription:', err);
      setIsSubscribed(false);
      setSubscriptionTier(null);
      return null;
    } finally {
      setSubscriptionLoading(false);
      subscriptionCheckInProgress.current = false;
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
          setSubscriptionTier(null);
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

  const signUp = useCallback(async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    // Clear cache on sign out
    subscriptionCache.clear();
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsSubscribed(false);
    setSubscriptionTier(null);
  }, []);

  const refreshSubscription = useCallback(async () => {
    // Clear cache to force fresh data
    if (session?.user?.id) {
      subscriptionCache.delete(session.user.id);
    }
    subscriptionCheckInProgress.current = false;
    await checkSubscription();
  }, [session, checkSubscription]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
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
    checkSubscription,
    refreshSubscription
  }), [user, session, loading, isAdmin, isSubscribed, subscriptionTier, subscriptionLoading, signUp, signIn, signOut, checkIsAdmin, checkSubscription, refreshSubscription]);

  return (
    <AuthContext.Provider value={contextValue}>
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
