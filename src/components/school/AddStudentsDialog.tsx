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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Key, 
  FileUp, 
  ArrowRight, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface AddStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  cohorts: Array<{ id: string; name: string }>;
  classes: Array<{ id: string; name: string; cohort_id: string }>;
  onSuccess?: () => void;
}

type Method = 'select' | 'csv';

export const AddStudentsDialog = ({
  open,
  onOpenChange,
  schoolId,
  cohorts,
  classes,
  onSuccess
}: AddStudentsDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [method, setMethod] = useState<Method>('select');
  const [loading, setLoading] = useState(false);
  
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  // CSV state
  const [csvEmails, setCsvEmails] = useState<string[]>([]);
  const [csvError, setCsvError] = useState('');

  const filteredClasses = classes.filter(c => c.cohort_id === selectedCohort);

  const resetState = () => {
    setMethod('select');
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
      const { read, utils } = await import('xlsx');
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: string[][] = utils.sheet_to_json(firstSheet, { header: 1 });
          
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

  const handleAddStudents = async (emailList: string[]) => {
    if (emailList.length === 0) {
      toast.error('Aucun email valide à ajouter');
      return;
    }

    if (!selectedCohort) {
      toast.error('Veuillez sélectionner une cohorte');
      return;
    }

    setLoading(true);
    try {
      // Insert all emails into school_expected_students
      const studentsToInsert = emailList.map(email => ({
        school_id: schoolId,
        cohort_id: selectedCohort,
        class_id: selectedClass || null,
        email: email,
        created_by: user?.id,
      }));

      const { error, data } = await supabase
        .from('school_expected_students')
        .upsert(studentsToInsert, { 
          onConflict: 'school_id,email',
          ignoreDuplicates: true 
        })
        .select();

      if (error) throw error;

      toast.success(`${emailList.length} email(s) ajouté(s) à la base élèves`);
      
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error adding students:', error);
      toast.error('Erreur lors de l\'ajout des élèves');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelect = () => (
    <div className="grid gap-3">
      <button
        onClick={() => {
          handleClose();
          navigate('/school/codes');
        }}
        className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Key className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Code d'accès</p>
          <p className="text-xs text-muted-foreground">
            Générez un code + envoyez des invitations par email
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </button>

      <button
        onClick={() => setMethod('csv')}
        className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
          <FileUp className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Import fichier</p>
          <p className="text-xs text-muted-foreground">
            Importez la liste des emails depuis un fichier
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );

  const renderCsvForm = () => (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => {
          setMethod('select');
          setCsvEmails([]);
          setCsvError('');
        }}
        className="mb-2 -ml-2"
      >
        ← Retour
      </Button>

      <div className="space-y-2">
        <Label className="text-sm">Fichier CSV, TXT ou Excel</Label>
        <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
          <input
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <FileUp className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium text-sm">Sélectionner un fichier</p>
            <p className="text-xs text-muted-foreground">CSV, TXT ou Excel</p>
          </label>
        </div>
        {csvError && (
          <div className="flex items-center gap-2 text-destructive text-xs">
            <AlertCircle className="w-3 h-3" />
            {csvError}
          </div>
        )}
      </div>

      {csvEmails.length > 0 && (
        <>
          <div className="space-y-2">
            <Label className="text-sm">Emails détectés ({csvEmails.length})</Label>
            <div className="max-h-24 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
              {csvEmails.slice(0, 5).map((email, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
              ))}
              {csvEmails.length > 5 && (
                <p className="text-xs text-muted-foreground pl-5">
                  ... et {csvEmails.length - 5} autres
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">Cohorte *</Label>
              <Select value={selectedCohort} onValueChange={(v) => {
                setSelectedCohort(v);
                setSelectedClass('');
              }}>
                <SelectTrigger className="h-9">
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
            <div className="space-y-1">
              <Label className="text-sm">Classe</Label>
              <Select 
                value={selectedClass} 
                onValueChange={setSelectedClass}
                disabled={!selectedCohort}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Optionnel" />
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
            onClick={() => handleAddStudents(csvEmails)}
            disabled={!selectedCohort || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter {csvEmails.length} élève(s)
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {method === 'select' && 'Ajouter des élèves'}
            {method === 'csv' && 'Import fichier'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {method === 'select' && 'Choisissez une méthode d\'ajout'}
            {method === 'csv' && 'Importez une liste d\'emails'}
          </DialogDescription>
        </DialogHeader>

        {method === 'select' && renderMethodSelect()}
        {method === 'csv' && renderCsvForm()}
      </DialogContent>
    </Dialog>
  );
};
