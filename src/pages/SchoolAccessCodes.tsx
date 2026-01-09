import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';
import SchoolSidebar from '@/components/school/SchoolSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Key, 
  Copy, 
  Users,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const SchoolAccessCodes = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    loading, 
    isSchoolAdmin, 
    school, 
    accessCodes, 
    cohorts, 
    classes,
    createAccessCode,
    toggleAccessCode 
  } = useSchoolAdmin();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    cohortId: '',
    classId: '',
    maxUses: '100',
    expiresAt: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!loading && !isSchoolAdmin && user) {
      navigate('/app');
    }
  }, [loading, isSchoolAdmin, user, navigate]);

  const generateRandomCode = () => {
    const schoolPrefix = school?.name?.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, '') || 'SKOO';
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${schoolPrefix}${year}${random}`;
  };

  const handleCreateCode = async () => {
    if (!newCode.code) {
      toast.error('Veuillez entrer un code');
      return;
    }

    setIsCreating(true);
    const { error } = await createAccessCode({
      code: newCode.code,
      cohortId: newCode.cohortId || undefined,
      classId: newCode.classId || undefined,
      maxUses: parseInt(newCode.maxUses) || 100,
      expiresAt: newCode.expiresAt || undefined,
    });

    if (error) {
      toast.error('Erreur lors de la création du code');
    } else {
      toast.success('Code créé avec succès !');
      setIsDialogOpen(false);
      setNewCode({ code: '', cohortId: '', classId: '', maxUses: '100', expiresAt: '' });
    }
    setIsCreating(false);
  };

  const handleToggleCode = async (codeId: string, currentStatus: boolean) => {
    const { error } = await toggleAccessCode(codeId, !currentStatus);
    if (error) {
      toast.error('Erreur lors de la modification');
    } else {
      toast.success(!currentStatus ? 'Code activé' : 'Code désactivé');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié !');
  };

  const filteredClasses = newCode.cohortId 
    ? classes.filter(c => c.cohort_id === newCode.cohortId)
    : classes;

  if (authLoading || loading) {
    return (
      <SchoolSidebar>
        <div className="p-6 md:p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </SchoolSidebar>
    );
  }

  if (!isSchoolAdmin) {
    return null;
  }

  const activeCodesCount = accessCodes.filter(c => c.is_active).length;
  const totalUses = accessCodes.reduce((acc, c) => acc + (c.current_uses || 0), 0);

  return (
    <SchoolSidebar>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Codes d'accès</h1>
            <p className="text-muted-foreground">
              Créez et gérez les codes pour inscrire vos élèves.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un code d'accès</DialogTitle>
                <DialogDescription>
                  Ce code permettra aux élèves de s'inscrire et rejoindre votre établissement.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      placeholder="Ex: ISCG2026"
                      value={newCode.code}
                      onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                      className="uppercase"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setNewCode({ ...newCode, code: generateRandomCode() })}
                    >
                      Générer
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cohorte (optionnel)</Label>
                    <Select
                      value={newCode.cohortId}
                      onValueChange={(v) => setNewCode({ ...newCode, cohortId: v, classId: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Toutes les cohortes</SelectItem>
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
                      value={newCode.classId}
                      onValueChange={(v) => setNewCode({ ...newCode, classId: v })}
                      disabled={!newCode.cohortId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Toutes les classes</SelectItem>
                        {filteredClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxUses">Utilisations max</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      min="1"
                      value={newCode.maxUses}
                      onChange={(e) => setNewCode({ ...newCode, maxUses: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Date d'expiration</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={newCode.expiresAt}
                      onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateCode} disabled={isCreating}>
                  {isCreating ? 'Création...' : 'Créer le code'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{accessCodes.length}</p>
                  <p className="text-sm text-muted-foreground">Total codes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCodesCount}</p>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUses}</p>
                  <p className="text-sm text-muted-foreground">Utilisations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Codes list */}
        <div className="space-y-4">
          {accessCodes.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">Aucun code créé pour le moment.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Créer votre premier code
                </Button>
              </CardContent>
            </Card>
          ) : (
            accessCodes.map((code) => {
              const cohort = cohorts.find(c => c.id === code.cohort_id);
              const cls = classes.find(c => c.id === code.class_id);
              const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
              const usagePercent = code.max_uses 
                ? Math.round((code.current_uses / code.max_uses) * 100)
                : 0;

              return (
                <Card key={code.id} className={!code.is_active ? 'opacity-60' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Key className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-lg font-bold">{code.code}</p>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => copyToClipboard(code.code)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            {code.is_active ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Actif
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                Désactivé
                              </Badge>
                            )}
                            {isExpired && (
                              <Badge variant="destructive">Expiré</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            {cohort && <span>{cohort.name}</span>}
                            {cls && <span>• {cls.name}</span>}
                            {code.expires_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Expire le {format(new Date(code.expires_at), 'dd MMM yyyy', { locale: fr })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Utilisations</p>
                          <p className="font-medium">
                            {code.current_uses} / {code.max_uses || '∞'}
                          </p>
                          {code.max_uses && (
                            <div className="w-24 h-1.5 bg-muted rounded-full mt-1">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`toggle-${code.id}`} className="text-sm text-muted-foreground">
                            {code.is_active ? 'Actif' : 'Inactif'}
                          </Label>
                          <Switch
                            id={`toggle-${code.id}`}
                            checked={code.is_active}
                            onCheckedChange={() => handleToggleCode(code.id, code.is_active)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </SchoolSidebar>
  );
};

export default SchoolAccessCodes;
