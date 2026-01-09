import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, School } from 'lucide-react';
const LOGO_URL = '/logo.png';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const redirectUrl = searchParams.get('redirect');
  
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(false);
  const [hasSchoolCode, setHasSchoolCode] = useState(false);
  const [schoolCode, setSchoolCode] = useState('');
  const { signIn, signUp, user, checkIsAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      if (user) {
        setCheckingRedirect(true);
        
        // Admin check by email - simple redirect
        if (user.email === 'skoolife.co@gmail.com') {
          navigate('/admin');
          setCheckingRedirect(false);
          return;
        }
        
        // If there's a redirect URL (e.g., invite page), go there first
        if (redirectUrl) {
          navigate(redirectUrl);
          setCheckingRedirect(false);
          return;
        }
        
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_onboarding_complete')
          .eq('id', user.id)
          .single();
        
        if (profile?.is_onboarding_complete) {
          // User already onboarded, go to app
          navigate('/app');
        } else {
          // Check if user has school access (free via school code)
          const schoolAccessGranted = localStorage.getItem('school_access_granted') === 'true';
          
          // Also check if user is a school member in the database
          const { data: schoolMember } = await supabase
            .from('school_members')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();
          
          if (schoolAccessGranted || schoolMember) {
            // School user: skip pricing, go directly to onboarding
            navigate('/onboarding');
          } else {
            // New user without school: send to pricing page to select subscription
            navigate('/pricing');
          }
        }
        
        setCheckingRedirect(false);
      }
    };
    handleRedirect();
  }, [user, navigate, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Remplis tous les champs');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou mot de passe incorrect');
          } else {
            toast.error(error.message);
          }
        }
      } else {
        // If user has a school code, pre-set the flag so redirect logic goes to onboarding
        if (hasSchoolCode && schoolCode.trim()) {
          localStorage.setItem('pending_school_code', schoolCode.trim());
          localStorage.setItem('school_access_granted', 'true');
        }

        const { error } = await signUp(email, password);
        if (error) {
          // Clear the flags if signup fails
          localStorage.removeItem('pending_school_code');
          localStorage.removeItem('school_access_granted');
          
          if (error.message.includes('already registered')) {
            toast.error('Cet email est déjà utilisé');
          } else {
            toast.error(error.message);
          }
        } else {
          // On signup success, validate school code and update profile
          setTimeout(async () => {
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) {
              const now = new Date().toISOString();
              
              // If user has a pending school code, validate it
              const pendingCode = localStorage.getItem('pending_school_code');
              if (pendingCode) {
                const { data: codeResult, error: codeError } = await supabase
                  .rpc('use_access_code', { 
                    p_code: pendingCode, 
                    p_user_id: newUser.id 
                  });

                localStorage.removeItem('pending_school_code');

                if (codeError) {
                  console.error('Error validating school code:', codeError);
                  localStorage.removeItem('school_access_granted');
                } else {
                  const result = codeResult as { success: boolean; error?: string; school_name?: string } | null;
                  if (result?.success) {
                    localStorage.setItem('school_name', result.school_name || '');
                    toast.success(`Bienvenue ! Tu as été ajouté à ${result.school_name}`);
                  } else {
                    localStorage.removeItem('school_access_granted');
                    toast.error(result?.error || 'Code école invalide');
                  }
                }
              }

              await supabase
                .from('profiles')
                .update({
                  cgu_accepted_at: now,
                  privacy_accepted_at: now,
                  cgu_version: 'v1',
                  privacy_version: 'v1'
                })
                .eq('id', newUser.id);
            }
          }, 1000);
        }
      }
    } catch (err) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={LOGO_URL} alt="Skoolife" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold text-foreground">Skoolife</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Hero text */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {isLogin ? 'Content de te revoir !' : 'Rejoins Skoolife'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isLogin 
                ? 'Connecte-toi pour accéder à ton planning' 
                : 'Organise tes révisions intelligemment'}
            </p>
          </div>

          {/* Auth card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                {isLogin ? 'Connexion' : 'Créer un compte'}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Entre tes identifiants pour continuer' 
                  : 'Commence à organiser tes révisions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full mb-4 h-12"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  // Use custom domain in production, otherwise use current origin
                  const baseUrl = window.location.hostname.includes('skoolife.fr') 
                    ? 'https://app.skoolife.fr' 
                    : window.location.origin;
                  // Always redirect to /auth so the useEffect handles proper routing to /pricing
                  const finalRedirect = redirectUrl ? `${baseUrl}${redirectUrl}` : `${baseUrl}/auth`;
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: finalRedirect,
                    },
                  });
                  if (error) {
                    toast.error('Erreur de connexion Google');
                    setLoading(false);
                  }
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ton@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Se connecter' : "S'inscrire"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                {/* School code field - only show on signup */}
                {!isLogin && (
                  <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="has-school-code"
                        checked={hasSchoolCode}
                        onCheckedChange={(checked) => setHasSchoolCode(checked === true)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor="has-school-code"
                        className="text-sm text-foreground leading-relaxed cursor-pointer flex items-center gap-2"
                      >
                        <School className="w-4 h-4 text-primary" />
                        Mon école m'a fourni un code d'accès
                      </label>
                    </div>
                    
                    {hasSchoolCode && (
                      <div className="space-y-2 pl-6">
                        <Input
                          id="schoolCode"
                          placeholder="Ex: ESCP-AB12"
                          value={schoolCode}
                          onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                          className="h-10 font-mono tracking-wider"
                          disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                          Accède gratuitement à Skoolife via ton établissement
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* CGU/Privacy mention - only show on signup */}
                {!isLogin && (
                  <p className="text-xs text-muted-foreground text-center leading-relaxed pt-2">
                    En créant un compte, j'accepte les{' '}
                    <Link to="/legal" className="text-primary hover:underline font-medium">
                      CGU
                    </Link>{' '}
                    et la{' '}
                    <Link to="/privacy" className="text-primary hover:underline font-medium">
                      Politique de Confidentialité
                    </Link>.
                  </p>
                )}
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin 
                    ? "Pas encore de compte ? S'inscrire" 
                    : 'Déjà un compte ? Se connecter'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Motivational text */}
          <p className="text-center text-sm text-muted-foreground">
            Tu n'es plus seul avec tes révisions.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
