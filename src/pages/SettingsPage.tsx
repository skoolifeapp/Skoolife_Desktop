import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { User, Clock, Settings as SettingsIcon, Loader2, RotateCcw } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 0, label: 'Dim' },
];

const LEVELS = ['Lycée', 'BTS', 'BUT', 'Licence', 'Master', 'Prépa', 'Concours', 'Autre'];

const EXAM_PERIODS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const SESSION_DURATIONS = [
  { value: 45, label: '45 min' },
  { value: 60, label: '1h' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2h' },
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

const SettingsPage = () => {
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
      toast.success('Profil enregistré');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    if (preferences.daily_start_time >= preferences.daily_end_time) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    setSavingPreferences(true);
    try {
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
      toast.success('Préférences enregistrées');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde');
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
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Paramètres</h1>
            <p className="text-sm text-muted-foreground">Gère ton profil et tes préférences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="preferences">Révisions</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input
                      id="first_name"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom</Label>
                    <Input
                      id="last_name"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">Établissement / école</Label>
                  <Input
                    id="school"
                    value={profile.school}
                    onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Niveau d'études</Label>
                    <Select value={profile.level} onValueChange={(value) => setProfile({ ...profile, level: value })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionne" /></SelectTrigger>
                      <SelectContent>
                        {LEVELS.map((level) => (<SelectItem key={level} value={level}>{level}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Période d'examens</Label>
                    <Select value={profile.main_exam_period} onValueChange={(value) => setProfile({ ...profile, main_exam_period: value })}>
                      <SelectTrigger><SelectValue placeholder="Mois" /></SelectTrigger>
                      <SelectContent>
                        {EXAM_PERIODS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Objectif hebdomadaire : {profile.weekly_revision_hours}h</Label>
                  <Slider
                    value={[profile.weekly_revision_hours]}
                    onValueChange={(value) => setProfile({ ...profile, weekly_revision_hours: value[0] })}
                    min={2} max={40} step={1} className="py-4"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Enregistrer
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  Réinitialiser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Refaire l'onboarding</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Réinitialiser l'onboarding ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tu vas refaire les étapes de configuration initiale.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetOnboarding} disabled={resettingOnboarding}>
                        {resettingOnboarding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Confirmer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Préférences de révisions
                </CardTitle>
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
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Heure de début</Label>
                    <Input
                      type="time"
                      value={preferences.daily_start_time}
                      onChange={(e) => setPreferences({ ...preferences, daily_start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Heure de fin</Label>
                    <Input
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
                    min={1} max={10} step={1} className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Durée des sessions</Label>
                  <Select
                    value={String(preferences.session_duration_minutes)}
                    onValueChange={(value) => setPreferences({ ...preferences, session_duration_minutes: Number(value) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SESSION_DURATIONS.map((d) => (<SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="avoid_early"
                      checked={preferences.avoid_early_morning}
                      onCheckedChange={(c) => setPreferences({ ...preferences, avoid_early_morning: !!c })}
                    />
                    <Label htmlFor="avoid_early">Éviter avant 9h</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="avoid_late"
                      checked={preferences.avoid_late_evening}
                      onCheckedChange={(c) => setPreferences({ ...preferences, avoid_late_evening: !!c })}
                    />
                    <Label htmlFor="avoid_late">Éviter après 21h</Label>
                  </div>
                </div>

                <Button onClick={handleSavePreferences} disabled={savingPreferences}>
                  {savingPreferences && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Enregistrer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
