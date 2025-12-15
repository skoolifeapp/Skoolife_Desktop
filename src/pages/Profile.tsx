import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, User, Copy, Check } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';

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
  liaison_code: string;
}

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    school: '',
    level: '',
    main_exam_period: '',
    liaison_code: '',
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);

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
          liaison_code: profileData.liaison_code || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          school: profile.school,
          level: profile.level,
          main_exam_period: profile.main_exam_period,
        })
        .eq('id', user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '';
  };

  const copyLiaisonCode = () => {
    if (profile.liaison_code) {
      navigator.clipboard.writeText(profile.liaison_code);
      setCodeCopied(true);
      toast.success('Code copié !');
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  return (
    <AppSidebar>
      <div className="flex-1 p-6 md:p-8 space-y-8 overflow-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mon profil</h1>
          <p className="text-muted-foreground">
            Gère tes informations personnelles
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="border-0 shadow-md max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {getInitials() ? (
                    <span className="text-xl font-bold text-primary">{getInitials()}</span>
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle>
                    {profile.first_name || profile.last_name
                      ? `${profile.first_name} ${profile.last_name}`.trim()
                      : 'Mon profil'}
                  </CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* Code de liaison */}
              <div className="space-y-2">
                <Label>Code de liaison</Label>
                <div className="flex gap-2">
                  <Input
                    value={profile.liaison_code}
                    disabled
                    className="bg-muted font-mono text-lg tracking-wider"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyLiaisonCode}
                    className="shrink-0"
                  >
                    {codeCopied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Partage ce code avec tes camarades pour qu'ils puissent t'inviter à réviser
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Niveau d'études</Label>
                  <Select
                    value={profile.level}
                    onValueChange={(value) => setProfile({ ...profile, level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Niveau" />
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
                  <Label>Période d'examens</Label>
                  <Select
                    value={profile.main_exam_period}
                    onValueChange={(value) => setProfile({ ...profile, main_exam_period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Mois" />
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


              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppSidebar>
  );
};

export default Profile;
