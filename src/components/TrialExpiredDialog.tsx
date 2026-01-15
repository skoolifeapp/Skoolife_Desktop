import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { STRIPE_PRICES } from '@/config/stripe';

interface TrialExpiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTier: 'student' | 'major' | null;
}

export function TrialExpiredDialog({ open, onOpenChange, selectedTier }: TrialExpiredDialogProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const tier = selectedTier || 'student';
    const priceId = tier === 'major' ? STRIPE_PRICES.major : STRIPE_PRICES.student;
    
    setLoading(true);

    // Open the window immediately to avoid popup blocker
    const newWindow = window.open('about:blank', '_blank');

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url && newWindow) {
        newWindow.location.href = data.url;
      } else if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      if (newWindow) newWindow.close();
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">
            Ton essai gratuit est terminé
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Tu as utilisé Skoolife pendant 7 jours pour t'organiser. Continue sans stress, on s'occupe du reste.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button 
            className="w-full h-12 text-base" 
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Continuer'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
