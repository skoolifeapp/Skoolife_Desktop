import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Building2, CheckCircle, Send } from 'lucide-react';
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
  { value: '1-100', label: 'Moins de 100' },
  { value: '100-500', label: '100 - 500' },
  { value: '500-2000', label: '500 - 2000' },
  { value: '2000+', label: 'Plus de 2000' },
];

export default function Contact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: '',
    contactEmail: '',
    contactPhone: '',
    schoolType: '',
    studentCount: '',
    message: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.schoolName || !formData.contactEmail) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('school_leads')
        .insert({
          school_name: formData.schoolName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone || null,
          school_type: formData.schoolType || null,
          student_count: formData.studentCount || null,
          message: formData.message || null,
        });

      if (error) throw error;

      setSuccess(true);
      toast.success('Demande envoyée !');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container max-w-md mx-auto px-4 py-12 pt-24">
          <Card>
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Merci !</h2>
              <p className="text-muted-foreground mb-6">
                Nous avons bien reçu votre demande. Notre équipe vous contactera sous 48h.
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-xl mx-auto px-4 py-12 pt-24">
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
            <CardTitle className="text-2xl">Demander une démo</CardTitle>
            <CardDescription>
              Découvrez comment Skoolife peut aider votre établissement
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">Nom de l'établissement *</Label>
                <Input
                  id="schoolName"
                  placeholder="Ex: École Supérieure de Commerce"
                  value={formData.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="admin@ecole.fr"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Téléphone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="01 23 45 67 89"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type d'établissement</Label>
                  <Select
                    value={formData.schoolType}
                    onValueChange={(value) => handleChange('schoolType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
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
                  <Label>Nombre d'étudiants</Label>
                  <Select
                    value={formData.studentCount}
                    onValueChange={(value) => handleChange('studentCount', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optionnel)</Label>
                <Textarea
                  id="message"
                  placeholder="Parlez-nous de vos besoins..."
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  'Envoi...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer ma demande
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
