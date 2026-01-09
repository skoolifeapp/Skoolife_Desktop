import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building2, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const LOGO_URL = '/logo.png';

const SCHOOL_TYPES = [
  { value: 'prepa', label: 'Classe préparatoire' },
  { value: 'ecole_commerce', label: 'École de commerce' },
  { value: 'ecole_ingenieur', label: 'École d\'ingénieurs' },
  { value: 'universite', label: 'Université' },
  { value: 'bts_iut', label: 'BTS / IUT' },
  { value: 'autre', label: 'Autre' },
];

const SchoolSignup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolType: '',
  });

  const generateDemoCredentials = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    return {
      email: `demo-${randomId}@skoolife.test`,
      password: `Demo${randomId}!2024`,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolName) {
      toast.error('Veuillez entrer le nom de votre établissement');
      return;
    }

    setLoading(true);

    try {
      // Generate demo credentials
      const { email, password } = generateDemoCredentials();

      // Step 1: Create demo user account
      const { error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        console.error('Signup error:', signUpError);
        toast.error('Erreur lors de la création du compte démo');
        setLoading(false);
        return;
      }

      // Wait for auth session to be fully established
      let attempts = 0;
      let newUser = null;
      
      while (attempts < 15 && !newUser) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          newUser = session.user;
        }
        attempts++;
      }
      
      if (!newUser) {
        toast.error('Erreur lors de la création du compte. Veuillez réessayer.');
        setLoading(false);
        return;
      }

      // Step 2: Create the school with trial subscription
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: formData.schoolName,
          contact_email: email,
          school_type: formData.schoolType || null,
          subscription_tier: 'demo',
          subscription_start_date: new Date().toISOString().split('T')[0],
          subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_active: true,
        })
        .select()
        .single();

      if (schoolError) {
        console.error('School creation error:', schoolError);
        toast.error('Erreur lors de la création de l\'établissement');
        setLoading(false);
        return;
      }

      // Step 3: Add user as school admin
      const { error: memberError } = await supabase
        .from('school_members')
        .insert({
          school_id: school.id,
          user_id: newUser.id,
          role: 'admin_school',
          is_active: true,
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        toast.error('Erreur lors de la configuration du compte');
        setLoading(false);
        return;
      }

      // Step 4: Update profile
      await supabase
        .from('profiles')
        .update({
          is_onboarding_complete: true,
          cgu_accepted_at: new Date().toISOString(),
          privacy_accepted_at: new Date().toISOString(),
        })
        .eq('id', newUser.id);

      // Success - redirect to school dashboard
      toast.success('Bienvenue sur votre espace établissement !');
      navigate('/school');

    } catch (error) {
      console.error('Error:', error);
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              Accès immédiat
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Testez Skoolife
            </h1>
            <p className="text-muted-foreground text-lg">
              Découvrez la plateforme en 30 secondes
            </p>
          </div>

          {/* Signup card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Votre établissement
              </CardTitle>
              <CardDescription>
                Un seul champ et c'est parti !
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nom de l'établissement</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="schoolName"
                      placeholder="Ex: ESCP Business School"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="pl-10 h-12"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolType">Type (optionnel)</Label>
                  <Select
                    value={formData.schoolType}
                    onValueChange={(value) => setFormData({ ...formData, schoolType: value })}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      Tester maintenant
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center leading-relaxed pt-2">
                  En testant, j'accepte les{' '}
                  <Link to="/legal" className="text-primary hover:underline font-medium">
                    CGU
                  </Link>{' '}
                  et la{' '}
                  <Link to="/privacy" className="text-primary hover:underline font-medium">
                    Politique de Confidentialité
                  </Link>.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">0€</p>
              <p className="text-xs text-muted-foreground">Gratuit</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">30s</p>
              <p className="text-xs text-muted-foreground">Pour tester</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground">Fonctionnalités</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchoolSignup;
