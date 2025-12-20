import { createContext, useContext, useState, ReactNode } from 'react';

interface VideoCallState {
  isActive: boolean;
  roomUrl: string | null;
  sessionTitle: string | null;
}

interface VideoCallContextType {
  videoCall: VideoCallState;
  startCall: (roomUrl: string, sessionTitle?: string) => void;
  endCall: () => void;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

export const VideoCallProvider = ({ children }: { children: ReactNode }) => {
  const [videoCall, setVideoCall] = useState<VideoCallState>({
    isActive: false,
    roomUrl: null,
    sessionTitle: null,
  });

  const startCall = (roomUrl: string, sessionTitle?: string) => {
    setVideoCall({
      isActive: true,
      roomUrl,
      sessionTitle: sessionTitle || null,
    });
  };

  const endCall = () => {
    setVideoCall({
      isActive: false,
      roomUrl: null,
      sessionTitle: null,
    });
  };

  return (
    <VideoCallContext.Provider value={{ videoCall, startCall, endCall }}>
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};
