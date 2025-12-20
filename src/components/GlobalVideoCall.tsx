import { useVideoCall } from '@/contexts/VideoCallContext';
import VideoCallRoom from '@/components/VideoCallRoom';

const GlobalVideoCall = () => {
  const { videoCall, endCall } = useVideoCall();

  if (!videoCall.isActive || !videoCall.roomUrl) {
    return null;
  }

  return (
    <VideoCallRoom
      roomUrl={videoCall.roomUrl}
      sessionTitle={videoCall.sessionTitle || undefined}
      onLeave={endCall}
    />
  );
};

export default GlobalVideoCall;
