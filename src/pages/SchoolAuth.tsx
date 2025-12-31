import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Building2, User } from 'lucide-react';

const LOGO_URL = '/logo.png';

const SchoolAuth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Remplis tous les champs obligatoires');
      return;
    }

    if (!isLogin && !schoolName) {
      toast.error("Le nom de l'établissement est requis");
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou mot de passe incorrect');
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        // Check if user is a school admin
        const { data: membership } = await supabase
          .from('school_members')
          .select('school_id, role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin_school')
          .maybeSingle();

        if (membership?.school_id) {
          navigate('/schools/dashboard');
        } else {
          toast.error("Ce compte n'est pas associé à un établissement");
          await supabase.auth.signOut();
        }
      } else {
        // Signup flow - create user, school, and membership
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/schools/dashboard`,
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });
        
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            toast.error('Cet email est déjà utilisé');
          } else {
            toast.error(signUpError.message);
          }
          setLoading(false);
          return;
        }

        if (!authData.user) {
          toast.error('Erreur lors de la création du compte');
          setLoading(false);
          return;
        }

        // Wait for profile to be created by trigger
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update profile with name and consent
        const now = new Date().toISOString();
        await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            email: email,
            cgu_accepted_at: now,
            privacy_accepted_at: now,
            cgu_version: 'v1',
            privacy_version: 'v1',
            is_onboarding_complete: true
          })
          .eq('id', authData.user.id);

        // Create school + admin membership via backend function (avoids RLS recursion)
        const { data: schoolRes, error: schoolCreateError } = await supabase.functions.invoke('create-school', {
          body: { schoolName }
        });

        if (schoolCreateError || !schoolRes?.schoolId) {
          console.error('Create school function error:', schoolCreateError);
          toast.error("Erreur lors de la création de l'établissement");
          setLoading(false);
          return;
        }

        toast.success('Compte créé avec succès !');
        navigate('/schools/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/schools" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={LOGO_URL} alt="Skoolife" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold text-foreground">Skoolife</span>
          <span className="text-sm font-medium text-primary ml-1">Écoles</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Hero text */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {isLogin ? 'Espace Établissement' : 'Inscrivez votre école'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isLogin 
                ? 'Accédez à votre tableau de bord' 
                : 'Créez un compte pour gérer vos élèves'}
            </p>
          </div>

          {/* Auth card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                {isLogin ? 'Connexion' : 'Créer un compte école'}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Entrez vos identifiants administrateur' 
                  : 'Renseignez les informations de votre établissement'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">Nom de l'établissement *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="schoolName"
                          type="text"
                          placeholder="Lycée Victor Hugo"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="pl-10 h-12"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="Marie"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="pl-10 h-12"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Dupont"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="h-12"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@etablissement.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
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
                      {isLogin ? 'Se connecter' : "Créer mon espace école"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

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
                    ? "Pas encore inscrit ? Créer un compte" 
                    : 'Déjà inscrit ? Se connecter'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Back link */}
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/schools" className="text-primary hover:underline">
              ← Retour à la page écoles
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SchoolAuth;
