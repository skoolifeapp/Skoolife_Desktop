import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowRight, ArrowLeft, User, GraduationCap, Calendar, 
  Plus, X, Loader2, CheckCircle2 
} from 'lucide-react';
import logo from '@/assets/logo.png';

const SUBJECT_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6',
  '#EF4444', '#6366F1', '#84CC16', '#F59E0B'
];

const LEVELS = [
  'Lycée - Seconde',
  'Lycée - Première',
  'Lycée - Terminale',
  'BTS',
  'BUT',
  'Licence 1',
  'Licence 2',
  'Licence 3',
  'Master 1',
  'Master 2',
  'Prépa',
  'Concours',
  'Autre'
];

const EXAM_PERIODS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Septembre',
  'Décembre'
];

interface Subject {
  id: string;
  name: string;
  color: string;
  examDate: string;
  examWeight: number;
}

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Step 1 data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [school, setSchool] = useState('');
  const [level, setLevel] = useState('');
  const [examPeriod, setExamPeriod] = useState('');

  // Step 2 data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Step 3 data
  const [weeklyHours, setWeeklyHours] = useState([10]);
  const [noWorkSlots, setNoWorkSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if onboarding is already complete
    const checkProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_onboarding_complete, first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.is_onboarding_complete) {
        navigate('/app');
      } else if (data?.first_name) {
        setFirstName(data.first_name);
        setLastName(data.last_name || '');
      }
      setCheckingProfile(false);
    };

    checkProfile();
  }, [user, navigate]);

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: newSubjectName.trim(),
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
      examDate: '',
      examWeight: 3
    };
    
    setSubjects([...subjects, newSubject]);
    setNewSubjectName('');
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
    setSubjects(subjects.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const toggleNoWorkSlot = (slot: string) => {
    if (noWorkSlots.includes(slot)) {
      setNoWorkSlots(noWorkSlots.filter(s => s !== slot));
    } else {
      setNoWorkSlots([...noWorkSlots, slot]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!firstName.trim()) {
        toast.error('Entre ton prénom');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (subjects.length === 0) {
        toast.error('Ajoute au moins une matière');
        return;
      }
      setStep(3);
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    
    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          school,
          level,
          main_exam_period: examPeriod,
          weekly_revision_hours: weeklyHours[0],
          is_onboarding_complete: true
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Insert subjects
      const subjectsToInsert = subjects.map(s => ({
        user_id: user.id,
        name: s.name,
        color: s.color,
        exam_date: s.examDate || null,
        exam_weight: s.examWeight
      }));

      const { error: subjectsError } = await supabase
        .from('subjects')
        .insert(subjectsToInsert);

      if (subjectsError) throw subjectsError;

      // Insert constraints for no-work slots
      if (noWorkSlots.length > 0) {
        const constraintsToInsert = noWorkSlots.map(slot => ({
          user_id: user.id,
          type: 'no_work_slot',
          title: slot,
          payload: { slot }
        }));

        await supabase.from('constraints').insert(constraintsToInsert);
      }

      navigate('/app');
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt="Skoolife" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold text-foreground">Skoolife</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-20">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Étape {step}/3</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: About you */}
        {step === 1 && (
          <Card className="border-0 shadow-lg animate-slide-up">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">À propos de toi</CardTitle>
              <CardDescription>
                Dis-nous en plus sur toi pour personnaliser ton expérience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Ton prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    placeholder="Ton nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">Établissement</Label>
                <Input
                  id="school"
                  placeholder="Nom de ton école/université"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Niveau d'études</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sélectionne ton niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Période principale d'examens</Label>
                <Select value={examPeriod} onValueChange={setExamPeriod}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Quand as-tu tes examens ?" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_PERIODS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="hero" size="lg" className="w-full" onClick={handleNext}>
                Continuer
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Subjects */}
        {step === 2 && (
          <Card className="border-0 shadow-lg animate-slide-up">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Tes matières & examens</CardTitle>
              <CardDescription>
                Ajoute les matières que tu dois réviser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add subject */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nom de la matière (ex: Maths)"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                  className="h-12"
                />
                <Button onClick={addSubject} size="icon" className="h-12 w-12 shrink-0">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Subject list */}
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <div 
                    key={subject.id}
                    className="p-4 rounded-xl bg-secondary/50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium">{subject.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeSubject(subject.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Date d'examen</Label>
                        <Input
                          type="date"
                          value={subject.examDate}
                          onChange={(e) => updateSubject(subject.id, 'examDate', e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Importance ({subject.examWeight}/5)
                        </Label>
                        <Slider
                          value={[subject.examWeight]}
                          onValueChange={([v]) => updateSubject(subject.id, 'examWeight', v)}
                          min={1}
                          max={5}
                          step={1}
                          className="py-3"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {subjects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>Ajoute tes matières ci-dessus</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
                <Button variant="hero" size="lg" onClick={handleNext} className="flex-1">
                  Continuer
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Constraints */}
        {step === 3 && (
          <Card className="border-0 shadow-lg animate-slide-up">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Tes contraintes</CardTitle>
              <CardDescription>
                Aide-nous à adapter ton planning à ton rythme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Weekly hours */}
              <div className="space-y-4">
                <Label className="text-base">
                  Combien d'heures de révisions par semaine ?
                </Label>
                <div className="px-2">
                  <Slider
                    value={weeklyHours}
                    onValueChange={setWeeklyHours}
                    min={5}
                    max={40}
                    step={1}
                    className="py-4"
                  />
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">{weeklyHours[0]}</span>
                  <span className="text-muted-foreground ml-2">heures/semaine</span>
                </div>
              </div>

              {/* No-work slots */}
              <div className="space-y-4">
                <Label className="text-base">
                  Quand tu NE veux PAS réviser :
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Tôt le matin (avant 8h)',
                    'Tard le soir (après 21h)',
                    'Le samedi',
                    'Le dimanche',
                    'Pendant les repas'
                  ].map((slot) => (
                    <Badge
                      key={slot}
                      variant={noWorkSlots.includes(slot) ? 'default' : 'outline'}
                      className={`cursor-pointer py-2 px-4 text-sm transition-all ${
                        noWorkSlots.includes(slot) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-secondary'
                      }`}
                      onClick={() => toggleNoWorkSlot(slot)}
                    >
                      {noWorkSlots.includes(slot) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep(2)} className="flex-1">
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={handleFinish} 
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Terminer
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivational text */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Ton planning s'ajuste à ton rythme, pas l'inverse. ✨
        </p>
      </main>
    </div>
  );
};

export default Onboarding;