import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Download, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportCSVDialogProps {
  schoolId: string;
  onImportComplete: () => void;
}

interface ImportResult {
  added: number;
  already_exists: number;
  not_found: number;
  errors: string[];
}

export function ImportCSVDialog({ schoolId, onImportComplete }: ImportCSVDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase());
    const emailIndex = headers.findIndex(h => h === "email" || h === "e-mail" || h === "mail");
    const firstNameIndex = headers.findIndex(h => h === "prenom" || h === "prénom" || h === "first_name" || h === "firstname");
    const lastNameIndex = headers.findIndex(h => h === "nom" || h === "last_name" || h === "lastname");
    const roleIndex = headers.findIndex(h => h === "role" || h === "rôle" || h === "type");

    if (emailIndex === -1) {
      throw new Error("Colonne 'email' non trouvée dans le CSV");
    }

    const students = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/[,;]/).map(v => v.trim().replace(/^["']|["']$/g, ''));
      if (values[emailIndex]) {
        students.push({
          email: values[emailIndex],
          first_name: firstNameIndex >= 0 ? values[firstNameIndex] : undefined,
          last_name: lastNameIndex >= 0 ? values[lastNameIndex] : undefined,
          role: roleIndex >= 0 ? values[roleIndex] : "student"
        });
      }
    }
    return students;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        setParsedData(parsed);
      } catch (error) {
        toast({
          title: "Erreur de lecture",
          description: error instanceof Error ? error.message : "Format CSV invalide",
          variant: "destructive"
        });
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) return;

    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-school-students", {
        body: { school_id: schoolId, students: parsedData }
      });

      if (error) throw error;

      setResult(data);
      
      if (data.added > 0) {
        onImportComplete();
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Erreur d'import",
        description: "Une erreur est survenue lors de l'import",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
    setFileName(null);
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const template = "email;prenom;nom;role\neleve1@email.com;Jean;Dupont;student\nprof@email.com;Marie;Martin;teacher";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_eleves.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importer des membres (CSV)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Template download */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Télécharger le template</span>
            </div>
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* File input */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {fileName || "Cliquez pour sélectionner un fichier CSV"}
              </span>
            </label>
          </div>

          {/* Preview */}
          {parsedData && parsedData.length > 0 && !result && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {parsedData.length} membre(s) détecté(s) dans le fichier.
                <br />
                <span className="text-xs text-muted-foreground">
                  Note: Seuls les utilisateurs ayant déjà un compte Skoolife seront ajoutés.
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <Alert className={result.added > 0 ? "border-green-500" : ""}>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p><strong>{result.added}</strong> membre(s) ajouté(s)</p>
                    {result.already_exists > 0 && (
                      <p className="text-muted-foreground">{result.already_exists} déjà membre(s)</p>
                    )}
                    {result.not_found > 0 && (
                      <p className="text-muted-foreground">{result.not_found} non trouvé(s)</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
              
              {result.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                  {result.errors.length > 10 && (
                    <p>... et {result.errors.length - 10} autres erreurs</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleClose}>
              {result ? "Fermer" : "Annuler"}
            </Button>
            {!result && (
              <Button 
                onClick={handleImport} 
                disabled={!parsedData || parsedData.length === 0 || isImporting}
              >
                {isImporting ? "Import en cours..." : "Importer"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
