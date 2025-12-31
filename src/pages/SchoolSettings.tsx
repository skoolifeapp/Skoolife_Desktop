import { useState } from 'react';
import { useSchoolAuth } from '@/hooks/useSchoolAuth';
import SchoolSidebar from '@/components/SchoolSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Mail, Phone, MapPin, Palette } from 'lucide-react';

const SchoolSettings = () => {
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
      <div className="p-6 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground">
            Configuration de votre établissement
          </p>
        </div>

        {/* School info */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nom de l'établissement</Label>
                <Input value={school?.name || ''} disabled={!isAdmin} />
              </div>
              <div>
                <Label>Email de contact</Label>
                <Input value={school?.contact_email || ''} disabled={!isAdmin} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <Label>Couleur principale</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-8 h-8 rounded-lg border"
                    style={{ backgroundColor: school?.primary_color || '#FFC107' }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {school?.primary_color || '#FFC107'}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <Button className="mt-4" disabled>
                Sauvegarder les modifications
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Abonnement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium">Plan actuel</p>
                <p className="text-sm text-muted-foreground">
                  {school?.subscription_tier === 'trial' 
                    ? 'Période d\'essai'
                    : school?.subscription_tier || 'Gratuit'
                  }
                </p>
              </div>
              <Badge variant={school?.is_active ? 'default' : 'destructive'}>
                {school?.is_active ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </SchoolSidebar>
  );
};

export default SchoolSettings;
