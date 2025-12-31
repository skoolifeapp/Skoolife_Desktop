import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { User, Loader2, CheckCircle2, School } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';
const LOGO_URL = '/logo.png';

const LEVELS = [
  'Lycée - Seconde',
  'Lycée - Première',
  'Lycée - Terminale',
  'BTS',
  'BUT',
  'Licence 1',
  'Licence 2',
  'Licence 3',
  'Master 1',
  'Master 2',
  'Prépa',
  'Concours',
  'Autre'
];

const EXAM_PERIODS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Septembre',
  'Décembre'
];

const STUDY_DOMAINS: Record<string, string[]> = {
  'Sciences & Technologie': [
    'Mathématiques',
    'Physique',
    'Chimie',
    'Biologie',
    'Informatique / Science des données',
    'Génie / Ingénierie'
  ],
  'Médecine & Santé': [
    'Médecine générale',
    'Pharmacie',
    'Psychologie / Santé mentale',
    'Soins infirmiers / Kinésithérapie',
    'Nutrition / Diététique'
  ],
  'Sciences Sociales & Humaines': [
    'Histoire',
    'Géographie',
    'Sociologie',
    'Philosophie',
    'Éducation / Pédagogie',
    'Communication / Médias'
  ],
  'Économie & Gestion': [
    'Économie',
    'Finance',
    'Marketing',
    'Gestion / Management',
    'Commerce international',
    'Entrepreneuriat / Innovation'
  ],
  'Arts & Lettres': [
    'Littérature / Langues',
    'Musique',
    'Arts visuels / Design',
    'Théâtre / Arts de la scène',
    'Cinéma / Audiovisuel',
    'Histoire de l\'art'
  ],
  'Droit & Sciences Politiques': [
    'Droit civil / pénal / international',
    'Droit des affaires / du travail',
    'Criminologie',
    'Administration publique',
    'Relations internationales'
  ],
  'Environnement & Agriculture': [
    'Écologie / Sciences environnementales',
    'Agronomie / Horticulture',
    'Gestion forestière',
    'Sciences marines',
    'Agroalimentaire'
  ],
  'Informatique & Technologies émergentes': [
    'Cybersécurité',
    'Intelligence artificielle / Machine Learning',
    'Réalité virtuelle / augmentée',
    'Blockchain / Cryptomonnaies',
    'Internet des objets (IoT)'
  ],
  'Design & Architecture': [
    'Design graphique',
    'Architecture',
    'Design industriel',
    'Design d\'intérieur',
    'Audiovisuel / Multimédia'
  ],
  'Sport & Bien-être': [
    'Sport / Éducation physique',
    'Santé et remise en forme',
    'Kinésithérapie / Physiothérapie',
    'Nutrition sportive',
    'Psychologie du sport'
  ]
};

