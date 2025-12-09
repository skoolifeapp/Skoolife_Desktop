import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';
import SupportDrawer from './SupportDrawer';

interface SupportButtonProps {
  onShowTutorial?: () => void;
}

const SupportButton = ({ onShowTutorial }: SupportButtonProps) => {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const checkSupportHint = async () => {
      if (!user) return;

      // Check if user has seen support hint
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_seen_support_hint')
        .eq('id', user.id)
        .maybeSingle();

      // Show hint only if not seen and main tutorial is complete
      const tutorialSeen = localStorage.getItem(`tutorial_seen_${user.id}`);
      if (tutorialSeen && profile && !profile.has_seen_support_hint) {
        // Small delay to not conflict with other tutorials
        setTimeout(() => setShowHint(true), 1500);
      }
    };

    checkSupportHint();
  }, [user]);

  const dismissHint = async () => {
    setShowHint(false);
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ has_seen_support_hint: true })
        .eq('id', user.id);
    }
  };

  const handleOpenDrawer = () => {
    if (showHint) {
      dismissHint();
    }
    setDrawerOpen(true);
  };

  return (
    <>
      {/* Hint tooltip */}
      {showHint && (
        <div className="fixed bottom-24 right-4 z-50 animate-fade-in">
          <div className="relative bg-card border border-border rounded-xl shadow-lg p-4 max-w-xs">
            {/* Arrow pointing to button */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-r border-b border-border rotate-45" />
            
            <button 
              onClick={dismissHint}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-sm pr-4">
              Besoin d'aide ou envie de proposer une amélioration ? Clique ici pour ouvrir le centre d'aide Skoolife.
            </p>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-3 w-full"
              onClick={dismissHint}
            >
              Compris
            </Button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <Button
        onClick={handleOpenDrawer}
        className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg hover:shadow-xl transition-shadow gap-2 px-4"
        size="lg"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Besoin d'aide ?</span>
      </Button>

      {/* Support drawer */}
      <SupportDrawer 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen}
        onShowTutorial={onShowTutorial}
      />
    </>
  );
};

export default SupportButton;
