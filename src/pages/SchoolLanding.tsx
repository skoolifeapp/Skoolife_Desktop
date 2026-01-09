import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const SCHOOL_TYPES = [
  { value: 'prepa', label: 'Classe préparatoire' },
  { value: 'ecole_commerce', label: 'École de commerce' },
  { value: 'ecole_ingenieur', label: 'École d\'ingénieurs' },
  { value: 'universite', label: 'Université' },
  { value: 'bts_iut', label: 'BTS / IUT' },
  { value: 'autre', label: 'Autre' },
];

const STUDENT_COUNTS = [
  { value: '1-100', label: '1 - 100 élèves' },
  { value: '100-300', label: '100 - 300 élèves' },
  { value: '300-500', label: '300 - 500 élèves' },
  { value: '500-1000', label: '500 - 1000 élèves' },
  { value: '1000+', label: 'Plus de 1000 élèves' },
];

const FEATURES = [
  {
    icon: Users,
    title: 'Gestion simplifiée',
    description: 'Distribuez des accès à vos élèves en quelques clics via des codes d\'accès personnalisés.',
  },
  {
    icon: BarChart3,
    title: 'Analytics détaillés',
    description: 'Suivez l\'engagement de vos élèves par classe et par période pour identifier les besoins.',
  },
  {
    icon: Clock,
    title: 'Gain de temps',
    description: 'Vos élèves planifient leurs révisions de manière autonome et structurée.',
  },
  {
    icon: Shield,
    title: 'Données sécurisées',
    description: 'Hébergement en France, conformité RGPD et protection des données étudiantes.',
  },
];

const PRICING_TIERS = [
  {
    name: 'Starter',
    price: '500€',
    period: '/an',
    students: 'Jusqu\'à 100 élèves',
    features: ['Accès Major pour tous', 'Dashboard admin', 'Support email'],
    popular: false,
  },
  {
    name: 'Standard',
    price: '1 500€',
    period: '/an',
    students: 'Jusqu\'à 500 élèves',
    features: ['Tout Starter +', 'Analytics avancés', 'Import CSV', 'Support prioritaire'],
    popular: true,
  },
  {
    name: 'Premium',
    price: '3 000€',
    period: '/an',
    students: 'Élèves illimités',
    features: ['Tout Standard +', 'Matières partagées', 'Onboarding dédié', 'Account manager'],
    popular: false,
  },
];

const SchoolLanding = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    contactEmail: '',
    contactPhone: '',
    schoolType: '',
    studentCount: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolName || !formData.contactEmail) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('school_leads').insert({
        school_name: formData.schoolName,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone || null,
        school_type: formData.schoolType || null,
        student_count: formData.studentCount || null,
        message: formData.message || null,
      });

      if (error) throw error;

      toast.success('Demande envoyée ! Nous vous recontacterons sous 24h.');
      setFormData({
        schoolName: '',
        contactEmail: '',
        contactPhone: '',
        schoolType: '',
        studentCount: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
              <Building2 className="w-4 h-4" />
              Pour les établissements post-bac
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Aidez vos élèves à{' '}
              <span className="gradient-text-animated">mieux réviser</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Skoolife accompagne vos étudiants dans leur organisation des révisions. 
              Un outil simple, efficace et adopté par les élèves.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="gap-2 text-lg px-8"
                onClick={() => navigate('/etablissements/inscription')}
              >
                Essayer gratuitement 14 jours
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2 text-lg px-8"
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Demander une démo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Étudiants actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">10k+</div>
                <div className="text-sm text-muted-foreground">Sessions planifiées</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-foreground">4.8/5</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir Skoolife ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une solution pensée pour les établissements qui veulent accompagner leurs élèves vers la réussite.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="border-0 bg-card hover-lift">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Créez votre espace',
                description: 'Nous configurons votre établissement avec vos classes et cohortes.',
              },
              {
                step: '2',
                title: 'Distribuez les accès',
                description: 'Partagez un code d\'accès unique à vos élèves pour s\'inscrire.',
              },
              {
                step: '3',
                title: 'Suivez l\'engagement',
                description: 'Consultez les statistiques d\'utilisation depuis votre dashboard.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tarifs établissements
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des forfaits adaptés à la taille de votre établissement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative border-2 ${tier.popular ? 'border-primary shadow-lg' : 'border-border'}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Populaire
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <CardDescription className="mt-2">{tier.students}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-6" 
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Nous contacter
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Facturation annuelle. Tarif dégressif disponible pour les grands établissements.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Demandez une démo
              </h2>
              <p className="text-muted-foreground">
                Remplissez ce formulaire et nous vous recontacterons sous 24h pour organiser une présentation.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">Nom de l'établissement *</Label>
                      <Input
                        id="schoolName"
                        placeholder="Ex: ISCG Paris"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="schoolType">Type d'établissement</Label>
                      <Select
                        value={formData.schoolType}
                        onValueChange={(value) => setFormData({ ...formData, schoolType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email de contact *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="contact@ecole.fr"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentCount">Nombre d'élèves</Label>
                    <Select
                      value={formData.studentCount}
                      onValueChange={(value) => setFormData({ ...formData, studentCount: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner..." />
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

                  <div className="space-y-2">
                    <Label htmlFor="message">Message (optionnel)</Label>
                    <Textarea
                      id="message"
                      placeholder="Précisez vos besoins ou questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SchoolLanding;
