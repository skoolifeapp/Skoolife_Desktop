import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, CheckCircle2, Calendar, Link2, Unlink } from 'lucide-react';
import ICAL from 'ical.js';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ParsedEvent {
  title: string;
  start: Date;
  end: Date;
  location?: string;
  isAllDay: boolean;
  subjectName?: string;
}

// Extract subject name from DESCRIPTION field (Hyperplanning format)
// Tolerates variants: "Matière :", "Matiere:", "Matière:", etc.
const extractSubjectFromDescription = (description: string | undefined): string | null => {
  if (!description) return null;
  
  // Match "Matière :" or "Matiere :" with various spacing and accents
  const matiereRegex = /mati[eè]re\s*:\s*([^\n\r]+)/i;
  const match = description.match(matiereRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return null;
};

// Extract subject name from SUMMARY field (NetYParéo format)
// Takes the first segment before " - "
const extractSubjectFromSummary = (summary: string): string | null => {
  if (!summary) return null;
  
  const dashIndex = summary.indexOf(' - ');
  if (dashIndex > 0) {
    return summary.substring(0, dashIndex).trim();
  }
  
  // If no " - " found, return the whole summary as subject name
  return summary.trim();
};

const ImportCalendarDialog = ({ open, onOpenChange, onImportComplete }: ImportCalendarDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [importingGoogle, setImportingGoogle] = useState(false);
  const { user, session } = useAuth();
  const { 
    isConnected: isGoogleConnected, 
    isLoading: isGoogleLoading, 
    isConnecting,
    initiateConnection,
    disconnect,
    fetchEvents: fetchGoogleEvents,
    checkConnectionStatus
  } = useGoogleCalendar();

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state && session?.access_token) {
      // Clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Exchange code for tokens
      const handleCallback = async () => {
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

          if (response.ok) {
            toast.success('Google Calendar connecté !');
            checkConnectionStatus();
          } else {
            toast.error('Erreur lors de la connexion à Google Calendar');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast.error('Erreur lors de la connexion à Google Calendar');
        }
      };
      
      handleCallback();
    }
  }, [session?.access_token, checkConnectionStatus]);

  const parseICSWithLibrary = (content: string): ParsedEvent[] => {
    const events: ParsedEvent[] = [];
    
    try {
      // Parse the ICS content using ical.js
      const jcalData = ICAL.parse(content);
      const vcalendar = new ICAL.Component(jcalData);
      const vevents = vcalendar.getAllSubcomponents('vevent');

      console.log(`Found ${vevents.length} VEVENT components in ICS file`);

      for (const vevent of vevents) {
        try {
          const event = new ICAL.Event(vevent);
          
          // Get the summary (title)
          const title = event.summary || 'Sans titre';
          
          // Get start and end dates
          const startDate = event.startDate;
          const endDate = event.endDate;

          if (!startDate) {
            console.warn('Event without start date, skipping:', title);
            continue;
          }

          // Check if it's an all-day event
          const isAllDay = startDate.isDate;

          // Convert to JS Date
          // ical.js handles timezone conversion automatically
          const start = startDate.toJSDate();
          const end = endDate ? endDate.toJSDate() : new Date(start.getTime() + 60 * 60 * 1000); // Default 1h if no end

          // Get location if available
          const location = event.location || undefined;

          // Extract subject name from DESCRIPTION first, then fallback to SUMMARY
          const description = vevent.getFirstPropertyValue('description');
          const altDesc = vevent.getFirstPropertyValue('x-alt-desc');
          
          let subjectName = extractSubjectFromDescription(description as string);
          if (!subjectName) {
            subjectName = extractSubjectFromDescription(altDesc as string);
          }
          if (!subjectName) {
            subjectName = extractSubjectFromSummary(title);
          }

          console.log(`Parsed event: "${title}" from ${start.toISOString()} to ${end.toISOString()}, allDay: ${isAllDay}, subject: ${subjectName}`);

          events.push({
            title,
            start,
            end,
            location,
            isAllDay,
            subjectName: subjectName || undefined
          });
        } catch (eventError) {
          console.error('Error parsing individual event:', eventError);
        }
      }
    } catch (parseError) {
      console.error('Error parsing ICS file:', parseError);
      throw new Error('Le fichier .ics semble invalide ou corrompu');
    }

    return events;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.ics')) {
        setFile(droppedFile);
      } else {
        toast.error('Seuls les fichiers .ics sont acceptés');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setImporting(true);

    try {
      const content = await file.text();
      console.log('ICS file content length:', content.length);
      console.log('ICS file preview:', content.substring(0, 500));

      let events: ParsedEvent[];
      
      try {
        events = parseICSWithLibrary(content);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        toast.error(parseError instanceof Error ? parseError.message : 'Erreur de parsing du fichier');
        return;
      }

      if (events.length === 0) {
        toast.error(
          "Aucun événement n'a été trouvé dans ce fichier .ics. Vérifie que tu as bien exporté ton emploi du temps complet."
        );
        return;
      }

      // Filter out all-day events or handle them differently
      const timedEvents = events.filter(e => !e.isAllDay);
      const allDayEvents = events.filter(e => e.isAllDay);

      console.log(`Timed events: ${timedEvents.length}, All-day events: ${allDayEvents.length}`);

      // Insert timed events into database
      const eventsToInsert = timedEvents.map(event => ({
        user_id: user.id,
        source: 'ics',
        title: event.title,
        start_datetime: event.start.toISOString(),
        end_datetime: event.end.toISOString(),
        location: event.location || null,
        is_blocking: true,
        event_type: 'cours',
        subject_name: event.subjectName || null
      }));

      if (eventsToInsert.length > 0) {
        const { error } = await supabase
          .from('calendar_events')
          .insert(eventsToInsert);

        if (error) throw error;
      }

      // Show success message
      const importedCount = eventsToInsert.length;
      const skippedCount = allDayEvents.length;
      
      let message = `✅ ${importedCount} événement${importedCount > 1 ? 's' : ''} importé${importedCount > 1 ? 's' : ''} depuis ton calendrier.`;
      if (skippedCount > 0) {
        message += ` (${skippedCount} événement${skippedCount > 1 ? 's' : ''} "journée entière" ignoré${skippedCount > 1 ? 's' : ''})`;
      }
      
      toast.success(message);

      onImportComplete();
      onOpenChange(false);
      setFile(null);

    } catch (err) {
      console.error('Import error:', err);
      toast.error('Erreur lors de l\'import du calendrier');
    } finally {
      setImporting(false);
    }
  };

  const handleGoogleImport = async () => {
    if (!user) return;
    
    setImportingGoogle(true);
    
    try {
      // Get events from the next 3 months
      const timeMin = new Date();
      const timeMax = new Date();
      timeMax.setMonth(timeMax.getMonth() + 3);
      
      const events = await fetchGoogleEvents(timeMin, timeMax);
      
      if (events.length === 0) {
        toast.info('Aucun événement trouvé dans ton Google Calendar pour les 3 prochains mois.');
        return;
      }
      
      // Filter out all-day events
      const timedEvents = events.filter(e => !e.isAllDay);
      const allDayEvents = events.filter(e => e.isAllDay);
      
      // Insert events into database
      const eventsToInsert = timedEvents.map(event => ({
        user_id: user.id,
        source: 'google_calendar',
        title: event.title,
        start_datetime: new Date(event.start).toISOString(),
        end_datetime: new Date(event.end).toISOString(),
        location: event.location || null,
        is_blocking: true,
        event_type: 'autre',
      }));
      
      if (eventsToInsert.length > 0) {
        const { error } = await supabase
          .from('calendar_events')
          .insert(eventsToInsert);
        
        if (error) throw error;
      }
      
      const importedCount = eventsToInsert.length;
      const skippedCount = allDayEvents.length;
      
      let message = `✅ ${importedCount} événement${importedCount > 1 ? 's' : ''} importé${importedCount > 1 ? 's' : ''} depuis Google Calendar.`;
      if (skippedCount > 0) {
        message += ` (${skippedCount} événement${skippedCount > 1 ? 's' : ''} "journée entière" ignoré${skippedCount > 1 ? 's' : ''})`;
      }
      
      toast.success(message);
      onImportComplete();
      onOpenChange(false);
      
    } catch (error) {
      console.error('Google import error:', error);
      toast.error('Erreur lors de l\'import depuis Google Calendar');
    } finally {
      setImportingGoogle(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Importer ton calendrier
          </DialogTitle>
          <DialogDescription>
            Récupère ton emploi du temps depuis ton ENT, Google Calendar, ou un fichier .ics. 
            Skoolife bloquera automatiquement ces créneaux.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Google Calendar
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Fichier .ics
            </TabsTrigger>
          </TabsList>
          
          {/* Google Calendar Tab */}
          <TabsContent value="google" className="space-y-4 mt-4">
            {isGoogleLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : isGoogleConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-subject-green/10 border border-subject-green/20">
                  <CheckCircle2 className="w-5 h-5 text-subject-green flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Google Calendar connecté</p>
                    <p className="text-xs text-muted-foreground">
                      Tu peux importer tes événements des 3 prochains mois
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={disconnect}
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Déconnecter
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={handleGoogleImport}
                    disabled={importingGoogle}
                  >
                    {importingGoogle ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Importer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">Connecte ton Google Calendar</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Autorise Skoolife à lire tes événements pour les importer automatiquement
                  </p>
                </div>
                
                <Button
                  className="w-full"
                  onClick={initiateConnection}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Link2 className="w-4 h-4 mr-2" />
                  )}
                  Connecter Google Calendar
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* File Import Tab */}
          <TabsContent value="file" className="space-y-4 mt-4">
            {/* Dropzone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : file 
                    ? 'border-subject-green bg-subject-green/5' 
                    : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".ics"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {file ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-subject-green" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Clique sur "Importer" pour continuer
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="font-medium">
                    Dépose ton fichier .ics ici
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou clique pour parcourir
                  </p>
                </div>
              )}
            </div>

            {/* Help text */}
            <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
              <p>💡 Tu peux exporter ton calendrier depuis :</p>
              <ul className="mt-1 ml-4 list-disc space-y-1">
                <li>Outlook → Calendrier → Partager → Exporter</li>
                <li>Ton ENT (espace numérique de travail)</li>
                <li>Hyperplanning, NetYParéo, etc.</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                  setFile(null);
                }}
              >
                Annuler
              </Button>
              <Button 
                variant="default" 
                className="flex-1"
                onClick={handleImport}
                disabled={!file || importing}
              >
                {importing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importer
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCalendarDialog;
