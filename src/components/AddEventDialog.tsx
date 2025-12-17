import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addWeeks, addDays, isBefore, isEqual, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Loader2, FileText, Upload, Trash2, Link, Plus, Video, Users, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PendingFile {
  file: File;
  id: string;
}

interface PendingLink {
  url: string;
  title: string;
  id: string;
}

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
].join(',');

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📈';
  if (fileType.includes('image')) return '🖼️';
  return '📎';
};

const extractDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.length > 20 ? domain.slice(0, 20) + '...' : domain;
  } catch {
    return url.slice(0, 20) + '...';
  }
};

const EVENT_TYPES = [
  { value: 'cours', label: 'Cours' },
  { value: 'travail', label: 'Travail' },
  { value: 'perso', label: 'Personnel' },
  { value: 'revision_libre', label: 'Révision libre' },
  { value: 'visio', label: 'Visio' },
  { value: 'autre', label: 'Autre' },
];

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 0, label: 'Dim' },
];

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(100, 'Le titre est trop long'),
  event_type: z.string().min(1, 'Sélectionne un type'),
  date: z.date({ required_error: 'La date est obligatoire' }),
  start_time: z.string().min(1, 'L\'heure de début est obligatoire'),
  end_time: z.string().min(1, 'L\'heure de fin est obligatoire'),
  recurrence: z.enum(['none', 'daily', 'weekdays', 'weekly', 'custom']),
  recurrence_end_date: z.date().optional().nullable(),
  custom_days: z.array(z.number()).optional(),
  is_blocking: z.boolean(),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.start_time < data.end_time;
  }
  return true;
}, {
  message: "L'heure de fin doit être après l'heure de début",
  path: ['end_time'],
}).refine((data) => {
  if (data.recurrence !== 'none' && data.recurrence_end_date) {
    return !isBefore(data.recurrence_end_date, data.date);
  }
  return true;
}, {
  message: "La date de fin de récurrence doit être après la date de début",
  path: ['recurrence_end_date'],
}).refine((data) => {
  if (data.recurrence !== 'none' && !data.recurrence_end_date) {
    return false;
  }
  return true;
}, {
  message: "La date de fin est obligatoire pour les récurrences",
  path: ['recurrence_end_date'],
}).refine((data) => {
  if (data.recurrence === 'custom' && (!data.custom_days || data.custom_days.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Sélectionne au moins un jour",
  path: ['custom_days'],
});

type FormValues = z.infer<typeof formSchema>;

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventAdded: () => void;
  initialDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
}

// Helper to format date as YYYY-MM-DD without timezone issues
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AddEventDialog = ({ open, onOpenChange, onEventAdded, initialDate, initialStartTime, initialEndTime }: AddEventDialogProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [pendingLinks, setPendingLinks] = useState<PendingLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Visio state
  const [generatedVisioLink, setGeneratedVisioLink] = useState<string | null>(null);
  const [generatingVisio, setGeneratingVisio] = useState(false);
  const [inviteTab, setInviteTab] = useState<'code' | 'link'>('code');
  const [inviteCode, setInviteCode] = useState('');
  const [invitedUsers, setInvitedUsers] = useState<{ id: string; name: string; code: string }[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      event_type: 'autre',
      date: initialDate,
      start_time: initialStartTime || '09:00',
      end_time: initialEndTime || '10:30',
      recurrence: 'none',
      recurrence_end_date: null,
      custom_days: [],
      is_blocking: true,
    },
  });

  // Reset form with initial values when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        event_type: 'autre',
        date: initialDate,
        start_time: initialStartTime || '09:00',
        end_time: initialEndTime || '10:30',
        recurrence: 'none',
        recurrence_end_date: null,
        custom_days: [],
        is_blocking: true,
      });
      setPendingFiles([]);
      setPendingLinks([]);
      setNewLinkUrl('');
      setNewLinkTitle('');
      setShowLinkInput(false);
      setGeneratedVisioLink(null);
      setInvitedUsers([]);
      setInviteCode('');
      setLinkCopied(false);
    }
  }, [open, initialDate, initialStartTime, initialEndTime]);

  const recurrence = form.watch('recurrence');
  const customDays = form.watch('custom_days') || [];
  const eventType = form.watch('event_type');

  const showFilesSection = eventType === 'cours' || eventType === 'revision_libre';
  const isVisioEvent = eventType === 'visio';

  // Auto-generate visio link when visio type is selected
  useEffect(() => {
    if (isVisioEvent && !generatedVisioLink && !generatingVisio) {
      generateVisioLink();
    }
  }, [isVisioEvent]);

  const generateVisioLink = async () => {
    if (!user || generatingVisio) return;
    setGeneratingVisio(true);
    try {
      const formDate = form.getValues('date') || new Date();
      const startTime = form.getValues('start_time') || '09:00';
      const title = form.getValues('title') || 'Visio';
      
      const { data, error } = await supabase.functions.invoke('create-daily-room', {
        body: {
          sessionId: crypto.randomUUID(),
          sessionDate: formatLocalDate(formDate),
          sessionTime: startTime,
          subjectName: title
        }
      });
      
      if (error) throw error;
      if (data?.roomUrl) {
        setGeneratedVisioLink(data.roomUrl);
      }
    } catch (err) {
      console.error('Error generating visio link:', err);
      toast.error('Erreur lors de la génération du lien visio');
    } finally {
      setGeneratingVisio(false);
    }
  };

  const copyVisioLink = async () => {
    if (!generatedVisioLink) return;
    try {
      await navigator.clipboard.writeText(generatedVisioLink);
      setLinkCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  const inviteByCode = async () => {
    if (!inviteCode.trim() || !user) return;
    
    try {
      // Find user by liaison code
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, liaison_code')
        .eq('liaison_code', inviteCode.trim().toUpperCase())
        .limit(1);
      
      if (profileError) throw profileError;
      
      if (!profiles || profiles.length === 0) {
        toast.error('Code non trouvé');
        return;
      }
      
      const profile = profiles[0];
      
      if (profile.id === user.id) {
        toast.error('Tu ne peux pas t\'inviter toi-même');
        return;
      }
      
      if (invitedUsers.some(u => u.id === profile.id)) {
        toast.error('Déjà invité');
        return;
      }
      
      setInvitedUsers(prev => [...prev, {
        id: profile.id,
        name: profile.first_name || 'Camarade',
        code: profile.liaison_code || inviteCode
      }]);
      setInviteCode('');
      toast.success(`${profile.first_name || 'Camarade'} ajouté`);
    } catch (err) {
      console.error('Error inviting by code:', err);
      toast.error('Erreur lors de l\'invitation');
    }
  };

  const removeInvitedUser = (userId: string) => {
    setInvitedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const toggleCustomDay = (dayValue: number) => {
    const current = form.getValues('custom_days') || [];
    if (current.includes(dayValue)) {
      form.setValue('custom_days', current.filter(d => d !== dayValue));
    } else {
      form.setValue('custom_days', [...current, dayValue]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles: PendingFile[] = Array.from(files).map(file => ({
      file,
      id: crypto.randomUUID()
    }));
    
    setPendingFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingFile = (id: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id));
  };

  const addLink = () => {
    if (!newLinkUrl.trim()) return;
    
    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    setPendingLinks(prev => [...prev, {
      url,
      title: newLinkTitle.trim(),
      id: crypto.randomUUID()
    }]);
    setNewLinkUrl('');
    setNewLinkTitle('');
    setShowLinkInput(false);
  };

  const removeLink = (id: string) => {
    setPendingLinks(prev => prev.filter(l => l.id !== id));
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    setSaving(true);

    try {
      const eventsToInsert: {
        user_id: string;
        title: string;
        event_type: string;
        start_datetime: string;
        end_datetime: string;
        source: string;
        is_blocking: boolean;
        recurrence_group_id: string | null;
      }[] = [];

      // Generate a unique group ID for recurring events
      const recurrenceGroupId = values.recurrence !== 'none' ? crypto.randomUUID() : null;

      const createEventForDate = (date: Date, source: string) => {
        const dateStr = formatLocalDate(date);
        // Create Date objects with local time, then convert to UTC ISO string
        const startDate = new Date(`${dateStr}T${values.start_time}:00`);
        const endDate = new Date(`${dateStr}T${values.end_time}:00`);
        return {
          user_id: user.id,
          title: values.title,
          event_type: values.event_type,
          start_datetime: startDate.toISOString(),
          end_datetime: endDate.toISOString(),
          source,
          is_blocking: values.is_blocking,
          recurrence_group_id: recurrenceGroupId,
        };
      };

      if (values.recurrence === 'none') {
        // Single event
        eventsToInsert.push(createEventForDate(values.date, 'manual'));
      } else {
        // Recurring events
        const endDate = values.recurrence_end_date!;
        let currentDate = new Date(values.date);

        while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
          const dayOfWeek = getDay(currentDate); // 0 = Sunday, 1 = Monday, etc.
          let shouldAdd = false;

          switch (values.recurrence) {
            case 'daily':
              shouldAdd = true;
              break;
            case 'weekdays':
              shouldAdd = dayOfWeek >= 1 && dayOfWeek <= 5;
              break;
            case 'weekly':
              shouldAdd = dayOfWeek === getDay(values.date);
              break;
            case 'custom':
              shouldAdd = (values.custom_days || []).includes(dayOfWeek);
              break;
          }

          if (shouldAdd) {
            eventsToInsert.push(createEventForDate(currentDate, 'manual_recurring'));
          }

          currentDate = addDays(currentDate, 1);
        }
      }

      if (eventsToInsert.length === 0) {
        toast.error('Aucun évènement à créer avec ces paramètres');
        setSaving(false);
        return;
      }

      const { data: createdEvents, error } = await supabase
        .from('calendar_events')
        .insert(eventsToInsert)
        .select();

      if (error) throw error;

      // Upload files and links to the first created event
      const firstEventId = createdEvents?.[0]?.id;
      if (firstEventId && (pendingFiles.length > 0 || pendingLinks.length > 0)) {
        // Extract subject name from title for resource sharing
        // Same logic as ICS import: take first segment before " - "
        let subjectName: string | null = null;
        if (values.event_type === 'cours' || values.event_type === 'revision_libre') {
          const dashIndex = values.title.indexOf(' - ');
          subjectName = dashIndex > 0 ? values.title.substring(0, dashIndex).trim() : values.title.trim();
        }

        // Upload files
        for (const pendingFile of pendingFiles) {
          const fileExt = pendingFile.file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${user.id}/event/${firstEventId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('course_files')
            .upload(filePath, pendingFile.file);

          if (!uploadError) {
            await supabase.from('session_files').insert({
              user_id: user.id,
              event_id: firstEventId,
              file_name: pendingFile.file.name,
              file_path: filePath,
              file_size: pendingFile.file.size,
              file_type: pendingFile.file.type,
              subject_name: subjectName
            });
          }
        }

        // Add links
        for (const link of pendingLinks) {
          await supabase.from('session_links').insert({
            user_id: user.id,
            event_id: firstEventId,
            url: link.url,
            title: link.title || null,
            subject_name: subjectName
          });
        }
      }

      form.reset();
      setPendingFiles([]);
      setPendingLinks([]);
      onOpenChange(false);
      onEventAdded();
    } catch (err) {
      console.error('Error adding event:', err);
      toast.error('Erreur lors de l\'ajout de l\'évènement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un évènement</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'évènement</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cours de compta, Job étudiant..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Type */}
            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'évènement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionne un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de début</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: fr })
                          ) : (
                            <span>Choisis une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time inputs */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de début</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Recurrence */}
            <FormField
              control={form.control}
              name="recurrence"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Récurrence</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none" className="font-normal cursor-pointer">
                          Aucune (une seule fois)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily" className="font-normal cursor-pointer">
                          Tous les jours
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekdays" id="weekdays" />
                        <Label htmlFor="weekdays" className="font-normal cursor-pointer">
                          Tous les jours de semaine (lun–ven)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly" className="font-normal cursor-pointer">
                          Toutes les semaines (même jour)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom" className="font-normal cursor-pointer">
                          Personnalisée
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom days selection */}
            {recurrence === 'custom' && (
              <FormField
                control={form.control}
                name="custom_days"
                render={() => (
                  <FormItem>
                    <FormLabel>Jours de la semaine</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <Button
                          key={day.value}
                          type="button"
                          variant={customDays.includes(day.value) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCustomDay(day.value)}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Recurrence end date */}
            {recurrence !== 'none' && (
              <FormField
                control={form.control}
                name="recurrence_end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Jusqu'à quelle date ?</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: fr })
                            ) : (
                              <span>Choisis une date de fin</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          disabled={(date) => {
                            const formDate = form.getValues('date');
                            return formDate ? isBefore(date, formDate) : false;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Is blocking */}
            <FormField
              control={form.control}
              name="is_blocking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Bloquer ce créneau pour le planning de révisions
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Aucune session de révision ne sera placée sur ce créneau.
                    </p>
                  </div>
              </FormItem>
              )}
            />

            {/* Files section for cours/revision_libre */}
            {showFilesSection && (
              <div className="rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    <span>Fichiers de cours</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLinkInput(!showLinkInput)}
                      className="h-7 px-2 text-xs"
                    >
                      <Link className="w-3 h-3 mr-1" />
                      Lien
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 px-2 text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Fichier
                    </Button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Link input */}
                {showLinkInput && (
                  <div className="space-y-2 p-2 rounded bg-muted/30">
                    <Input
                      placeholder="URL du lien"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Titre (optionnel)"
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => { setShowLinkInput(false); setNewLinkUrl(''); setNewLinkTitle(''); }}
                        className="h-7 text-xs"
                      >
                        Annuler
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={addLink}
                        disabled={!newLinkUrl.trim()}
                        className="h-7 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pending files list */}
                {pendingFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {pendingFiles.map((pf) => (
                      <div key={pf.id} className="flex items-center gap-2 p-2 rounded-md bg-background border hover:bg-muted/50 transition-colors">
                        <span className="text-lg flex-shrink-0">{getFileIcon(pf.file.type)}</span>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-xs font-medium truncate">{pf.file.name}</p>
                          <p className="text-[10px] text-muted-foreground">{formatFileSize(pf.file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePendingFile(pf.id)}
                          className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending links list */}
                {pendingLinks.length > 0 && (
                  <div className="space-y-1.5">
                    {pendingLinks.map((link) => (
                      <div key={link.id} className="flex items-center gap-2 p-2 rounded-md bg-background border hover:bg-muted/50 transition-colors">
                        <Link className="w-4 h-4 flex-shrink-0 text-blue-500" />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-xs text-blue-600 truncate">{link.title || extractDomain(link.url)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {pendingFiles.length === 0 && pendingLinks.length === 0 && !showLinkInput && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Aucun fichier ou lien ajouté
                  </p>
                )}
              </div>
            )}

            {/* Visio section */}
            {isVisioEvent && (
              <div className="rounded-md border p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Video className="w-4 h-4 text-violet-500" />
                  <span>Visioconférence</span>
                </div>

                {/* Generated link */}
                {generatingVisio ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Génération du lien...</span>
                  </div>
                ) : generatedVisioLink ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 rounded bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                      <Video className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      <span className="text-xs text-violet-700 dark:text-violet-300 truncate flex-1">
                        {generatedVisioLink}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={copyVisioLink}
                        className="h-7 px-2"
                      >
                        {linkCopied ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>

                    {/* Invitation tabs */}
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">Inviter des camarades</p>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant={inviteTab === 'code' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setInviteTab('code')}
                          className="h-7 text-xs"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          Code
                        </Button>
                        <Button
                          type="button"
                          variant={inviteTab === 'link' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setInviteTab('link')}
                          className="h-7 text-xs"
                        >
                          <Link className="w-3 h-3 mr-1" />
                          Lien
                        </Button>
                      </div>

                      {inviteTab === 'code' && (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Code liaison (ex: MARIE-7X2K)"
                              value={inviteCode}
                              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                              className="h-8 text-xs flex-1"
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={inviteByCode}
                              disabled={!inviteCode.trim()}
                              className="h-8"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          {invitedUsers.length > 0 && (
                            <div className="space-y-1.5">
                              {invitedUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
                                  <span>{user.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeInvitedUser(user.id)}
                                    className="text-destructive hover:text-destructive/80"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {inviteTab === 'link' && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Partage ce lien avec tes camarades pour qu'ils rejoignent la visio :
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyVisioLink}
                            className="w-full h-8 text-xs"
                          >
                            {linkCopied ? (
                              <>
                                <Check className="w-3 h-3 mr-1 text-green-500" />
                                Copié !
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" />
                                Copier le lien
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateVisioLink}
                    className="w-full"
                  >
                    <Video className="w-3.5 h-3.5 mr-2" />
                    Générer le lien visio
                  </Button>
                )}
              </div>
            )}


            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
