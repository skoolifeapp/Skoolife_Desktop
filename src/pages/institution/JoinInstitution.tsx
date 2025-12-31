import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Key, ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function JoinInstitution() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [success, setSuccess] = useState<{ schoolName: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté');
      navigate('/auth');
      return;
    }

    if (!accessCode.trim()) {
      toast.error('Veuillez entrer un code d\'accès');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('use_access_code', {
        p_code: accessCode.trim().toUpperCase(),
        p_user_id: user.id,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; school_name?: string };

      if (!result.success) {
        toast.error(result.error || 'Code invalide');
        return;
      }

      setSuccess({ schoolName: result.school_name || 'votre établissement' });
      toast.success('Vous avez rejoint l\'établissement !');
    } catch (error: any) {
      console.error('Error joining institution:', error);
      toast.error(error.message || 'Erreur lors de la validation du code');
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
              <h2 className="text-2xl font-bold mb-2">Bienvenue !</h2>
              <p className="text-muted-foreground mb-6">
                Vous avez rejoint <strong>{success.schoolName}</strong>
              </p>
              <Button onClick={() => navigate('/app')} className="w-full">
                Accéder à mon espace
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
      
      <main className="container max-w-md mx-auto px-4 py-12 pt-24">
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
              <Key className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Rejoindre un établissement</CardTitle>
            <CardDescription>
              Entrez le code d'accès fourni par votre école
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Code d'accès</Label>
                <Input
                  id="accessCode"
                  placeholder="Ex: SK-ABC123"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={20}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !accessCode.trim()}
              >
                {loading ? 'Vérification...' : 'Rejoindre'}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Vous n'avez pas de code ? Demandez-le à l'administration de votre établissement.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
