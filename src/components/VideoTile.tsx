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
      className={`relative rounded-xl overflow-hidden bg-muted ${
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
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
        </div>
      )}

      {/* Audio element for remote participants */}
      {!participant.isLocal && (
        <audio ref={audioRef} autoPlay playsInline />
      )}

      {/* Overlay with name and status */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium truncate">
            {participant.name} {participant.isLocal && '(Toi)'}
          </span>
          <div className="flex items-center gap-1">
            {participant.audio ? (
              <Mic className="w-4 h-4 text-white" />
            ) : (
              <MicOff className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Screen share indicator */}
      {participant.screen && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-primary rounded text-xs text-primary-foreground font-medium">
          Partage d'écran
        </div>
      )}
    </div>
  );
};

export default VideoTile;
