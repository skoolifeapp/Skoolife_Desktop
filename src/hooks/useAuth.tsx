import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { STRIPE_PRODUCTS } from '@/config/stripe';

export type SubscriptionTier = 'free' | 'student' | 'major' | null;

export interface TrialInfo {
  isTrialing: boolean;
  trialExpired: boolean;
  selectedTier: 'student' | 'major' | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  daysRemaining: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionLoading: boolean;
  trialInfo: TrialInfo;
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

const TRIAL_DURATION_DAYS = 7;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({
    isTrialing: false,
    trialExpired: false,
    selectedTier: null,
    trialStartedAt: null,
    trialEndsAt: null,
    daysRemaining: null,
  });
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
      setTrialInfo({
        isTrialing: false,
        trialExpired: false,
        selectedTier: null,
        trialStartedAt: null,
        trialEndsAt: null,
        daysRemaining: null,
      });
      return null;
    }

    // Prevent duplicate concurrent calls
    if (subscriptionCheckInProgress.current) {
      return null;
    }

    subscriptionCheckInProgress.current = true;
    setSubscriptionLoading(true);

    try {
      // First check for lifetime tier in profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('lifetime_tier, selected_tier, trial_started_at')
        .eq('id', currentSession.user.id)
        .maybeSingle();

      // Calculate trial status
      const calculateTrialInfo = (selectedTier: string | null, trialStartedAt: string | null): TrialInfo => {
        if (!trialStartedAt) {
          return {
            isTrialing: false,
            trialExpired: false,
            selectedTier: (selectedTier as 'student' | 'major') || null,
            trialStartedAt: null,
            trialEndsAt: null,
            daysRemaining: null,
          };
        }

        const startDate = new Date(trialStartedAt);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const trialExpired = now > endDate;

        return {
          isTrialing: !trialExpired,
          trialExpired,
          selectedTier: (selectedTier as 'student' | 'major') || 'student',
          trialStartedAt,
          trialEndsAt: endDate.toISOString(),
          daysRemaining: trialExpired ? 0 : daysRemaining,
        };
      };

      if (profileData?.lifetime_tier) {
        const lifetimeData = {
          subscribed: true,
          is_lifetime: true,
          lifetime_tier: profileData.lifetime_tier,
          product_id: null,
          subscription_end: null,
        };
        setIsSubscribed(true);
        setSubscriptionTier(profileData.lifetime_tier as SubscriptionTier);
        setTrialInfo({
          isTrialing: false,
          trialExpired: false,
          selectedTier: null,
          trialStartedAt: null,
          trialEndsAt: null,
          daysRemaining: null,
        });
        setSubscriptionLoading(false);
        subscriptionCheckInProgress.current = false;
        return lifetimeData;
      }

      // Check for school membership (free Major access)
      const { data: schoolMembership } = await supabase
        .from('school_members')
        .select('school_id')
        .eq('user_id', currentSession.user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (schoolMembership?.school_id) {
        const schoolAccessData = {
          subscribed: true,
          is_school_access: true,
          school_id: schoolMembership.school_id,
          product_id: null,
          subscription_end: null,
        };
        setIsSubscribed(true);
        setSubscriptionTier('major');
        setTrialInfo({
          isTrialing: false,
          trialExpired: false,
          selectedTier: null,
          trialStartedAt: null,
          trialEndsAt: null,
          daysRemaining: null,
        });
        setSubscriptionLoading(false);
        subscriptionCheckInProgress.current = false;
        return schoolAccessData;
      }

      // Check Stripe subscription
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });

      if (error) {
        console.error('Error checking subscription:', error);
        // If Stripe check fails, check trial status from profile
        const trialStatus = calculateTrialInfo(profileData?.selected_tier, profileData?.trial_started_at);
        setTrialInfo(trialStatus);
        
        if (trialStatus.isTrialing) {
          setIsSubscribed(true);
          setSubscriptionTier((trialStatus.selectedTier as SubscriptionTier) || 'student');
        } else {
          setIsSubscribed(false);
          setSubscriptionTier(null);
        }
        setSubscriptionLoading(false);
        subscriptionCheckInProgress.current = false;
        return null;
      }

      const subscribed = data?.subscribed || false;
      
      if (subscribed) {
        // Has active Stripe subscription
        setIsSubscribed(true);
        setTrialInfo({
          isTrialing: false,
          trialExpired: false,
          selectedTier: null,
          trialStartedAt: null,
          trialEndsAt: null,
          daysRemaining: null,
        });
        
        // Determine tier from product_id
        if (data?.product_id) {
          if (data.product_id === STRIPE_PRODUCTS.major) {
            setSubscriptionTier('major');
          } else if (data.product_id === STRIPE_PRODUCTS.student) {
            setSubscriptionTier('student');
          } else {
            setSubscriptionTier('student');
          }
        } else {
          setSubscriptionTier('student');
        }
      } else {
        // No Stripe subscription - check trial
        const trialStatus = calculateTrialInfo(profileData?.selected_tier, profileData?.trial_started_at);
        setTrialInfo(trialStatus);
        
        if (trialStatus.isTrialing) {
          setIsSubscribed(true);
          setSubscriptionTier((trialStatus.selectedTier as SubscriptionTier) || 'student');
        } else {
          setIsSubscribed(false);
          setSubscriptionTier(null);
        }
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
          setTrialInfo({
            isTrialing: false,
            trialExpired: false,
            selectedTier: null,
            trialStartedAt: null,
            trialEndsAt: null,
            daysRemaining: null,
          });
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
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsSubscribed(false);
    setSubscriptionTier(null);
    setTrialInfo({
      isTrialing: false,
      trialExpired: false,
      selectedTier: null,
      trialStartedAt: null,
      trialEndsAt: null,
      daysRemaining: null,
    });
  }, []);

  const refreshSubscription = useCallback(async () => {
    subscriptionCheckInProgress.current = false;
    await checkSubscription();
  }, [checkSubscription]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
    user, 
    session, 
    loading, 
    isAdmin, 
    isSubscribed,
    subscriptionTier,
    subscriptionLoading,
    trialInfo,
    signUp, 
    signIn, 
    signOut, 
    checkIsAdmin,
    checkSubscription,
    refreshSubscription
  }), [user, session, loading, isAdmin, isSubscribed, subscriptionTier, subscriptionLoading, trialInfo, signUp, signIn, signOut, checkIsAdmin, checkSubscription, refreshSubscription]);

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
