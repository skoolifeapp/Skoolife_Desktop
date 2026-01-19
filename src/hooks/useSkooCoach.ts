import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudentContext {
  firstName?: string;
  totalHoursThisWeek?: number;
  completedHoursThisWeek?: number;
  nextExamSubject?: string;
  nextExamDays?: number;
  todaySessionsCount?: number;
  streakDays?: number;
  lastActivity?: string;
}

type MessageType = 'motivation' | 'greeting' | 'reminder' | 'celebration' | 'tip';

export function useSkooCoach() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const getCoachMessage = useCallback(async (
    context: StudentContext,
    messageType: MessageType = 'motivation'
  ): Promise<string> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('skoo-coach', {
        body: { context, messageType }
      });

      if (error) throw error;
      
      const message = data?.message || "Continue comme ça !";
      setCurrentMessage(message);
      return message;
    } catch (error) {
      console.error('Error getting coach message:', error);
      const fallback = "Tu fais du super boulot, continue !";
      setCurrentMessage(fallback);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const speakMessage = useCallback(async (text: string): Promise<void> => {
    if (isSpeaking && audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsSpeaking(false);
      setAudioElement(null);
      return;
    }

    setIsSpeaking(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/skoo-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setAudioElement(audio);
      
      audio.onended = () => {
        setIsSpeaking(false);
        setAudioElement(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setAudioElement(null);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error speaking message:', error);
      setIsSpeaking(false);
      setAudioElement(null);
    }
  }, [isSpeaking, audioElement]);

  const getAndSpeak = useCallback(async (
    context: StudentContext,
    messageType: MessageType = 'motivation'
  ): Promise<string> => {
    const message = await getCoachMessage(context, messageType);
    await speakMessage(message);
    return message;
  }, [getCoachMessage, speakMessage]);

  const stopSpeaking = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsSpeaking(false);
      setAudioElement(null);
    }
  }, [audioElement]);

  return {
    isLoading,
    isSpeaking,
    currentMessage,
    getCoachMessage,
    speakMessage,
    getAndSpeak,
    stopSpeaking,
  };
}
