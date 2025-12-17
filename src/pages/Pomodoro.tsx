import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import SupportButton from '@/components/SupportButton';

const WORK_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface RevisionSession {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  subject: {
    id: string;
    name: string;
    color: string;
  } | null;
}

const Pomodoro = () => {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [suggestedSessions, setSuggestedSessions] = useState<RevisionSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<RevisionSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchTodaySessions();
  }, [user, navigate]);

  const fetchTodaySessions = async () => {
    if (!user) return;
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = format(new Date(), 'HH:mm');
      
      const { data, error } = await supabase
        .from('revision_sessions')
        .select(`
          id,
          date,
          start_time,
          end_time,
          status,
          subject:subjects(id, name, color)
        `)
        .eq('user_id', user.id)
        .eq('date', today)
        .neq('status', 'done')
        .neq('status', 'skipped')
        .gte('end_time', now)
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      const sessions = (data || []).map(session => ({
        ...session,
        subject: Array.isArray(session.subject) ? session.subject[0] : session.subject
      }));
      
      setSuggestedSessions(sessions);
      
      if (sessions.length > 0 && !selectedSession) {
        setSelectedSession(sessions[0]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSessionTime = useCallback((type: SessionType) => {
    switch (type) {
      case 'work': return WORK_TIME;
      case 'shortBreak': return SHORT_BREAK;
      case 'longBreak': return LONG_BREAK;
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (sessionType === 'work') {
        setCompletedPomodoros((prev) => prev + 1);
        if ((completedPomodoros + 1) % 4 === 0) {
          setSessionType('longBreak');
          setTimeLeft(LONG_BREAK);
        } else {
          setSessionType('shortBreak');
          setTimeLeft(SHORT_BREAK);
        }
      } else {
        setSessionType('work');
        setTimeLeft(WORK_TIME);
      }
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType, completedPomodoros]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSessionTime = (startTime: string, endTime: string) => {
    return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getSessionTime(sessionType));
  };

  const switchSession = (type: SessionType) => {
    setSessionType(type);
    setTimeLeft(getSessionTime(type));
    setIsRunning(false);
  };

  const selectRevisionSession = (session: RevisionSession) => {
    setSelectedSession(session);
    setSessionType('work');
    setTimeLeft(WORK_TIME);
    setIsRunning(false);
  };

  const progress = ((getSessionTime(sessionType) - timeLeft) / getSessionTime(sessionType)) * 100;

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'work': return 'Focus';
      case 'shortBreak': return 'Pause courte';
      case 'longBreak': return 'Pause longue';
    }
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work': return 'text-primary';
      case 'shortBreak': return 'text-green-500';
      case 'longBreak': return 'text-blue-500';
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Timer className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Pomodoro</h1>
      </div>

      {/* Main Content - Centered Timer Layout */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Selected Session Banner */}
        {selectedSession && (
          <Card 
            className="border-0 shadow-sm overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${selectedSession.subject?.color || '#FFC107'}15 0%, ${selectedSession.subject?.color || '#FFC107'}08 100%)`,
              borderLeft: `4px solid ${selectedSession.subject?.color || '#FFC107'}`
            }}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <Brain className="w-5 h-5" style={{ color: selectedSession.subject?.color || '#FFC107' }} />
              <div>
                <p className="text-sm text-muted-foreground">En train de réviser</p>
                <p className="font-semibold">{selectedSession.subject?.name || 'Sans matière'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Type Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={sessionType === 'work' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchSession('work')}
            className="gap-2"
          >
            <Brain className="w-4 h-4" />
            Focus
          </Button>
          <Button
            variant={sessionType === 'shortBreak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchSession('shortBreak')}
            className="gap-2"
          >
            <Coffee className="w-4 h-4" />
            Pause courte
          </Button>
          <Button
            variant={sessionType === 'longBreak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchSession('longBreak')}
            className="gap-2"
          >
            <Coffee className="w-4 h-4" />
            Pause longue
          </Button>
        </div>

        {/* Timer Display */}
        <Card className="border shadow-sm">
          <CardContent className="py-10 flex flex-col items-center">
            <div className="relative w-44 h-44 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 * (1 - progress / 100)}
                  strokeLinecap="round"
                  className={cn("transition-all duration-1000", getSessionColor())}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
                <span className={cn("text-sm font-medium mt-1", getSessionColor())}>{getSessionLabel()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
                className="w-11 h-11 rounded-full"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                onClick={toggleTimer}
                className="w-14 h-14 rounded-full"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pomodoros</p>
                <p className="text-xl font-bold">{completedPomodoros}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">🍅 Méthode</p>
              <p className="text-sm">25 min focus → 5 min pause</p>
            </CardContent>
          </Card>
        </div>

        {/* Sessions du jour */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Sessions du jour</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-16 bg-muted rounded-lg animate-pulse" />
              <div className="h-16 bg-muted rounded-lg animate-pulse" />
            </div>
          ) : suggestedSessions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedSessions.map((session) => (
                <Card
                  key={session.id}
                  className={cn(
                    "border shadow-sm cursor-pointer transition-all hover:shadow-md",
                    selectedSession?.id === session.id && "ring-2 ring-primary"
                  )}
                  onClick={() => selectRevisionSession(session)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${session.subject?.color || '#FFC107'}20` }}
                      >
                        <BookOpen 
                          className="w-4 h-4" 
                          style={{ color: session.subject?.color || '#FFC107' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.subject?.name || 'Sans matière'}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatSessionTime(session.start_time, session.end_time)}</span>
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 text-muted-foreground",
                        selectedSession?.id === session.id && "text-primary"
                      )} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border shadow-sm">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune session prévue aujourd'hui</p>
                <Button 
                  variant="link" 
                  className="mt-1 text-sm h-auto p-0"
                  onClick={() => navigate('/app')}
                >
                  Voir le calendrier
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <SupportButton />
    </div>
  );
};

export default Pomodoro;
