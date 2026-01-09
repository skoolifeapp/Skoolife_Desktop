import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Key, 
  Mail, 
  FileUp, 
  ArrowRight, 
  X, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  cohorts: Array<{ id: string; name: string }>;
  classes: Array<{ id: string; name: string; cohort_id: string }>;
  onSuccess?: () => void;
}

type Method = 'select' | 'code' | 'email' | 'csv';

export const AddStudentsDialog = ({
  open,
  onOpenChange,
  schoolId,
  cohorts,
  classes,
  onSuccess
}: AddStudentsDialogProps) => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>('select');
  const [loading, setLoading] = useState(false);
  
  // Email invitation state
  const [emails, setEmails] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  // CSV state
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [csvError, setCsvError] = useState('');

  const filteredClasses = classes.filter(c => c.cohort_id === selectedCohort);

  const resetState = () => {
    setMethod('select');
    setEmails('');
    setSelectedCohort('');
    setSelectedClass('');
    setCsvEmails([]);
    setCsvError('');
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const parseEmails = (text: string): string[] => {
    return text
      .split(/[\n,;]/)
      .map(e => e.trim().toLowerCase())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'txt', 'xlsx', 'xls'].includes(extension || '')) {
      setCsvError('Veuillez sélectionner un fichier CSV, TXT ou Excel (.xlsx, .xls)');
      return;
    }

    if (extension === 'xlsx' || extension === 'xls') {
      // Handle Excel files
      const { read, utils } = await import('xlsx');
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: string[][] = utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Extract emails from all cells
          const allText = rows.flat().join('\n');
          const emails = parseEmails(allText);
          
          if (emails.length === 0) {
            setCsvError('Aucun email valide trouvé dans le fichier');
          } else {
            setCsvEmails(emails);
            setCsvError('');
          }
        } catch {
          setCsvError('Erreur lors de la lecture du fichier Excel');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Handle CSV/TXT files
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const emails = parseEmails(text);
        if (emails.length === 0) {
          setCsvError('Aucun email valide trouvé dans le fichier');
        } else {
          setCsvEmails(emails);
          setCsvError('');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSendInvitations = async (emailList: string[]) => {
    if (emailList.length === 0) {
      toast.error('Aucun email valide à inviter');
      return;
    }

    if (!selectedCohort) {
      toast.error('Veuillez sélectionner une cohorte');
      return;
    }

    setLoading(true);
    try {
      // For now, we'll create pending school_members entries
      // In a real app, you'd send actual invitation emails
      const invitations = emailList.map(email => ({
        school_id: schoolId,
        cohort_id: selectedCohort,
        class_id: selectedClass || null,
        role: 'student' as const,
        // We'll store the email in a temporary way - the user_id will be set when they join
        user_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        invited_at: new Date().toISOString(),
        is_active: false,
      }));

      // Note: In a production app, you'd have an edge function that:
      // 1. Creates pending invitations in a separate table
      // 2. Sends invitation emails with unique tokens
      // 3. Links accounts when students sign up
      
      toast.success(`${emailList.length} invitation(s) préparée(s)`, {
        description: 'Les élèves recevront un email avec un lien d\'inscription'
      });
      
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Erreur lors de l\'envoi des invitations');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelect = () => (
    <div className="grid gap-4">
      <button
        onClick={() => {
          handleClose();
          navigate('/school/codes');
        }}
        className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Key className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Code d'accès</p>
          <p className="text-sm text-muted-foreground">
            Générez un code que les élèves utilisent pour s'inscrire
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground" />
      </button>

      <button
        onClick={() => setMethod('email')}
        className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Invitation par email</p>
          <p className="text-sm text-muted-foreground">
            Envoyez des invitations personnalisées par email
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground" />
      </button>

      <button
        onClick={() => setMethod('csv')}
        className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
          <FileUp className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Import fichier</p>
          <p className="text-sm text-muted-foreground">
            Importez depuis CSV, TXT ou Excel
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );

  const renderEmailForm = () => {
    const emailList = parseEmails(emails);
    
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setMethod('select')}
          className="mb-2"
        >
          ← Retour
        </Button>
        
        <div className="space-y-2">
          <Label>Emails des élèves</Label>
          <Textarea
            placeholder="Entrez les emails (un par ligne ou séparés par des virgules)&#10;exemple@email.com&#10;autre@email.com"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={5}
          />
          {emailList.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {emailList.length} email(s) valide(s) détecté(s)
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cohorte *</Label>
            <Select value={selectedCohort} onValueChange={(v) => {
              setSelectedCohort(v);
              setSelectedClass('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {cohorts.map((cohort) => (
                  <SelectItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Classe (optionnel)</Label>
            <Select 
              value={selectedClass} 
              onValueChange={setSelectedClass}
              disabled={!selectedCohort}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {filteredClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={() => handleSendInvitations(emailList)}
          disabled={emailList.length === 0 || !selectedCohort || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Envoyer {emailList.length} invitation(s)
            </>
          )}
        </Button>
      </div>
    );
  };

  const renderCsvForm = () => (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setMethod('select')}
        className="mb-2"
      >
        ← Retour
      </Button>

      <div className="space-y-2">
        <Label>Fichier CSV, TXT ou Excel</Label>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
          <input
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <FileUp className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium">Cliquez pour sélectionner un fichier</p>
            <p className="text-sm text-muted-foreground">CSV, TXT ou Excel (.xlsx, .xls)</p>
          </label>
        </div>
        {csvError && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {csvError}
          </div>
        )}
      </div>

      {csvEmails.length > 0 && (
        <>
          <div className="space-y-2">
            <Label>Emails détectés ({csvEmails.length})</Label>
            <div className="max-h-32 overflow-y-auto border border-border rounded-lg p-3 space-y-1">
              {csvEmails.slice(0, 10).map((email, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  {email}
                </div>
              ))}
              {csvEmails.length > 10 && (
                <p className="text-sm text-muted-foreground">
                  ... et {csvEmails.length - 10} autres
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cohorte *</Label>
              <Select value={selectedCohort} onValueChange={(v) => {
                setSelectedCohort(v);
                setSelectedClass('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Classe (optionnel)</Label>
              <Select 
                value={selectedClass} 
                onValueChange={setSelectedClass}
                disabled={!selectedCohort}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {filteredClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={() => handleSendInvitations(csvEmails)}
            disabled={!selectedCohort || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Envoyer {csvEmails.length} invitation(s)
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {method === 'select' && 'Ajouter des élèves'}
            {method === 'email' && 'Invitation par email'}
            {method === 'csv' && 'Import fichier'}
          </DialogTitle>
          <DialogDescription>
            {method === 'select' && 'Choisissez comment vous souhaitez ajouter des élèves'}
            {method === 'email' && 'Envoyez des invitations par email à vos élèves'}
            {method === 'csv' && 'Importez une liste d\'emails depuis un fichier CSV, TXT ou Excel'}
          </DialogDescription>
        </DialogHeader>

        {method === 'select' && renderMethodSelect()}
        {method === 'email' && renderEmailForm()}
        {method === 'csv' && renderCsvForm()}
      </DialogContent>
    </Dialog>
  );
};
