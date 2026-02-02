import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface GoogleCalendarEvent {
  title: string;
  start: string;
  end: string;
  location?: string;
  isAllDay: boolean;
  googleEventId: string;
}

export function useGoogleCalendar() {
  const { session } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const checkConnectionStatus = useCallback(async () => {
    if (!session?.access_token) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: null,
        method: 'GET',
      });

      // Use query params approach
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=status`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setIsConnected(result.connected);
      }
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  const initiateConnection = useCallback(async () => {
    if (!session?.access_token) {
      toast.error('Tu dois être connecté pour lier Google Calendar');
      return;
    }

    setIsConnecting(true);

    try {
      const redirectUri = `${window.location.origin}/dashboard`;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=auth-url&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }

      const { url } = await response.json();
      
      // Store current location to redirect back after auth
      sessionStorage.setItem('google_calendar_redirect', window.location.pathname);
      
      // Redirect to Google OAuth
      window.location.href = url;
    } catch (error) {
      console.error('Error initiating Google Calendar connection:', error);
      toast.error('Erreur lors de la connexion à Google Calendar');
      setIsConnecting(false);
    }
  }, [session?.access_token]);

  const handleCallback = useCallback(async (code: string) => {
    if (!session?.access_token) return false;

    try {
      const redirectUri = `${window.location.origin}/dashboard`;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=callback`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, redirect_uri: redirectUri }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to complete authentication');
      }

      setIsConnected(true);
      toast.success('Google Calendar connecté !');
      return true;
    } catch (error) {
      console.error('Error handling callback:', error);
      toast.error('Erreur lors de la connexion à Google Calendar');
      return false;
    }
  }, [session?.access_token]);

  const disconnect = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=disconnect`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setIsConnected(false);
        toast.success('Google Calendar déconnecté');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  }, [session?.access_token]);

  const fetchEvents = useCallback(async (timeMin: Date, timeMax: Date): Promise<GoogleCalendarEvent[]> => {
    if (!session?.access_token || !isConnected) {
      return [];
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=events&time_min=${timeMin.toISOString()}&time_max=${timeMax.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.error === 'Token expired, please reconnect') {
          setIsConnected(false);
          toast.error('La connexion Google Calendar a expiré. Reconnecte-toi.');
        }
        throw new Error(error.error);
      }

      const { events } = await response.json();
      return events;
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw error;
    }
  }, [session?.access_token, isConnected]);

  return {
    isConnected,
    isLoading,
    isConnecting,
    initiateConnection,
    handleCallback,
    disconnect,
    fetchEvents,
    checkConnectionStatus,
  };
}
