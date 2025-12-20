import { useState, useEffect, useCallback, useRef } from 'react';
import DailyIframe, { DailyCall, DailyParticipant, DailyEventObjectParticipant, DailyEventObjectParticipantLeft } from '@daily-co/daily-js';

export interface Participant {
  id: string;
  name: string;
  isLocal: boolean;
  videoTrack: MediaStreamTrack | null;
  cameraTrack: MediaStreamTrack | null;
  screenTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  video: boolean;
  audio: boolean;
  screen: boolean;
}

interface UseDailyCallReturn {
  callObject: DailyCall | null;
  participants: Participant[];
  isJoined: boolean;
  isJoining: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  error: string | null;
  join: (roomUrl: string, userName?: string) => Promise<void>;
  leave: () => Promise<void>;
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleScreenShare: () => Promise<void>;
}

const parseParticipant = (p: DailyParticipant): Participant => {
  const cameraTrack = p.tracks?.video?.persistentTrack || null;
  const screenTrack = ((p.tracks as any)?.screenVideo?.persistentTrack as MediaStreamTrack | undefined) || null;
  // Main videoTrack: prefer screen if sharing, otherwise camera
  const videoTrack = p.screen && screenTrack ? screenTrack : cameraTrack;

  return {
    id: p.session_id,
    name: p.user_name || 'Participant',
    isLocal: p.local,
    videoTrack,
    cameraTrack,
    screenTrack,
    audioTrack: p.tracks?.audio?.persistentTrack || null,
    video: p.screen ? true : p.video,
    audio: p.audio,
    screen: p.screen,
  };
};

export const useDailyCall = (): UseDailyCallReturn => {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callObjectRef = useRef<DailyCall | null>(null);

  const updateParticipants = useCallback((call: DailyCall) => {
    const allParticipants = call.participants();
    const parsed = Object.values(allParticipants).map(parseParticipant);
    // Local participant first
    const sorted = parsed.sort((a, b) => (a.isLocal ? -1 : b.isLocal ? 1 : 0));
    setParticipants(sorted);
  }, []);

  const join = useCallback(async (roomUrl: string, userName?: string) => {
    setError(null);
    setIsJoining(true);

    try {
      // Create call object
      const call = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: true,
      });

      callObjectRef.current = call;
      setCallObject(call);

      // Set up event listeners
      call.on('joined-meeting', () => {
        console.log('Joined meeting');
        setIsJoined(true);
        setIsJoining(false);
        updateParticipants(call);
      });

      call.on('left-meeting', () => {
        console.log('Left meeting');
        setIsJoined(false);
        setParticipants([]);
      });

      call.on('participant-joined', (event: DailyEventObjectParticipant | undefined) => {
        console.log('Participant joined:', event?.participant?.user_name);
        updateParticipants(call);
      });

      call.on('participant-left', (event: DailyEventObjectParticipantLeft | undefined) => {
        console.log('Participant left:', event?.participant?.user_name);
        updateParticipants(call);
      });

      call.on('participant-updated', () => {
        updateParticipants(call);
      });

      call.on('error', (event) => {
        console.error('Daily error:', event);
        setError(event?.errorMsg || 'Une erreur est survenue');
        setIsJoining(false);
      });

      // Join the room
      await call.join({
        url: roomUrl,
        userName: userName || 'Utilisateur',
      });

    } catch (err) {
      console.error('Error joining call:', err);
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      setIsJoining(false);
    }
  }, [updateParticipants]);

  const leave = useCallback(async () => {
    if (callObjectRef.current) {
      await callObjectRef.current.leave();
      callObjectRef.current.destroy();
      callObjectRef.current = null;
      setCallObject(null);
      setIsJoined(false);
      setParticipants([]);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (callObjectRef.current) {
      const newState = !isCameraOn;
      callObjectRef.current.setLocalVideo(newState);
      setIsCameraOn(newState);
    }
  }, [isCameraOn]);

  const toggleMic = useCallback(() => {
    if (callObjectRef.current) {
      const newState = !isMicOn;
      callObjectRef.current.setLocalAudio(newState);
      setIsMicOn(newState);
    }
  }, [isMicOn]);

  const toggleScreenShare = useCallback(async () => {
    if (callObjectRef.current) {
      try {
        if (isScreenSharing) {
          await callObjectRef.current.stopScreenShare();
          setIsScreenSharing(false);
        } else {
          await callObjectRef.current.startScreenShare();
          setIsScreenSharing(true);
        }
      } catch (err) {
        console.error('Screen share error:', err);
        // User cancelled or permission denied - don't disconnect
        setIsScreenSharing(false);
      }
    }
  }, [isScreenSharing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.leave();
        callObjectRef.current.destroy();
      }
    };
  }, []);

  return {
    callObject,
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
  };
};
