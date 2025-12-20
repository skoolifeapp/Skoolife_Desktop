import { useEffect, useState } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MonitorUp, 
  Phone, 
  Users,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDailyCall } from '@/hooks/useDailyCall';
import VideoTile from '@/components/VideoTile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface VideoCallRoomProps {
  roomUrl: string;
  onLeave: () => void;
  sessionTitle?: string;
}

const VideoCallRoom = ({ roomUrl, onLeave, sessionTitle }: VideoCallRoomProps) => {
  const {
    participants,
    isJoined,
    isJoining,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    error,
    join,
    leave,
    toggleCamera,
    toggleMic,
    toggleScreenShare,
  } = useDailyCall();

  const { user } = useAuth();
  const [userName, setUserName] = useState('Utilisateur');

  // Fetch user name
  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
        
        if (data?.first_name) {
          setUserName(data.first_name);
        }
      }
    };
    fetchUserName();
  }, [user]);

  // Auto-join when component mounts
  useEffect(() => {
    if (roomUrl && userName && !isJoined && !isJoining) {
      join(roomUrl, userName);
    }
  }, [roomUrl, userName, isJoined, isJoining, join]);

  const handleLeave = async () => {
    await leave();
    onLeave();
  };

  // Loading state
  if (isJoining) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-lg font-medium">Connexion à la session...</p>
          <p className="text-sm text-muted-foreground">Préparation de ta caméra et ton micro</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-lg font-medium">Erreur de connexion</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={onLeave} variant="outline">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  // Calculate grid layout based on participant count
  const getGridClass = () => {
    const count = participants.length;
    if (count === 1) return 'grid-cols-1 max-w-2xl mx-auto';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    if (count <= 4) return 'grid-cols-2 max-w-4xl mx-auto';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto';
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1a2e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white font-medium">
            {sessionTitle || 'Session de révision'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/70">
          <Users className="w-4 h-4" />
          <span className="text-sm">{participants.length} participant{participants.length > 1 ? 's' : ''}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLeave}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`grid gap-4 ${getGridClass()}`}>
          {participants.map((participant) => (
            <VideoTile 
              key={participant.id} 
              participant={participant}
              isLarge={participants.length <= 2}
            />
          ))}
        </div>

        {participants.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white/60">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>En attente des autres participants...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-3 px-4 py-4 border-t border-white/10 bg-black/20">
        {/* Mic Toggle */}
        <Button
          variant={isMicOn ? 'secondary' : 'destructive'}
          size="lg"
          onClick={toggleMic}
          className="rounded-full w-14 h-14"
        >
          {isMicOn ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
        </Button>

        {/* Camera Toggle */}
        <Button
          variant={isCameraOn ? 'secondary' : 'destructive'}
          size="lg"
          onClick={toggleCamera}
          className="rounded-full w-14 h-14"
        >
          {isCameraOn ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </Button>

        {/* Screen Share */}
        <Button
          variant={isScreenSharing ? 'default' : 'secondary'}
          size="lg"
          onClick={toggleScreenShare}
          className="rounded-full w-14 h-14"
        >
          <MonitorUp className="w-6 h-6" />
        </Button>

        {/* Leave Call */}
        <Button
          variant="destructive"
          size="lg"
          onClick={handleLeave}
          className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
        >
          <Phone className="w-6 h-6 rotate-[135deg]" />
        </Button>
      </div>
    </div>
  );
};

export default VideoCallRoom;
