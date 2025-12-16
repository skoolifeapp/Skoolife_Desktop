import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
  onUpgradeSuccess?: () => void;
}

export const UpgradeDialog = ({ open, onOpenChange, featureName, onUpgradeSuccess }: UpgradeDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('switch-subscription', {
        body: { targetTier: 'major' },
      });

      if (error) throw error;

      toast.success('Félicitations ! Tu es maintenant Major 🎉');
      onOpenChange(false);
      onUpgradeSuccess?.();
      // Dispatch custom event for pages to refresh
      window.dispatchEvent(new CustomEvent('subscription-upgraded'));
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Erreur lors de la mise à niveau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl text-center">
            Passe à Major pour débloquer {featureName || 'cette fonctionnalité'}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Accède à toutes les fonctionnalités avancées pour seulement <span className="font-semibold">4,99€/mois</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span>Suivi détaillé de ta progression</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span>Invite tes camarades à réviser ensemble</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleUpgrade} disabled={isLoading} className="w-full gap-2">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crown className="w-4 h-4" />
            )}
            {isLoading ? 'Mise à niveau...' : 'Passer à Major'}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading} className="w-full">
            Plus tard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};