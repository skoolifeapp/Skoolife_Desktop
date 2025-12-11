import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Loader2, CheckCircle2 } from 'lucide-react';
import logo from '@/assets/logo.png';

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

const Onboarding = () => {
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // User data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [school, setSchool] = useState('');
  const [level, setLevel] = useState('');
  const [examPeriod, setExamPeriod] = useState('');

  useEffect(() => {
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

      if (data?.is_onboarding_complete) {
        // Redirect to /today on mobile, /app on desktop
        const isMobile = window.innerWidth < 768;
        navigate(isMobile ? '/today' : '/app');
      } else if (data?.first_name) {
        setFirstName(data.first_name);
        setLastName(data.last_name || '');
      }
      setCheckingProfile(false);
    };

    checkProfile();
  }, [user, navigate]);

  const handleFinish = async () => {
    if (!user) return;
    
    if (!firstName.trim()) {
      toast.error('Entre ton prénom');
      return;
    }
    
    setLoading(true);

    try {
      // Upsert profile (create if not exists, update if exists)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          school,
          level,
          main_exam_period: examPeriod,
          is_onboarding_complete: true
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      // Redirect to /today on mobile, /app on desktop
      const isMobile = window.innerWidth < 768;
      navigate(isMobile ? '/today' : '/app');
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
          <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
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
