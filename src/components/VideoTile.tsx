import { useEffect, useRef } from 'react';
import { Mic, MicOff, User } from 'lucide-react';
import type { Participant } from '@/hooks/useDailyCall';

interface VideoTileProps {
  participant: Participant;
  isLarge?: boolean;
}

const VideoTile = ({ participant, isLarge = false }: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Attach video track
  useEffect(() => {
    if (videoRef.current && participant.videoTrack) {
      const stream = new MediaStream([participant.videoTrack]);
      videoRef.current.srcObject = stream;
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [participant.videoTrack]);

  // Attach audio track (only for remote participants)
  useEffect(() => {
    if (audioRef.current && participant.audioTrack && !participant.isLocal) {
      const stream = new MediaStream([participant.audioTrack]);
      audioRef.current.srcObject = stream;
    }
  }, [participant.audioTrack, participant.isLocal]);

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden bg-card border border-border shadow-lg ${
        isLarge ? 'aspect-video' : 'aspect-video'
      }`}
    >
      {/* Video element */}
      {participant.video && participant.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
            <User className="w-10 h-10 text-primary" />
          </div>
        </div>
      )}

      {/* Audio element for remote participants */}
      {!participant.isLocal && (
        <audio ref={audioRef} autoPlay playsInline />
      )}

      {/* Overlay with name and status */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-white text-sm font-semibold truncate drop-shadow-md">
              {participant.name} {participant.isLocal && '(Toi)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${participant.audio ? 'bg-white/20' : 'bg-destructive/80'}`}>
              {participant.audio ? (
                <Mic className="w-3.5 h-3.5 text-white" />
              ) : (
                <MicOff className="w-3.5 h-3.5 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Screen share indicator */}
      {participant.screen && (
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-primary rounded-full text-xs text-primary-foreground font-semibold shadow-md flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
          Partage d'écran
        </div>
      )}

      {/* Local user indicator */}
      {participant.isLocal && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-secondary/80 backdrop-blur-sm rounded-full text-xs text-foreground font-medium">
          Toi
        </div>
      )}
    </div>
  );
};

export default VideoTile;
