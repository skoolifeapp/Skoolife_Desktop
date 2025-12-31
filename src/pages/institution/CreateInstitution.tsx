import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SCHOOL_TYPES = [
  { value: 'business_school', label: 'École de commerce' },
  { value: 'engineering_school', label: 'École d\'ingénieurs' },
  { value: 'university', label: 'Université' },
  { value: 'prep_school', label: 'Classe préparatoire' },
  { value: 'art_school', label: 'École d\'art' },
  { value: 'other', label: 'Autre' },
];

const STUDENT_COUNTS = [
  { value: '1-100', label: 'Moins de 100 étudiants' },
  { value: '100-500', label: '100 - 500 étudiants' },
  { value: '500-2000', label: '500 - 2000 étudiants' },
  { value: '2000+', label: 'Plus de 2000 étudiants' },
];

export default function CreateInstitution() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    schoolType: '',
    studentCount: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Vous devez être connecté pour créer un établissement');
      navigate('/auth?redirect=/institution/create');
    }
  }, [authLoading, user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      navigate('/auth');
      return;
    }

    if (!formData.name || !formData.contactEmail) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      // Create the school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: formData.name,
          school_type: formData.schoolType,
          student_count_estimate: formData.studentCount,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone || null,
          address: formData.address || null,
          city: formData.city || null,
          postal_code: formData.postalCode || null,
          subscription_tier: 'trial',
          is_active: true,
        })
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Add user as school admin
      const { error: memberError } = await supabase
        .from('school_members')
        .insert({
          school_id: school.id,
          user_id: user.id,
          role: 'admin_school',
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      toast.success('Établissement créé avec succès !');
      navigate('/institution/dashboard');
    } catch (error: any) {
      console.error('Error creating institution:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-2xl mx-auto px-4 py-12 pt-24">
        {authLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Créer votre établissement</CardTitle>
                <CardDescription>
                  {step === 1 ? 'Informations de base' : 'Coordonnées'}
                </CardDescription>
              </CardHeader>

          <CardContent>
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'établissement *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: École Supérieure de Commerce de Paris"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolType">Type d'établissement</Label>
                  <Select
                    value={formData.schoolType}
                    onValueChange={(value) => handleInputChange('schoolType', value)}
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

                <div className="space-y-2">
                  <Label htmlFor="studentCount">Nombre d'étudiants</Label>
                  <Select
                    value={formData.studentCount}
                    onValueChange={(value) => handleInputChange('studentCount', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une tranche" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDENT_COUNTS.map((count) => (
                        <SelectItem key={count.value} value={count.value}>
                          {count.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={() => setStep(2)}
                  disabled={!formData.name}
                >
                  Continuer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de contact *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="admin@ecole.fr"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Téléphone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="01 23 45 67 89"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="123 rue de l'Éducation"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      placeholder="Paris"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      placeholder="75001"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={loading || !formData.contactEmail}
                  >
                    {loading ? 'Création...' : 'Créer l\'établissement'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
