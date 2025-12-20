import { useState } from 'react';
import { Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoCallRoom from '@/components/VideoCallRoom';

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
  const [isInCall, setIsInCall] = useState(false);

  if (isInCall) {
    return (
      <VideoCallRoom 
        roomUrl={roomUrl}
        sessionTitle={sessionTitle}
        onLeave={() => setIsInCall(false)}
      />
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => setIsInCall(true)}
      className={className}
    >
      <Video className="w-4 h-4 mr-2" />
      Rejoindre la visio
    </Button>
  );
};

export default JoinCallButton;
