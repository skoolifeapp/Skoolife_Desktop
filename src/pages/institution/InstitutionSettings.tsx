import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolRole } from '@/hooks/useSchoolRole';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Palette, Save } from 'lucide-react';
import { toast } from 'sonner';
import InstitutionSidebar from '@/components/institution/InstitutionSidebar';

interface SchoolSettings {
  name: string;
  school_type: string | null;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  logo_url: string | null;
  primary_color: string | null;
}

const SCHOOL_TYPES = [
  { value: 'business_school', label: 'École de commerce' },
  { value: 'engineering_school', label: 'École d\'ingénieurs' },
  { value: 'university', label: 'Université' },
  { value: 'prep_school', label: 'Classe préparatoire' },
  { value: 'art_school', label: 'École d\'art' },
  { value: 'other', label: 'Autre' },
];

const BRAND_COLORS = [
  { value: '#FFC107', label: 'Jaune (défaut)' },
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#10B981', label: 'Vert' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#EF4444', label: 'Rouge' },
  { value: '#F97316', label: 'Orange' },
  { value: '#EC4899', label: 'Rose' },
  { value: '#14B8A6', label: 'Turquoise' },
];

export default function InstitutionSettings() {
  const { user } = useAuth();
  const { membership, loading: roleLoading, isSchoolAdmin } = useSchoolRole();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!roleLoading && !isSchoolAdmin) {
      navigate('/app');
    }
  }, [roleLoading, isSchoolAdmin, navigate]);

  useEffect(() => {
    if (membership?.schoolId) {
      fetchSettings();
    }
  }, [membership?.schoolId]);

  const fetchSettings = async () => {
    if (!membership?.schoolId) return;

    try {
      const { data, error } = await supabase
        .from('schools')
        .select('name, school_type, contact_email, contact_phone, address, city, postal_code, logo_url, primary_color')
        .eq('id', membership.schoolId)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!membership?.schoolId || !settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: settings.name,
          school_type: settings.school_type,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone || null,
          address: settings.address || null,
          city: settings.city || null,
          postal_code: settings.postal_code || null,
          primary_color: settings.primary_color,
        })
        .eq('id', membership.schoolId);

      if (error) throw error;
      toast.success('Paramètres sauvegardés');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SchoolSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (roleLoading || loading) {
    return (
      <InstitutionSidebar>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96" />
        </div>
      </InstitutionSidebar>
    );
  }

  if (!settings) {
    return (
      <InstitutionSidebar>
        <div className="p-6">
          <p className="text-muted-foreground">Établissement non trouvé</p>
        </div>
      </InstitutionSidebar>
    );
  }

  return (
    <InstitutionSidebar>
      <div className="p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les informations de votre établissement</p>
        </div>

        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informations générales
            </CardTitle>
            <CardDescription>Informations de base de l'établissement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de l'établissement</Label>
              <Input
                value={settings.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Type d'établissement</Label>
              <Select
                value={settings.school_type || ''}
                onValueChange={(value) => handleChange('school_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email de contact</Label>
                <Input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={settings.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={settings.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input
                  value={settings.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Code postal</Label>
                <Input
                  value={settings.postal_code || ''}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personnalisation
            </CardTitle>
            <CardDescription>Personnalisez l'apparence pour vos étudiants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Couleur principale</Label>
              <div className="flex flex-wrap gap-2">
                {BRAND_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleChange('primary_color', color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      settings.primary_color === color.value
                        ? 'border-foreground scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL du logo (optionnel)</Label>
              <Input
                placeholder="https://votre-ecole.fr/logo.png"
                value={settings.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Le logo sera affiché dans l'interface étudiant
              </p>
            </div>

            {settings.logo_url && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Aperçu du logo :</p>
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </Button>
      </div>
    </InstitutionSidebar>
  );
}
