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
  LayoutGrid,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDailyCall } from '@/hooks/useDailyCall';
import VideoTile from '@/components/VideoTile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsDropdown } from '@/components/NotificationsDropdown';
import { useLayoutSidebar } from '@/contexts/LayoutSidebarContext';

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
  const { sidebarCollapsed, toggleSidebarCollapsed } = useLayoutSidebar();

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

  // Loading state - same layout as app content area
  if (isJoining) {
    return (
      <div className={`fixed inset-0 z-50 bg-background transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56'}`}>
        {/* Header matching app */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleSidebarCollapsed}
              >
                {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </Button>
              <span className="text-lg">/</span>
              <span className="font-semibold text-foreground">Session Visio</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6" style={{ height: 'calc(100vh - 73px)' }}>
          <div className="text-center space-y-4 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-xl font-semibold text-foreground">Connexion à la session...</p>
            <p className="text-muted-foreground">Préparation de ta caméra et ton micro</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`fixed inset-0 z-50 bg-background transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56'}`}>
        {/* Header matching app */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleSidebarCollapsed}
              >
                {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </Button>
              <span className="text-lg">/</span>
              <span className="font-semibold text-foreground">Session Visio</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6" style={{ height: 'calc(100vh - 73px)' }}>
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <p className="text-xl font-semibold text-foreground">Erreur de connexion</p>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={onLeave} variant="outline" size="lg">
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Detect if someone is screen sharing
  const screenSharingParticipant = participants.find(p => p.screen);
  const isPresentationMode = !!screenSharingParticipant;
  // Get all camera participants (including the one sharing screen, for their camera feed)
  const cameraParticipants = participants;

  // Calculate grid layout based on participant count (only used when no presentation)
  const getGridClass = () => {
    const count = participants.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  // Render presentation mode layout - screen share full with camera thumbnails in top right
  const renderPresentationMode = () => (
    <div className="relative h-full w-full">
      {/* Main screen share - fills the entire space */}
      <div className="absolute inset-0">
        {screenSharingParticipant && (
          <div className="w-full h-full rounded-xl overflow-hidden bg-black border border-border relative">
            <video
              autoPlay
              playsInline
              muted={screenSharingParticipant.isLocal}
              ref={(el) => {
                if (el && screenSharingParticipant.screenTrack) {
                  const stream = new MediaStream([screenSharingParticipant.screenTrack]);
                  el.srcObject = stream;
                }
              }}
              className="w-full h-full object-contain"
            />
            {/* Screen share label */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-primary rounded-full text-xs text-primary-foreground font-semibold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
              Partage d'écran - {screenSharingParticipant.name}
            </div>
          </div>
        )}
      </div>
      
      {/* Camera thumbnails - positioned in top right corner */}
      {cameraParticipants.length > 0 && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {cameraParticipants.map((participant) => (
            <div 
              key={participant.id} 
              className="w-36 h-24 rounded-xl overflow-hidden shadow-lg border-2 border-card bg-card"
            >
              {/* Use camera track directly */}
              {participant.cameraTrack ? (
                <video
                  autoPlay
                  playsInline
                  muted={participant.isLocal}
                  ref={(el) => {
                    if (el && participant.cameraTrack) {
                      const stream = new MediaStream([participant.cameraTrack]);
                      el.srcObject = stream;
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              {/* Name badge */}
              <div className="absolute bottom-1 left-1 right-1 text-center">
                <span className="text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                  {participant.name} {participant.isLocal && '(Toi)'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render normal grid layout
  const renderGridMode = () => (
    <div className={`grid gap-4 h-full ${getGridClass()}`}>
      {participants.map((participant) => (
        <VideoTile 
          key={participant.id} 
          participant={participant}
          isLarge={participants.length <= 2}
        />
      ))}
      {participants.length === 0 && (
        <div className="flex items-center justify-center h-full col-span-full">
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
  );

  return (
    <div className={`fixed inset-0 z-50 bg-sidebar flex flex-col overflow-hidden transition-all duration-300 pt-2 pr-2 pb-2 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-56'}`}>
      <div className="flex-1 flex flex-col bg-background rounded-xl overflow-hidden">
      {/* Header matching app style - like Progression page */}
      <header className="flex-shrink-0 border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden lg:flex"
              onClick={toggleSidebarCollapsed}
              title={sidebarCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
            >
              {sidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </Button>
            <span className="text-lg">/</span>
            <span className="font-semibold text-foreground">
              {sessionTitle || 'Session Visio'}
            </span>
            {isPresentationMode && (
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full ml-2">
                Mode présentation
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">
                {participants.length} participant{participants.length > 1 ? 's' : ''}
              </span>
            </div>
            <NotificationsDropdown />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Video Grid - Fill remaining space */}
      <main className="flex-1 p-6 min-h-0 overflow-hidden">
        <div className="h-full rounded-2xl bg-card border border-border p-4 flex flex-col">
          <div className="flex-1 min-h-0 relative">
            {isPresentationMode ? renderPresentationMode() : renderGridMode()}
          </div>
          
          {/* Controls Bar - Inside the card */}
          <div className="flex-shrink-0 flex items-center justify-center gap-3 pt-4 mt-4 border-t border-border">
            {/* Mic Toggle */}
            <Button
              variant={isMicOn ? 'secondary' : 'destructive'}
              size="lg"
              onClick={toggleMic}
              className="rounded-full w-14 h-14 shadow-md transition-all hover:scale-105"
              title={isMicOn ? 'Couper le micro' : 'Activer le micro'}
            >
              {isMicOn ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>

            {/* Camera Toggle */}
            <Button
              variant={isCameraOn ? 'secondary' : 'destructive'}
              size="lg"
              onClick={toggleCamera}
              className="rounded-full w-14 h-14 shadow-md transition-all hover:scale-105"
              title={isCameraOn ? 'Couper la caméra' : 'Activer la caméra'}
            >
              {isCameraOn ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </Button>

            {/* Screen Share */}
            <Button
              variant={isScreenSharing ? 'default' : 'secondary'}
              size="lg"
              onClick={toggleScreenShare}
              className={`rounded-full w-14 h-14 shadow-md transition-all hover:scale-105 ${
                isScreenSharing ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : ''
              }`}
              title={isScreenSharing ? 'Arrêter le partage' : 'Partager l\'écran'}
            >
              <MonitorUp className="w-5 h-5" />
            </Button>

            {/* Leave Call */}
            <Button
              variant="destructive"
              size="lg"
              onClick={handleLeave}
              className="rounded-full w-14 h-14 shadow-md transition-all hover:scale-105 ml-4"
              title="Quitter l'appel"
            >
              <Phone className="w-5 h-5 rotate-[135deg]" />
            </Button>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default VideoCallRoom;
