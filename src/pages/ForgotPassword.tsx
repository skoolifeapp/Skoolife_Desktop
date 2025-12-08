import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import logo from '@/assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Entre ton adresse email');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setEmailSent(true);
      }
    } catch (err) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold text-foreground">Skoolife</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Hero text */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {emailSent ? 'Email envoyé !' : 'Mot de passe oublié ?'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {emailSent 
                ? 'Vérifie ta boîte mail pour réinitialiser ton mot de passe' 
                : 'Pas de panique, on va t\'aider'}
            </p>
          </div>

          {/* Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                {emailSent ? 'Vérifie tes emails' : 'Réinitialisation'}
              </CardTitle>
              <CardDescription>
                {emailSent 
                  ? 'Un lien de réinitialisation a été envoyé à ton adresse email' 
                  : 'Entre ton email pour recevoir un lien de réinitialisation'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailSent ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Si tu ne reçois pas l'email dans quelques minutes, vérifie tes spams.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setEmailSent(false)}
                  >
                    Renvoyer un email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="ton@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Envoyer le lien'
                    )}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
