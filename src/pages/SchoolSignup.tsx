import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ErrorDialog } from '@/components/ErrorDialog';
import { Building2, ArrowRight, Loader2, Sparkles, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

const LOGO_URL = '/logo.png';

const SCHOOL_TYPES = [
  { value: 'prepa', label: 'Classe préparatoire' },
  { value: 'ecole_commerce', label: 'École de commerce' },
  { value: 'ecole_ingenieur', label: 'École d\'ingénieurs' },
  { value: 'universite', label: 'Université' },
  { value: 'bts_iut', label: 'BTS / IUT' },
  { value: 'autre', label: 'Autre' },
];

const schoolSignupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (min. 6 caractères)'),
  schoolName: z.string().trim().min(2, 'Nom trop court').max(120, 'Nom trop long'),
  schoolType: z.string().trim().max(60).optional(),
  contactName: z.string().trim().min(2, 'Nom trop court').optional(),
});

const SchoolSignup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({ open: false, title: '', message: '' });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    schoolName: '',
    schoolType: '',
    contactName: '',
  });

  const showError = (message: string, title: string = 'Erreur') => {
    setErrorDialog({ open: true, title, message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = schoolSignupSchema.safeParse(formData);

    if (!parsed.success) {
      showError(parsed.error.issues[0]?.message ?? 'Formulaire invalide');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the user account
      const { error: signUpError } = await signUp(formData.email, formData.password);
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          showError('Cet email est déjà utilisé. Connectez-vous via la page de connexion.', 'Email existant');
        } else {
          showError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // Wait for auth session to be established
      let user = null;
      let attempts = 0;
      while (attempts < 15 && !user) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) user = session.user;
        attempts++;
      }

      if (!user) {
        showError('Impossible de créer le compte. Veuillez réessayer.');
        setLoading(false);
        return;
      }

      // Step 2: Create the school with 14-day trial
      const schoolId = globalThis.crypto?.randomUUID?.() ?? (() => {
        const bytes = globalThis.crypto?.getRandomValues?.(new Uint8Array(16));
        if (!bytes) return null;
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      })();

      if (!schoolId) {
        showError('Impossible de générer un identifiant pour l\'établissement');
        setLoading(false);
        return;
      }

      const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { error: schoolError } = await supabase
        .from('schools')
        .insert({
          id: schoolId,
          name: parsed.data.schoolName,
          contact_email: formData.email,
          school_type: parsed.data.schoolType ?? null,
          subscription_tier: 'trial',
          subscription_start_date: new Date().toISOString().split('T')[0],
          subscription_end_date: trialEndDate,
          is_active: true,
        });

      if (schoolError) {
        console.error('School creation error:', schoolError);
        showError('Erreur lors de la création de l\'établissement');
        setLoading(false);
        return;
      }

      // Step 3: Add user as school admin
      const { error: memberError } = await supabase
        .from('school_members')
        .insert({
          school_id: schoolId,
          user_id: user.id,
          role: 'admin_school',
          is_active: true,
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        showError('Erreur lors de la configuration du compte');
        setLoading(false);
        return;
      }

      // Step 4: Update profile
      await supabase
        .from('profiles')
        .update({
          first_name: parsed.data.contactName || null,
          is_onboarding_complete: true,
          cgu_accepted_at: new Date().toISOString(),
          privacy_accepted_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Success - redirect to school dashboard
      toast.success('Bienvenue sur votre espace établissement !');
      navigate('/school');

    } catch (error) {
      console.error('Error:', error);
      showError('Une erreur est survenue');
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
              14 jours d'essai gratuit
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Créer votre compte
            </h1>
            <p className="text-muted-foreground text-lg">
              Accédez à votre espace établissement
            </p>
          </div>

          {/* Signup card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Informations
              </CardTitle>
              <CardDescription>
                Créez votre compte administrateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@etablissement.fr"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-12"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 h-12"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Contact Name */}
                <div className="space-y-2">
                  <Label htmlFor="contactName">Votre nom (optionnel)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="contactName"
                      placeholder="Jean Dupont"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="pl-10 h-12"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* School Name */}
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
                    />
                  </div>
                </div>

                {/* School Type */}
                <div className="space-y-2">
                  <Label htmlFor="schoolType">Type d'établissement (optionnel)</Label>
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
                      Créer mon compte
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

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
              </form>

              {/* Already have account */}
              <div className="mt-6 text-center">
                <Link 
                  to="/auth?space=school"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Déjà un compte ? Se connecter
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">14j</p>
              <p className="text-xs text-muted-foreground">Essai gratuit</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-xs text-muted-foreground">Fonctionnalités</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">0€</p>
              <p className="text-xs text-muted-foreground">Sans CB</p>
            </div>
          </div>
        </div>
      </main>

      <ErrorDialog 
        open={errorDialog.open} 
        onClose={() => setErrorDialog({ open: false, title: '', message: '' })}
        title={errorDialog.title}
        message={errorDialog.message}
      />
    </div>
  );
};

export default SchoolSignup;
