import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminSidebar from "@/components/AdminSidebar";
import { 
  ArrowLeft,
  Building2, 
  Plus, 
  Users, 
  GraduationCap,
  UserCog,
  Clock,
  BookOpen,
  Trash2,
  CreditCard
} from "lucide-react";
import { ImportCSVDialog } from "@/components/ImportCSVDialog";
import { SCHOOL_STRIPE_PRODUCTS, SchoolTier } from "@/config/stripeSchools";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface School {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  school_type: string | null;
  student_count_estimate: string | null;
  subscription_tier: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  is_active: boolean;
  created_at: string;
}

interface SchoolMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
  is_active: boolean;
  profile?: {
    email: string | null;
    first_name: string | null;
    last_name: string | null;
  };
  stats?: {
    total_sessions: number;
    completed_sessions: number;
    total_hours: number;
  };
}

const MEMBER_ROLES = [
  { value: "admin_school", label: "Admin école", icon: UserCog },
  { value: "teacher", label: "Enseignant", icon: BookOpen },
  { value: "student", label: "Élève", icon: GraduationCap }
];

export default function AdminSchoolDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [members, setMembers] = useState<SchoolMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<SchoolMember | null>(null);
  const [newMember, setNewMember] = useState({ email: "", role: "student" });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin && id) {
      fetchSchoolData();
    }
  }, [isAdmin, id]);

  const fetchSchoolData = async () => {
    setIsLoading(true);
    try {
      // Fetch school
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .select("*")
        .eq("id", id)
        .single();

      if (schoolError) throw schoolError;
      setSchool(schoolData);

      // Fetch members with profiles - use user_id hint for the relationship
      const { data: membersData, error: membersError } = await supabase
        .from("school_members")
        .select(`
          *,
          profile:profiles!school_members_user_id_fkey(email, first_name, last_name)
        `)
        .eq("school_id", id)
        .order("created_at", { ascending: false });

      if (membersError) throw membersError;

      // Fetch stats for each member
      const membersWithStats = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: sessions } = await supabase
            .from("revision_sessions")
            .select("status, start_time, end_time")
            .eq("user_id", member.user_id);

          const totalSessions = sessions?.length || 0;
          const completedSessions = sessions?.filter(s => s.status === "completed").length || 0;
          
          // Calculate total hours
          let totalHours = 0;
          sessions?.forEach(session => {
            const start = new Date(`1970-01-01T${session.start_time}`);
            const end = new Date(`1970-01-01T${session.end_time}`);
            totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          });

          return {
            ...member,
            profile: member.profile,
            stats: {
              total_sessions: totalSessions,
              completed_sessions: completedSessions,
              total_hours: Math.round(totalHours * 10) / 10
            }
          };
        })
      );

      setMembers(membersWithStats);
    } catch (error) {
      console.error("Error fetching school data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newMember.email)
        .single();

      if (profileError || !profiles) {
        alert("Utilisateur non trouvé avec cet email");
        return;
      }

      // Add member
      const { error } = await supabase
        .from("school_members")
        .insert({
          school_id: id,
          user_id: profiles.id,
          role: newMember.role,
          joined_at: new Date().toISOString()
        });

      if (error) {
        if (error.code === "23505") {
          alert("Cet utilisateur est déjà membre de cette école");
        } else {
          throw error;
        }
        return;
      }

      setIsAddMemberOpen(false);
      setNewMember({ email: "", role: "student" });
      fetchSchoolData();
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    
    try {
      const { error } = await supabase
        .from("school_members")
        .delete()
        .eq("id", memberToDelete.id);

      if (error) throw error;
      
      setMemberToDelete(null);
      fetchSchoolData();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = MEMBER_ROLES.find(r => r.value === role);
    if (!roleConfig) return <Badge variant="outline">{role}</Badge>;

    const colors: Record<string, string> = {
      admin_school: "bg-purple-100 text-purple-800",
      teacher: "bg-blue-100 text-blue-800",
      student: "bg-green-100 text-green-800"
    };

    return (
      <Badge className={colors[role] || ""}>
        {roleConfig.label}
      </Badge>
    );
  };

  const stats = {
    totalMembers: members.length,
    admins: members.filter(m => m.role === "admin_school").length,
    teachers: members.filter(m => m.role === "teacher").length,
    students: members.filter(m => m.role === "student").length,
    totalHours: members.reduce((acc, m) => acc + (m.stats?.total_hours || 0), 0)
  };

  if (loading || !isAdmin || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!school) {
    return <div className="min-h-screen flex items-center justify-center">École non trouvée</div>;
  }

  return (
    <AdminSidebar>
      <div className="p-6 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/schools")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{school.name}</h1>
                <Badge variant={school.is_active ? "default" : "secondary"}>
                  {school.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-muted-foreground">{school.contact_email}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                  <p className="text-sm text-muted-foreground">Total membres</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.teachers}</p>
                  <p className="text-sm text-muted-foreground">Enseignants</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.students}</p>
                  <p className="text-sm text-muted-foreground">Élèves</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{Math.round(stats.totalHours)}h</p>
                  <p className="text-sm text-muted-foreground">Heures totales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="members" className="space-y-4">
            <TabsList>
              <TabsTrigger value="members" className="gap-2">
                <Users className="h-4 w-4" />
                Membres
              </TabsTrigger>
              <TabsTrigger value="info" className="gap-2">
                <Building2 className="h-4 w-4" />
                Informations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Membres de l'école</CardTitle>
                    <div className="flex gap-2">
                      <ImportCSVDialog schoolId={id!} onImportComplete={fetchSchoolData} />
                      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Ajouter
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ajouter un membre</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Email de l'utilisateur *</Label>
                              <Input
                                type="email"
                                value={newMember.email}
                                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                placeholder="eleve@email.com"
                              />
                              <p className="text-xs text-muted-foreground">
                                L'utilisateur doit déjà avoir un compte Skoolife
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>Rôle</Label>
                              <Select
                                value={newMember.role}
                                onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {MEMBER_ROLES.map(role => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              onClick={handleAddMember} 
                              className="w-full"
                              disabled={!newMember.email}
                            >
                              Ajouter le membre
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun membre dans cette école
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Membre</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Sessions</TableHead>
                            <TableHead>Heures</TableHead>
                            <TableHead>Rejoint le</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {members.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {member.profile?.first_name} {member.profile?.last_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {member.profile?.email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{getRoleBadge(member.role)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <span className="text-green-600">{member.stats?.completed_sessions}</span>
                                  <span className="text-muted-foreground">/</span>
                                  <span>{member.stats?.total_sessions}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  {member.stats?.total_hours}h
                                </div>
                              </TableCell>
                              <TableCell>
                                {member.joined_at 
                                  ? format(new Date(member.joined_at), "dd MMM yyyy", { locale: fr })
                                  : "-"
                                }
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMemberToDelete(member);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de l'école</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Type d'établissement</Label>
                      <p className="font-medium">{school.school_type || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Taille estimée</Label>
                      <p className="font-medium">{school.student_count_estimate || "-"} élèves</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{school.contact_email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Téléphone</Label>
                      <p className="font-medium">{school.contact_phone || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Adresse</Label>
                      <p className="font-medium">
                        {school.address ? `${school.address}, ${school.city}` : "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Créé le</Label>
                      <p className="font-medium">
                        {format(new Date(school.created_at), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Abonnement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Forfait</Label>
                        <p className="font-medium capitalize">{school.subscription_tier}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Date de début</Label>
                        <p className="font-medium">
                          {school.subscription_start_date 
                            ? format(new Date(school.subscription_start_date), "dd MMM yyyy", { locale: fr })
                            : "-"
                          }
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Date de fin</Label>
                        <p className="font-medium">
                          {school.subscription_end_date 
                            ? format(new Date(school.subscription_end_date), "dd MMM yyyy", { locale: fr })
                            : "-"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Delete Member Dialog */}
        <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce membre ?</AlertDialogTitle>
              <AlertDialogDescription>
                {memberToDelete?.profile?.email} sera retiré de cette école. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteMember} className="bg-destructive text-destructive-foreground">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminSidebar>
  );
}
