import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInviteFreeUser } from '@/hooks/useInviteFreeUser';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Clock, Loader2, RotateCcw, Settings as SettingsIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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

interface PreferencesData {
  weekly_revision_hours: number;
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
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);

  const [preferences, setPreferences] = useState<PreferencesData>({
    weekly_revision_hours: 10,
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
  const { isInviteFreeUser, loading: inviteGateLoading } = useInviteFreeUser();
  const navigate = useNavigate();

  // Redirect uniquement les comptes créés via lien d'invitation (comptes gratuits)
  useEffect(() => {
    if (!inviteGateLoading && isInviteFreeUser) {
      navigate('/app');
    }
  }, [inviteGateLoading, isInviteFreeUser, navigate]);

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
      const [prefsRes, profileRes] = await Promise.all([
        supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('weekly_revision_hours').eq('id', user.id).single(),
      ]);

      const prefsData = prefsRes.data;
      const profileData = profileRes.data;

      setPreferences({
        weekly_revision_hours: profileData?.weekly_revision_hours || 10,
        preferred_days_of_week: prefsData?.preferred_days_of_week || [1, 2, 3, 4, 5],
        daily_start_time: prefsData?.daily_start_time || '08:00',
        daily_end_time: prefsData?.daily_end_time || '22:00',
        max_hours_per_day: prefsData?.max_hours_per_day || 4,
        session_duration_minutes: (prefsData as any)?.session_duration_minutes || 90,
        avoid_late_evening: prefsData?.avoid_late_evening || false,
        avoid_early_morning: prefsData?.avoid_early_morning || false,
        notes: prefsData?.notes || '',
      });
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
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
      const [prefsError, profileError] = await Promise.all([
        supabase.from('user_preferences').upsert({
          user_id: user.id,
          preferred_days_of_week: preferences.preferred_days_of_week,
          daily_start_time: preferences.daily_start_time,
          daily_end_time: preferences.daily_end_time,
          max_hours_per_day: preferences.max_hours_per_day,
          session_duration_minutes: preferences.session_duration_minutes,
          avoid_late_evening: preferences.avoid_late_evening,
          avoid_early_morning: preferences.avoid_early_morning,
          notes: preferences.notes,
        } as any, { onConflict: 'user_id' }),
        supabase.from('profiles').update({
          weekly_revision_hours: preferences.weekly_revision_hours,
        }).eq('id', user.id),
      ]);

      if (prefsError.error || profileError.error) throw prefsError.error || profileError.error;
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 overflow-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
          <p className="text-muted-foreground">
            Configure tes préférences de révisions
          </p>
        </div>

        {/* Section: Revision Preferences */}
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
            <div className="space-y-2">
              <Label>Objectif hebdomadaire : {preferences.weekly_revision_hours}h</Label>
              <Slider
                value={[preferences.weekly_revision_hours]}
                onValueChange={(value) => setPreferences({ ...preferences, weekly_revision_hours: value[0] })}
                min={2}
                max={40}
                step={1}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">
                Entre 2h et 40h par semaine
              </p>
            </div>

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

        {/* Section: Advanced Options */}
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

        <SupportButton />
    </div>
  );
};

export default Settings;
