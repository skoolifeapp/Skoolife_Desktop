import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoCall } from '@/contexts/VideoCallContext';

interface JoinCallButtonProps {
  roomUrl: string;
  sessionTitle?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const JoinCallButton = ({ 
  roomUrl, 
  sessionTitle,
  variant = 'default',
  size = 'default',
  className 
}: JoinCallButtonProps) => {
  const { startCall } = useVideoCall();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => startCall(roomUrl, sessionTitle)}
      className={className}
    >
      <Video className="w-4 h-4 mr-2" />
      Rejoindre la visio
    </Button>
  );
};

export default JoinCallButton;
