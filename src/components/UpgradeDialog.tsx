import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName?: string;
}

export const UpgradeDialog = ({ open, onOpenChange, featureName }: UpgradeDialogProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/subscription');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
            <Crown className="w-6 h-6 text-primary animate-[fade-in_0.4s_ease-out_0.1s_both]" />
          </div>
          <DialogTitle className="text-xl animate-[fade-in_0.3s_ease-out_0.15s_both]">
            Passe à Major pour débloquer {featureName || 'cette fonctionnalité'}
          </DialogTitle>
          <DialogDescription className="text-center pt-2 animate-[fade-in_0.3s_ease-out_0.2s_both]">
            Accède à toutes les fonctionnalités avancées et optimise tes révisions avec l'offre Major.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 text-sm animate-[fade-in_0.3s_ease-out_0.25s_both]">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span>Suivi détaillé de ta progression</span>
          </div>
          <div className="flex items-center gap-3 text-sm animate-[fade-in_0.3s_ease-out_0.3s_both]">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span>Invite tes camarades à réviser ensemble</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 animate-[fade-in_0.3s_ease-out_0.35s_both]">
          <Button onClick={handleUpgrade} className="w-full gap-2 hover-scale">
            <Crown className="w-4 h-4" />
            Passer à Major
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Plus tard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
