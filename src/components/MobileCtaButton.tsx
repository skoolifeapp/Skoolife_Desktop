import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ReactNode } from 'react';

interface MobileCtaButtonProps {
  desktopTo: string;
  children: ReactNode;
  variant?: 'default' | 'outline' | 'hero';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

/**
 * CTA Button that redirects to /mobile-not-supported on mobile devices,
 * and to the specified destination on desktop.
 */
const MobileCtaButton = ({ 
  desktopTo, 
  children, 
  variant = 'default',
  size = 'default',
  className = ''
}: MobileCtaButtonProps) => {
  const isMobile = useIsMobile();
  const destination = isMobile ? '/mobile-not-supported' : desktopTo;

  return (
    <Link to={destination}>
      <Button variant={variant} size={size} className={className}>
        {children}
      </Button>
    </Link>
  );
};

export default MobileCtaButton;
