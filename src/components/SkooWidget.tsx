import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, X, Sparkles, MessageCircle } from 'lucide-react';
import { SkooAvatar } from './SkooAvatar';
import { useSkooCoach } from '@/hooks/useSkooCoach';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { startOfWeek, endOfWeek, differenceInDays, parseISO, isToday } from 'date-fns';

interface SkooWidgetProps {
  className?: string;
}

export function SkooWidget({ className = '' }: SkooWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const { user } = useAuth();
  const { 
    isLoading, 
    isSpeaking, 
    currentMessage, 
    getAndSpeak, 
    getCoachMessage,
    speakMessage,
    stopSpeaking 
  } = useSkooCoach();

  const [context, setContext] = useState<{
    firstName?: string;
    totalHoursThisWeek?: number;
    completedHoursThisWeek?: number;
    nextExamSubject?: string;
    nextExamDays?: number;
    todaySessionsCount?: number;
  }>({});

  // Fetch user context
  const fetchContext = useCallback(async () => {
    if (!user) return;

    try {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

      // Get this week's sessions
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

      const { data: sessions } = await supabase
        .from('revision_sessions')
        .select('start_time, end_time, status, date')
        .eq('user_id', user.id)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]);

      // Get subjects with exam dates
      const { data: subjects } = await supabase
        .from('subjects')
        .select('name, exam_date')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .not('exam_date', 'is', null)
        .order('exam_date', { ascending: true });

      // Calculate stats
      let totalHours = 0;
      let completedHours = 0;
      let todayCount = 0;

      sessions?.forEach(session => {
        const start = parseISO(`${session.date}T${session.start_time}`);
        const end = parseISO(`${session.date}T${session.end_time}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        totalHours += hours;
        if (session.status === 'done') {
          completedHours += hours;
        }
        if (isToday(parseISO(session.date))) {
          todayCount++;
        }
      });

      // Find next exam
      let nextExam: { subject: string; days: number } | null = null;
      if (subjects && subjects.length > 0) {
        const now = new Date();
        for (const subject of subjects) {
          if (subject.exam_date) {
            const examDate = parseISO(subject.exam_date);
            const days = differenceInDays(examDate, now);
            if (days >= 0) {
              nextExam = { subject: subject.name, days };
              break;
            }
          }
        }
      }

      setContext({
        firstName: profile?.first_name || undefined,
        totalHoursThisWeek: Math.round(totalHours * 10) / 10,
        completedHoursThisWeek: Math.round(completedHours * 10) / 10,
        nextExamSubject: nextExam?.subject,
        nextExamDays: nextExam?.days,
        todaySessionsCount: todayCount,
      });
    } catch (error) {
      console.error('Error fetching context:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  // Auto-greet on first open
  useEffect(() => {
    if (isOpen && !hasGreeted && !isLoading && !currentMessage) {
      setHasGreeted(true);
      getCoachMessage(context, 'greeting');
    }
  }, [isOpen, hasGreeted, isLoading, currentMessage, context, getCoachMessage]);

  const handleNewMessage = async (type: 'motivation' | 'tip' | 'reminder') => {
    await getAndSpeak(context, type);
  };

  if (!user) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SkooAvatar size="sm" speaking={isSpeaking} />
                <div>
                  <h3 className="font-semibold text-foreground">Skoo</h3>
                  <p className="text-xs text-muted-foreground">Ton coach d'études</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => isSpeaking ? stopSpeaking() : currentMessage && speakMessage(currentMessage)}
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Message */}
            <div className="p-4 min-h-[100px] flex items-center justify-center">
              {isLoading ? (
                <motion.div
                  className="flex gap-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </motion.div>
              ) : (
                <motion.p
                  key={currentMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-foreground leading-relaxed"
                >
                  {currentMessage || "Clique sur un bouton pour que je te parle !"}
                </motion.p>
              )}
            </div>

            {/* Actions */}
            <div className="p-3 bg-muted/30 flex gap-2 flex-wrap justify-center">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleNewMessage('motivation')}
                disabled={isLoading}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Motive-moi
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleNewMessage('tip')}
                disabled={isLoading}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Un conseil
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleNewMessage('reminder')}
                disabled={isLoading}
              >
                📚 Rappel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating avatar button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
      >
        <SkooAvatar
          size="lg"
          speaking={isSpeaking}
          onClick={() => setIsOpen(!isOpen)}
          className="shadow-xl hover:shadow-2xl transition-shadow"
        />
        
        {/* Notification badge */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
          >
            <Sparkles className="h-3 w-3 text-primary-foreground" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
