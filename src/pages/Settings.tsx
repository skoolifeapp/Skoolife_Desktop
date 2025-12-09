import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, User, Clock, Settings as SettingsIcon, Loader2, RotateCcw, GraduationCap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/assets/logo.png';
import SupportButton from '@/components/SupportButton';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 0, label: 'Dim' },
];

const LEVELS = [
  'Lycée',
  'BTS',
  'BUT',
  'Licence',
  'Master',
  'Prépa',
  'Concours',
  'Autre',
];

const EXAM_PERIODS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  school: string;
  level: string;
  main_exam_period: string;
  weekly_revision_hours: number;
}

interface PreferencesData {
  preferred_days_of_week: number[];
  daily_start_time: string;
  daily_end_time: string;
  max_hours_per_day: number;
  session_duration_minutes: number;
  avoid_late_evening: boolean;
  avoid_early_morning: boolean;
  notes: string;
}

const SESSION_DURATIONS = [
  { value: 45, label: '45 min' },
  { value: 60, label: '1h' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2h' },
];

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    school: '',
    level: '',
    main_exam_period: '',
    weekly_revision_hours: 10,
  });

  const [preferences, setPreferences] = useState<PreferencesData>({
    preferred_days_of_week: [1, 2, 3, 4, 5],
    daily_start_time: '08:00',
    daily_end_time: '22:00',
    max_hours_per_day: 4,
    session_duration_minutes: 90,
    avoid_late_evening: false,
    avoid_early_morning: false,
    notes: '',
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || user.email || '',
          school: profileData.school || '',
          level: profileData.level || '',
          main_exam_period: profileData.main_exam_period || '',
          weekly_revision_hours: profileData.weekly_revision_hours || 10,
        });
      }

      // Fetch preferences
      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (prefsData) {
        setPreferences({
          preferred_days_of_week: prefsData.preferred_days_of_week || [1, 2, 3, 4, 5],
          daily_start_time: prefsData.daily_start_time || '08:00',
          daily_end_time: prefsData.daily_end_time || '22:00',
          max_hours_per_day: prefsData.max_hours_per_day || 4,
          session_duration_minutes: (prefsData as any).session_duration_minutes || 90,
          avoid_late_evening: prefsData.avoid_late_evening || false,
          avoid_early_morning: prefsData.avoid_early_morning || false,
          notes: prefsData.notes || '',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          school: profile.school,
          level: profile.level,
          main_exam_period: profile.main_exam_period,
          weekly_revision_hours: profile.weekly_revision_hours,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profil enregistré avec succès');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde du profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    // Validate times
    if (preferences.daily_start_time >= preferences.daily_end_time) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    setSavingPreferences(true);
    try {
      // Upsert preferences
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_days_of_week: preferences.preferred_days_of_week,
          daily_start_time: preferences.daily_start_time,
          daily_end_time: preferences.daily_end_time,
          max_hours_per_day: preferences.max_hours_per_day,
          session_duration_minutes: preferences.session_duration_minutes,
          avoid_late_evening: preferences.avoid_late_evening,
          avoid_early_morning: preferences.avoid_early_morning,
          notes: preferences.notes,
        } as any, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      toast.success('Préférences enregistrées avec succès');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde des préférences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleResetOnboarding = async () => {
    if (!user) return;

    setResettingOnboarding(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_onboarding_complete: false })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Onboarding réinitialisé');
      navigate('/onboarding');
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la réinitialisation");
    } finally {
      setResettingOnboarding(false);
    }
  };

  const toggleDay = (day: number) => {
    setPreferences(prev => ({
      ...prev,
      preferred_days_of_week: prev.preferred_days_of_week.includes(day)
        ? prev.preferred_days_of_week.filter(d => d !== day)
        : [...prev.preferred_days_of_week, day].sort((a, b) => a - b)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold text-foreground">Skoolife</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Planning
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/subjects">
                <GraduationCap className="w-4 h-4 mr-2" />
                Matières
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profil & paramètres</h1>
          <p className="text-muted-foreground">
            Gère ton profil et tes préférences de révisions
          </p>
        </div>

        {/* Section 1: Profile */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Tes informations de base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  placeholder="Ton prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  placeholder="Ton nom"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">Établissement / école</Label>
              <Input
                id="school"
                value={profile.school}
                onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                placeholder="Ex: Université Paris-Saclay"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Niveau d'études</Label>
                <Select
                  value={profile.level}
                  onValueChange={(value) => setProfile({ ...profile, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionne ton niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Période principale d'examens</Label>
                <Select
                  value={profile.main_exam_period}
                  onValueChange={(value) => setProfile({ ...profile, main_exam_period: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mois des examens" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_PERIODS.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Objectif d'heures de révision / semaine : {profile.weekly_revision_hours}h</Label>
              <Slider
                value={[profile.weekly_revision_hours]}
                onValueChange={(value) => setProfile({ ...profile, weekly_revision_hours: value[0] })}
                min={2}
                max={40}
                step={1}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">
                Entre 2h et 40h par semaine
              </p>
            </div>

            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer mon profil
            </Button>
          </CardContent>
        </Card>

        {/* Section 2: Revision Preferences */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Préférences de révisions
            </CardTitle>
            <CardDescription>
              Configure quand et comment tu veux réviser. Ces préférences seront prises en compte lors de la prochaine génération de planning.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Jours de révision préférés</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={preferences.preferred_days_of_week.includes(day.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDay(day.value)}
                    className="min-w-[48px]"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Heure de début</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={preferences.daily_start_time}
                  onChange={(e) => setPreferences({ ...preferences, daily_start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">Heure de fin</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={preferences.daily_end_time}
                  onChange={(e) => setPreferences({ ...preferences, daily_end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Heures max par jour : {preferences.max_hours_per_day}h</Label>
              <Slider
                value={[preferences.max_hours_per_day]}
                onValueChange={(value) => setPreferences({ ...preferences, max_hours_per_day: value[0] })}
                min={1}
                max={10}
                step={1}
                className="py-4"
              />
            </div>

            <div className="space-y-2">
              <Label>Durée des sessions de révision</Label>
              <Select
                value={String(preferences.session_duration_minutes)}
                onValueChange={(value) => setPreferences({ ...preferences, session_duration_minutes: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisis la durée" />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_DURATIONS.map((duration) => (
                    <SelectItem key={duration.value} value={String(duration.value)}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Durée de chaque session de révision générée
              </p>
            </div>

            <div className="space-y-4">
              <Label>Préférences supplémentaires</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="avoid_early"
                  checked={preferences.avoid_early_morning}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, avoid_early_morning: checked as boolean })
                  }
                />
                <label
                  htmlFor="avoid_early"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Pas de révisions tôt le matin (avant 9h)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="avoid_late"
                  checked={preferences.avoid_late_evening}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, avoid_late_evening: checked as boolean })
                  }
                />
                <label
                  htmlFor="avoid_late"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Pas de révisions tard le soir (après 21h)
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Remarques / contraintes particulières</Label>
              <Textarea
                id="notes"
                value={preferences.notes}
                onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
                placeholder="Ex: Je travaille le mercredi après-midi, je préfère les sessions courtes..."
                rows={3}
              />
            </div>

            <Button onClick={handleSavePreferences} disabled={savingPreferences}>
              {savingPreferences && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer mes préférences
            </Button>
          </CardContent>
        </Card>

        {/* Section 3: Advanced Options */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              Options avancées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Réinitialise l'onboarding pour reconfigurer ton profil et tes matières depuis le début.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Réinitialiser l'onboarding
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Réinitialiser l'onboarding ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tu seras redirigé vers l'onboarding pour reconfigurer ton profil et tes matières. 
                      Tes données actuelles ne seront pas supprimées, mais tu pourras les modifier.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetOnboarding}
                      disabled={resettingOnboarding}
                    >
                      {resettingOnboarding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirmer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Support Button */}
        <SupportButton />
      </main>
    </div>
  );
};

export default Settings;
