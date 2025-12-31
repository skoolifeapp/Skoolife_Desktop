import { useState } from 'react';
import { useSchoolAuth } from '@/hooks/useSchoolAuth';
import SchoolSidebar from '@/components/SchoolSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Plus } from 'lucide-react';

const SchoolSubjects = () => {
  const { loading, school, isAdmin } = useSchoolAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SchoolSidebar 
      schoolName={school?.name} 
      schoolLogo={school?.logo_url}
      primaryColor={school?.primary_color}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Matières</h1>
            <p className="text-muted-foreground">
              Gérez les matières et examens de votre établissement
            </p>
          </div>
          {isAdmin && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une matière
            </Button>
          )}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Fonctionnalité à venir</h3>
            <p className="text-muted-foreground">
              La gestion des matières par établissement sera bientôt disponible.
            </p>
          </CardContent>
        </Card>
      </div>
    </SchoolSidebar>
  );
};

export default SchoolSubjects;
