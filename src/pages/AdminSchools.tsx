import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminSidebar from "@/components/AdminSidebar";
import { 
  Building2, 
  Plus, 
  Users, 
  GraduationCap,
  ChevronRight,
  Search,
  Calendar,
  Euro
} from "lucide-react";

interface School {
  id: string;
  name: string;
  contact_email: string;
  school_type: string | null;
  student_count_estimate: string | null;
  subscription_tier: string;
  subscription_end_date: string | null;
  is_active: boolean;
  created_at: string;
  member_count?: number;
}

const SCHOOL_TYPES = [
  "Lycée",
  "Université",
  "Prépa",
  "École de commerce",
  "École d'ingénieur",
  "BTS/IUT",
  "Autre"
];

const STUDENT_COUNTS = [
  "1-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+"
];

const SUBSCRIPTION_TIERS = [
  { value: "trial", label: "Essai", color: "bg-gray-100 text-gray-800" },
  { value: "starter", label: "Starter", color: "bg-blue-100 text-blue-800" },
  { value: "growth", label: "Growth", color: "bg-purple-100 text-purple-800" },
  { value: "enterprise", label: "Enterprise", color: "bg-amber-100 text-amber-800" }
];

export default function AdminSchools() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: "",
    contact_email: "",
    school_type: "",
    student_count_estimate: "",
    subscription_tier: "trial"
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchSchools();
    }
  }, [isAdmin]);

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const { data: schoolsData, error } = await supabase
        .from("schools")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch member counts for each school
      const schoolsWithCounts = await Promise.all(
        (schoolsData || []).map(async (school) => {
          const { count } = await supabase
            .from("school_members")
            .select("*", { count: "exact", head: true })
            .eq("school_id", school.id);
          
          return { ...school, member_count: count || 0 };
        })
      );

      setSchools(schoolsWithCounts);
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchool = async () => {
    try {
      const { error } = await supabase
        .from("schools")
        .insert({
          name: newSchool.name,
          contact_email: newSchool.contact_email,
          school_type: newSchool.school_type || null,
          student_count_estimate: newSchool.student_count_estimate || null,
          subscription_tier: newSchool.subscription_tier
        });

      if (error) throw error;

      setIsCreateDialogOpen(false);
      setNewSchool({
        name: "",
        contact_email: "",
        school_type: "",
        student_count_estimate: "",
        subscription_tier: "trial"
      });
      fetchSchools();
    } catch (error) {
      console.error("Error creating school:", error);
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTierBadge = (tier: string) => {
    const tierConfig = SUBSCRIPTION_TIERS.find(t => t.value === tier);
    return tierConfig ? (
      <Badge className={tierConfig.color}>{tierConfig.label}</Badge>
    ) : (
      <Badge variant="outline">{tier}</Badge>
    );
  };

  const stats = {
    totalSchools: schools.length,
    activeSchools: schools.filter(s => s.is_active).length,
    totalStudents: schools.reduce((acc, s) => acc + (s.member_count || 0), 0),
    paidSchools: schools.filter(s => s.subscription_tier !== "trial").length
  };

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <AdminSidebar>
      <div className="p-6 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Espace Écoles B2B</h1>
              <p className="text-muted-foreground">Gérez les établissements partenaires</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une école
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle école partenaire</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'établissement *</Label>
                    <Input
                      id="name"
                      value={newSchool.name}
                      onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                      placeholder="Lycée Victor Hugo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de contact *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newSchool.contact_email}
                      onChange={(e) => setNewSchool({ ...newSchool, contact_email: e.target.value })}
                      placeholder="contact@lycee.fr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type d'établissement</Label>
                    <Select
                      value={newSchool.school_type}
                      onValueChange={(value) => setNewSchool({ ...newSchool, school_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre d'élèves estimé</Label>
                    <Select
                      value={newSchool.student_count_estimate}
                      onValueChange={(value) => setNewSchool({ ...newSchool, student_count_estimate: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDENT_COUNTS.map(count => (
                          <SelectItem key={count} value={count}>{count} élèves</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Forfait</Label>
                    <Select
                      value={newSchool.subscription_tier}
                      onValueChange={(value) => setNewSchool({ ...newSchool, subscription_tier: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBSCRIPTION_TIERS.map(tier => (
                          <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleCreateSchool} 
                    className="w-full"
                    disabled={!newSchool.name || !newSchool.contact_email}
                  >
                    Créer l'école
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalSchools}</p>
                    <p className="text-sm text-muted-foreground">Écoles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Membres</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeSchools}</p>
                    <p className="text-sm text-muted-foreground">Actives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Euro className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.paidSchools}</p>
                    <p className="text-sm text-muted-foreground">Payantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <CardTitle className="flex-1">Liste des écoles</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : filteredSchools.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "Aucune école trouvée" : "Aucune école enregistrée"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Établissement</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Membres</TableHead>
                        <TableHead>Forfait</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchools.map((school) => (
                        <TableRow 
                          key={school.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/admin/schools/${school.id}`)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{school.name}</p>
                              <p className="text-sm text-muted-foreground">{school.contact_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{school.school_type || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {school.member_count}
                            </div>
                          </TableCell>
                          <TableCell>{getTierBadge(school.subscription_tier)}</TableCell>
                          <TableCell>
                            <Badge variant={school.is_active ? "default" : "secondary"}>
                              {school.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  );
}
