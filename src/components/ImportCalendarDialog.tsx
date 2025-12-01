import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';

interface ImportCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ICSEvent {
  title: string;
  start: Date;
  end: Date;
  location?: string;
}

const ImportCalendarDialog = ({ open, onOpenChange, onImportComplete }: ImportCalendarDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();

  const parseICS = (content: string): ICSEvent[] => {
    const events: ICSEvent[] = [];
    const lines = content.split(/\r?\n/);
    let currentEvent: Partial<ICSEvent> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.title && currentEvent.start && currentEvent.end) {
          events.push(currentEvent as ICSEvent);
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.title = line.substring(8);
        } else if (line.startsWith('DTSTART')) {
          const dateStr = line.split(':').pop() || '';
          currentEvent.start = parseICSDate(dateStr);
        } else if (line.startsWith('DTEND')) {
          const dateStr = line.split(':').pop() || '';
          currentEvent.end = parseICSDate(dateStr);
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9);
        }
      }
    }

    return events;
  };

  const parseICSDate = (dateStr: string): Date => {
    // Handle format: 20231215T090000Z or 20231215T090000
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = dateStr.length >= 11 ? parseInt(dateStr.substring(9, 11)) : 0;
    const minute = dateStr.length >= 13 ? parseInt(dateStr.substring(11, 13)) : 0;

    if (dateStr.endsWith('Z')) {
      return new Date(Date.UTC(year, month, day, hour, minute));
    }
    return new Date(year, month, day, hour, minute);
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
      const events = parseICS(content);

      if (events.length === 0) {
        toast.error('Aucun événement trouvé dans le fichier');
        return;
      }

      // Insert events into database
      const eventsToInsert = events.map(event => ({
        user_id: user.id,
        source: 'ics',
        title: event.title,
        start_datetime: event.start.toISOString(),
        end_datetime: event.end.toISOString(),
        location: event.location || null,
        is_blocking: true
      }));

      const { error } = await supabase
        .from('calendar_events')
        .insert(eventsToInsert);

      if (error) throw error;

      onImportComplete();
      onOpenChange(false);
      setFile(null);

    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l\'import du calendrier');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Importer ton calendrier
          </DialogTitle>
          <DialogDescription>
            Récupère ton emploi du temps depuis ton ENT ou ton calendrier et importe-le ici. 
            Skoolife bloquera automatiquement ces créneaux.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
              <li>Google Calendar → Paramètres → Exporter</li>
              <li>Outlook → Calendrier → Partager → Exporter</li>
              <li>Ton ENT (espace numérique de travail)</li>
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
              variant="hero" 
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportCalendarDialog;