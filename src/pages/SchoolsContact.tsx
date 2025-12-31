import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SCHOOL_TYPES = [
  "Lycée",
  "Université",
  "Prépa",
  "École de commerce",
  "École d'ingénieur",
  "BTS/IUT",
  "Collège",
  "Autre"
];

const STUDENT_COUNTS = [
  "1-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+"
];

export default function SchoolsContact() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    school_name: "",
    contact_email: "",
    contact_phone: "",
    school_type: "",
    student_count: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("school_leads")
        .insert({
          school_name: form.school_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone || null,
          school_type: form.school_type || null,
          student_count: form.student_count || null,
          message: form.message || null
        });

      if (error) throw error;

      toast({
        title: "Demande envoyée !",
        description: "Nous vous recontacterons dans les plus brefs délais."
      });

      navigate("/schools");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 md:pt-32 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <Link 
            to="/schools" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          <Card>
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Demander une démo</CardTitle>
              <p className="text-muted-foreground">
                Remplissez ce formulaire et nous vous recontacterons rapidement.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school_name">Nom de l'établissement *</Label>
                  <Input
                    id="school_name"
                    value={form.school_name}
                    onChange={(e) => setForm({ ...form, school_name: e.target.value })}
                    placeholder="Lycée Victor Hugo"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email de contact *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                      placeholder="contact@lycee.fr"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Téléphone</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      value={form.contact_phone}
                      onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type d'établissement</Label>
                    <Select
                      value={form.school_type}
                      onValueChange={(value) => setForm({ ...form, school_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre d'élèves</Label>
                    <Select
                      value={form.student_count}
                      onValueChange={(value) => setForm({ ...form, student_count: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDENT_COUNTS.map(count => (
                          <SelectItem key={count} value={count}>{count} élèves</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez vos besoins..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gap-2" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi..." : "Envoyer la demande"}
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
