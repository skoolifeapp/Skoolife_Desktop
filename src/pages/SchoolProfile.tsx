import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, User, Building2, Mail } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import SchoolSidebar from '@/components/school/SchoolSidebar';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  marketing_emails_optin: boolean;
}

const SchoolProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMarketing, setSavingMarketing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    marketing_emails_optin: false,
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
          marketing_emails_optin: profileData.marketing_emails_optin || false,
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
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Erreur lors de la sauvegarde');
      } else {
        toast.success('Profil mis à jour !');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'A';
  };

  const handleMarketingOptInChange = async (checked: boolean) => {
    if (!user) return;
    
    setSavingMarketing(true);
    const now = new Date().toISOString();
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          marketing_emails_optin: checked,
          marketing_optin_at: checked ? now : null
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Erreur lors de la mise à jour');
      } else {
        setProfile({ ...profile, marketing_emails_optin: checked });
        toast.success(checked 
          ? 'Vous recevrez nos actualités par email' 
          : 'Vous ne recevrez plus nos emails'
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingMarketing(false);
    }
  };

  return (
    <SchoolSidebar>
      <div className="flex-1 p-6 md:p-8 space-y-8 overflow-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mon compte</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles d'administrateur
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
                        : 'Administrateur'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Compte établissement
                    </CardDescription>
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
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Nom</Label>
                    <Input
                      id="last_name"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      placeholder="Votre nom"
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

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Enregistrer
                </Button>
              </CardContent>
            </Card>

            {/* Marketing preferences card */}
            <Card className="border-0 shadow-md max-w-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Communications</CardTitle>
                    <CardDescription>Gérez vos préférences d'emails</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Emails d'informations et actualités</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Recevez nos actualités, conseils et nouveautés. Vous pouvez vous désinscrire à tout moment.
                    </p>
                  </div>
                  <Switch
                    checked={profile.marketing_emails_optin}
                    onCheckedChange={handleMarketingOptInChange}
                    disabled={savingMarketing}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SchoolSidebar>
  );
};

export default SchoolProfile;
