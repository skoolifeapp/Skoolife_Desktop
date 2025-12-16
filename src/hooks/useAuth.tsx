import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Stripe product IDs mapping
const STRIPE_PRODUCTS = {
  student: 'prod_Tbz5HgJWHbElHU',
  major: 'prod_Tbz59WmKmYF5Jk',
};

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
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
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
      setSubscriptionTier(null);
      setSubscriptionLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`
        }
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
        setSubscriptionTier(null);
      } else {
        const subscribed = data?.subscribed || false;
        setIsSubscribed(subscribed);
        
        // Determine tier from product_id
        if (subscribed && data?.product_id) {
          if (data.product_id === STRIPE_PRODUCTS.major) {
            setSubscriptionTier('major');
          } else if (data.product_id === STRIPE_PRODUCTS.student) {
            setSubscriptionTier('student');
          } else {
            setSubscriptionTier('student'); // Default to student if unknown product
          }
        } else {
          setSubscriptionTier(subscribed ? 'student' : null);
        }
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setIsSubscribed(false);
      setSubscriptionTier(null);
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
    setSubscriptionTier(null);
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
