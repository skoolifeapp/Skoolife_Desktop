import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, BookOpen, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
        .gte('date', today)
        .neq('status', 'done')
        .neq('status', 'skipped')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(6);

      if (error) throw error;
      
      const sessions = (data || []).map(session => ({
        ...session,
        subject: Array.isArray(session.subject) ? session.subject[0] : session.subject
      }));
      
      setSuggestedSessions(sessions);
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

  const formatSessionDate = (date: string) => {
    const sessionDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (format(sessionDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return "Aujourd'hui";
    } else if (format(sessionDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return "Demain";
    }
    return format(sessionDate, 'EEEE d MMM', { locale: fr });
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

  const selectAndStartSession = (session: RevisionSession) => {
    setSelectedSession(session);
    setSessionType('work');
    setTimeLeft(WORK_TIME);
    setIsRunning(true);
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
    <div className="flex-1 p-6 md:p-8 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Timer className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pomodoro</h1>
            <p className="text-sm text-muted-foreground">Concentre-toi avec la méthode 25/5</p>
          </div>
        </div>

        {/* Session Type Buttons */}
        <div className="flex gap-2 justify-center mb-6">
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

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column - Timer */}
          <div className="space-y-6">
            {/* Timer Card */}
            <Card className="border shadow-sm">
              <CardContent className="py-12 flex flex-col items-center">
                {/* Selected Session Indicator */}
                {selectedSession && (
                  <div 
                    className="mb-6 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                    style={{ 
                      backgroundColor: `${selectedSession.subject?.color || '#FFC107'}20`,
                      color: selectedSession.subject?.color || '#FFC107'
                    }}
                  >
                    <Target className="w-4 h-4" />
                    {selectedSession.subject?.name || 'Sans matière'}
                  </div>
                )}

                {/* Timer Circle */}
                <div className="relative w-52 h-52 mb-8">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="104"
                      cy="104"
                      r="96"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="104"
                      cy="104"
                      r="96"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 96}
                      strokeDashoffset={2 * Math.PI * 96 * (1 - progress / 100)}
                      strokeLinecap="round"
                      className={cn("transition-all duration-1000", getSessionColor())}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold tabular-nums">{formatTime(timeLeft)}</span>
                    <span className={cn("text-sm font-medium mt-2", getSessionColor())}>{getSessionLabel()}</span>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetTimer}
                    className="w-12 h-12 rounded-full"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={toggleTimer}
                    className="w-12 h-12 rounded-full"
                  >
                    {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pomodoros</p>
                    <p className="text-2xl font-bold">{completedPomodoros}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Temps focus</p>
                    <p className="text-2xl font-bold">{completedPomodoros * 25} min</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Sessions */}
          <div className="space-y-4">
            <Card className="border shadow-sm">
              <CardContent className="p-4 space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : suggestedSessions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestedSessions.map((session) => (
                      <Card
                        key={session.id}
                        className={cn(
                          "border shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]",
                          selectedSession?.id === session.id && "ring-2 ring-primary"
                        )}
                        onClick={() => selectAndStartSession(session)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${session.subject?.color || '#FFC107'}20` }}
                            >
                              <BookOpen
                                className="w-5 h-5"
                                style={{ color: session.subject?.color || '#FFC107' }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{session.subject?.name || 'Sans matière'}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                  {formatSessionDate(session.date)}
                                </span>
                                <Clock className="w-3.5 h-3.5" />
                                <span>{formatSessionTime(session.start_time, session.end_time)}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="gap-1.5 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectAndStartSession(session);
                              }}
                            >
                              <Play className="w-3.5 h-3.5" />
                              Focus
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">Aucune session à venir</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Génère ton planning pour voir tes sessions ici
                    </p>
                    <Button variant="outline" onClick={() => navigate('/app')}>
                      Aller au calendrier
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Method Explanation */}
            <Card className="border shadow-sm bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🍅</div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">La méthode Pomodoro</h3>
                    <p className="text-sm text-muted-foreground">
                      Travaille 25 minutes avec concentration, puis prends 5 minutes de pause. 
                      Après 4 cycles, accorde-toi une pause longue de 15 minutes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