const Onboarding = () => {
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // User data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [school, setSchool] = useState('');
  const [level, setLevel] = useState('');
  const [studyDomain, setStudyDomain] = useState('');
  const [studySubcategory, setStudySubcategory] = useState('');
  const [examPeriod, setExamPeriod] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolCodeValidating, setSchoolCodeValidating] = useState(false);
  const [hasSchoolCode, setHasSchoolCode] = useState(false);

  useEffect(() => {
    // Important: ne pas rediriger tant que l'auth n'est pas initialisée
    if (authLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    // Admin redirect by email
    if (user.email === 'skoolife.co@gmail.com') {
      navigate('/admin');
      return;
    }

    // Check if onboarding is already complete
    const checkProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_onboarding_complete, first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();

      const pendingInviteToken = localStorage.getItem('pending_invite_token');

      if (data?.is_onboarding_complete) {
        // If user came from an invite flow, continue it instead of sending them to /app
        if (pendingInviteToken) {
          navigate(`/invite/${pendingInviteToken}`);
        } else {
          navigate('/app');
        }
      } else if (data?.first_name) {
        setFirstName(data.first_name);
        setLastName(data.last_name || '');
      }
      setCheckingProfile(false);
    };

    checkProfile();
  }, [user, authLoading, navigate]);

  const handleFinish = async () => {
    if (!user) return;
    
    if (!firstName.trim()) {
      toast.error('Entre ton prénom');
      return;
    }
    
    setLoading(true);

    try {
      const now = new Date().toISOString();
      let hasValidSchoolCode = false;
      let schoolName = school;

      // If user entered a school code, validate it
      if (hasSchoolCode && schoolCode.trim()) {
        setSchoolCodeValidating(true);
        const { data: codeResult, error: codeError } = await supabase
          .rpc('use_access_code', { 
            p_code: schoolCode.trim(), 
            p_user_id: user.id 
          });

        if (codeError) {
          console.error('Error validating school code:', codeError);
          toast.error('Erreur lors de la validation du code');
          setLoading(false);
          setSchoolCodeValidating(false);
          return;
        }

        const result = codeResult as { success: boolean; error?: string; school_name?: string } | null;
        
        if (!result?.success) {
          toast.error(result?.error || 'Code invalide');
          setLoading(false);
          setSchoolCodeValidating(false);
          return;
        }

        hasValidSchoolCode = true;
        schoolName = result.school_name || school;
        toast.success(`Bienvenue ! Tu as été ajouté à ${result.school_name}`);
        setSchoolCodeValidating(false);
      }

      // Upsert profile (create if not exists, update if exists)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          school: schoolName,
          level,
          study_domain: studyDomain,
          study_subcategory: studySubcategory,
          main_exam_period: examPeriod,
          is_onboarding_complete: true,
          marketing_emails_optin: marketingOptIn,
          marketing_optin_at: marketingOptIn ? now : null
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      const pendingInviteToken = localStorage.getItem('pending_invite_token');
      if (pendingInviteToken) {
        navigate(`/invite/${pendingInviteToken}`);
      } else if (hasValidSchoolCode) {
        // User has school access, go directly to app
        navigate('/app');
      } else {
        // No school code, redirect to pricing
        navigate('/pricing');
      }
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={LOGO_URL} alt="Skoolife" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold text-foreground">Skoolife</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-20">
        {/* About you */}
        <Card className="border-0 shadow-lg animate-slide-up">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">À propos de toi</CardTitle>
            <CardDescription>
              Dis-nous en plus sur toi pour personnaliser ton expérience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  placeholder="Ton prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Ton nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">Établissement</Label>
              <Input
                id="school"
                placeholder="Nom de ton école/université"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Niveau d'études</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionne ton niveau" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Domaine d'études</Label>
              <Select 
                value={studyDomain} 
                onValueChange={(value) => {
                  setStudyDomain(value);
                  setStudySubcategory('');
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionne ton domaine" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(STUDY_DOMAINS).map((domain) => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {studyDomain && (
              <div className="space-y-2">
                <Label>Spécialité</Label>
                <Select value={studySubcategory} onValueChange={setStudySubcategory}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sélectionne ta spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDY_DOMAINS[studyDomain].map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Période principale d'examens</Label>
              <Select value={examPeriod} onValueChange={setExamPeriod}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Quand as-tu tes examens ?" />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* School code section */}
            <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
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
                  <Label htmlFor="schoolCode">Code école</Label>
                  <Input
                    id="schoolCode"
                    placeholder="Ex: ESCP-AB12"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                    className="h-12 font-mono tracking-wider"
                  />
                  <p className="text-xs text-muted-foreground">
                    Entre le code fourni par ton établissement pour accéder gratuitement à Skoolife
                  </p>
                </div>
              )}
            </div>

            {/* Marketing opt-in checkbox */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
              <Checkbox
                id="marketing-optin"
                checked={marketingOptIn}
                onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
                className="mt-0.5"
              />
              <label
                htmlFor="marketing-optin"
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                Nous pouvons vous envoyer : des e-mails d'informations/actualités (vous pouvez vous désinscrire à tout moment via le lien de désabonnement).
              </label>
            </div>

            <Button 
              variant="hero" 
              size="lg" 
              className="w-full" 
              onClick={handleFinish}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Commencer
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Motivational text */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Ton planning s'ajuste à ton rythme, pas l'inverse. ✨
        </p>
      </main>
    </div>
  );
};

export default Onboarding;
