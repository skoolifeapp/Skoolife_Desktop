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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDailyCall } from '@/hooks/useDailyCall';
import VideoTile from '@/components/VideoTile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

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
        <div className="text-center space-y-4 flex flex-col items-center justify-center">
          <img src={logo} alt="Skoolife" className="w-16 h-16 rounded-xl" />
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-lg font-semibold text-foreground">Connexion à la session...</p>
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
          <p className="text-lg font-semibold text-foreground">Erreur de connexion</p>
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
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Header - Skoolife branded */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Skoolife" className="w-8 h-8 rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-foreground">
              {sessionTitle || 'Session de révision'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-secondary/50 rounded-full">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {participants.length} participant{participants.length > 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Video Grid - Fill remaining space without scroll */}
      <main className="flex-1 p-4 min-h-0 bg-muted/30">
        <div className={`grid gap-4 h-full ${getGridClass()}`}>
          {participants.map((participant) => (
            <VideoTile 
              key={participant.id} 
              participant={participant}
              isLarge={participants.length <= 2}
            />
          ))}
        {participants.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-medium text-foreground">En attente des autres participants...</p>
              <p className="text-sm text-muted-foreground">Partage le lien de la session pour inviter tes camarades</p>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Controls Bar - Skoolife styled */}
      <footer className="flex-shrink-0 flex items-center justify-center gap-4 px-6 py-4 border-t border-border bg-card">
        {/* Mic Toggle */}
        <Button
          variant={isMicOn ? 'secondary' : 'destructive'}
          size="lg"
          onClick={toggleMic}
          className="rounded-full w-16 h-16 shadow-md transition-all hover:scale-105"
          title={isMicOn ? 'Couper le micro' : 'Activer le micro'}
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
          className="rounded-full w-16 h-16 shadow-md transition-all hover:scale-105"
          title={isCameraOn ? 'Couper la caméra' : 'Activer la caméra'}
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
          className={`rounded-full w-16 h-16 shadow-md transition-all hover:scale-105 ${
            isScreenSharing ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : ''
          }`}
          title={isScreenSharing ? 'Arrêter le partage' : 'Partager l\'écran'}
        >
          <MonitorUp className="w-6 h-6" />
        </Button>

        {/* Leave Call */}
        <Button
          variant="destructive"
          size="lg"
          onClick={handleLeave}
          className="rounded-full w-16 h-16 shadow-md transition-all hover:scale-105 ml-4"
          title="Quitter l'appel"
        >
          <Phone className="w-6 h-6 rotate-[135deg]" />
        </Button>
      </footer>
    </div>
  );
};

export default VideoCallRoom;
