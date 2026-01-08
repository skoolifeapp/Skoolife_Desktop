import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';
import { supabase } from '@/integrations/supabase/client';
import SchoolSidebar from '@/components/school/SchoolSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Palette,
  Save,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SchoolSettings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading, isSchoolAdmin, school, refetch } = useSchoolAdmin();
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    postalCode: '',
    primaryColor: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!loading && !isSchoolAdmin && user) {
      navigate('/app');
    }
  }, [loading, isSchoolAdmin, user, navigate]);

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || '',
        contactEmail: school.contact_email || '',
        contactPhone: school.contact_phone || '',
        address: school.address || '',
        city: school.city || '',
        postalCode: school.postal_code || '',
        primaryColor: school.primary_color || '#FFC107',
      });
    }
  }, [school]);

  const handleSave = async () => {
    if (!school) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('schools')
      .update({
        name: formData.name,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postalCode || null,
        primary_color: formData.primaryColor || '#FFC107',
        updated_at: new Date().toISOString(),
      })
      .eq('id', school.id);

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } else {
      toast.success('Paramètres enregistrés');
      refetch();
    }
    setIsSaving(false);
  };

  if (authLoading || loading) {
    return (
      <SchoolSidebar>
        <div className="p-6 md:p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </SchoolSidebar>
    );
  }

  if (!isSchoolAdmin || !school) {
    return null;
  }

  const subscriptionEnd = school.subscription_end_date 
    ? format(new Date(school.subscription_end_date), 'dd MMMM yyyy', { locale: fr })
    : null;

  return (
    <SchoolSidebar schoolName={school?.name}>
      <div className="p-6 md:p-8 space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez les informations de votre établissement.
          </p>
        </div>

        {/* Subscription info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Abonnement</CardTitle>
                <CardDescription>Informations de facturation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Formule actuelle</p>
                <p className="font-medium capitalize">{school.subscription_tier || 'Non défini'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valide jusqu'au</p>
                <p className="font-medium">{subscriptionEnd || 'Non défini'}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Pour modifier votre abonnement, contactez-nous à{' '}
              <a href="mailto:skoolife.co@gmail.com" className="text-primary hover:underline">
                skoolife.co@gmail.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* School info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Informations établissement</CardTitle>
                <CardDescription>Détails visibles par vos élèves</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'établissement</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: ISCG Paris"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email de contact
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@ecole.fr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="01 23 45 67 89"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="w-4 h-4 inline mr-2" />
                Adresse
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 rue de l'École"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Paris"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="75001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Personnalisation</CardTitle>
                <CardDescription>Couleur de votre établissement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Couleur principale</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primaryColor"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-28 uppercase"
                    placeholder="#FFC107"
                  />
                </div>
              </div>
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: formData.primaryColor }}
              >
                {formData.name?.slice(0, 2).toUpperCase() || 'SK'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </div>
    </SchoolSidebar>
  );
};

export default SchoolSettings;
