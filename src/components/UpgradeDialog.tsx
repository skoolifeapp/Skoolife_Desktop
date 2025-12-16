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
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl text-center">
            Passe à Major pour débloquer {featureName || 'cette fonctionnalité'}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Accède à toutes les fonctionnalités avancées et optimise tes révisions avec l'offre Major.
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
          <Button onClick={handleUpgrade} className="w-full gap-2">
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
