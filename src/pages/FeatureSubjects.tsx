import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap, Plus, Calendar, Clock, Target, ChevronRight, BarChart3, Timer, Settings, Bell, Sun } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import logo from '@/assets/logo.png';

// Static Subjects Card Component - Reproduit l'interface exacte de l'app
const StaticSubjectsCard = () => (
  <div className="h-[520px] md:h-[620px] flex bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-2xl">
    {/* Yellow Sidebar - Compact */}
    <div className="hidden md:flex w-16 flex-col bg-primary text-primary-foreground items-center py-4">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl overflow-hidden mb-8">
        <img src={logo} alt="Skoolife" className="w-full h-full object-cover" />
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-foreground/20">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
          <Settings className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary-foreground/10">
          <Timer className="w-5 h-5" />
        </div>
      </div>

      {/* User Avatar */}
      <div className="mt-auto pt-4 border-t border-primary-foreground/20 w-full flex justify-center">
        <div className="w-10 h-10 rounded-full bg-primary-foreground/30 flex items-center justify-center text-sm font-medium">
          S
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <GraduationCap className="w-4 h-4" />
          <span className="text-sm">/</span>
          <span className="text-sm font-medium text-foreground">Matières</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-full hover:bg-muted/50">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">3</span>
          </button>
          <button className="p-2 rounded-full hover:bg-muted/50">
            <Sun className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Mes matières & examens</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Ajoute tes matières, leurs dates d'examen et ton objectif d'heures de révision.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" />
          Ajouter une matière
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-4 gap-4 overflow-hidden">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Matières actives</p>
              <p className="text-2xl font-bold text-foreground">4</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prochain examen</p>
              <p className="text-base font-bold text-foreground">FINANCE <span className="text-primary">J-24</span></p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/30 bg-white dark:bg-card shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Target className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Heures totales visées</p>
              <p className="text-2xl font-bold text-foreground">90h</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <span className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium">Toutes (4)</span>
          <span className="px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium bg-primary/5">Partiel (4)</span>
          <span className="px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium bg-primary/5">Contrôle continu (0)</span>
          <span className="px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium bg-primary/5">Oral (0)</span>
          <span className="px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium bg-primary/5">Projet (0)</span>
        </div>

        {/* Subjects Table */}
        <div className="flex-1 rounded-xl border border-border/30 bg-white dark:bg-card overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Matière</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Date d'examen</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Objectif</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Priorité</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 - FINANCE */}
              <tr className="border-b border-border/10 hover:bg-muted/20">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-semibold text-foreground">FINANCE</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">14/01/2026</td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">35h</td>
                <td className="px-4 py-3.5">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Haute</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">Active</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <ChevronRight className="w-4 h-4 text-muted-foreground inline-block" />
                </td>
              </tr>
              {/* Row 2 - MCG */}
              <tr className="border-b border-border/10 hover:bg-muted/20">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-semibold text-foreground">MCG</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">14/01/2026</td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">25h</td>
                <td className="px-4 py-3.5">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Haute</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">Active</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <ChevronRight className="w-4 h-4 text-muted-foreground inline-block" />
                </td>
              </tr>
              {/* Row 3 - MSI */}
              <tr className="border-b border-border/10 hover:bg-muted/20">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-semibold text-foreground">MSI</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">16/01/2026</td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">20h</td>
                <td className="px-4 py-3.5">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">Moyenne</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">Active</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <ChevronRight className="w-4 h-4 text-muted-foreground inline-block" />
                </td>
              </tr>
              {/* Row 4 - Anglais */}
              <tr className="border-b border-border/10 hover:bg-muted/20">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm font-semibold text-foreground">Anglais</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">16/01/2026</td>
                <td className="px-4 py-3.5 text-sm text-muted-foreground">10h</td>
                <td className="px-4 py-3.5">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">Basse</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">Active</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <ChevronRight className="w-4 h-4 text-muted-foreground inline-block" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Help Button */}
    <div className="absolute bottom-4 right-4">
      <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg">
        <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-xs">?</span>
        Besoin d'aide ?
      </button>
    </div>
  </div>
);

const FeatureSubjects = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-5 md:left-10 w-48 md:w-72 h-48 md:h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-40 right-5 md:right-20 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-soft delay-1000" />
      </div>

      {/* Hero Section */}
      <main className="relative pt-24 md:pt-32">
        <div className="max-w-5xl mx-auto px-4 text-center">
          {/* Main heading */}
          <div className="space-y-4 md:space-y-6 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Gestion des
              <br />
              <span className="gradient-text-animated font-heading">
                Matières
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Organise toutes tes matières et examens en un seul endroit. Définis tes objectifs 
            de révision, suis les dates importantes et priorise efficacement ton travail.
          </p>

          {/* CTA Button */}
          <div>
            <Link to="/auth?mode=signup">
              <Button variant="outline" size="lg" className="rounded-full px-6">
                Organiser mes matières
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Static Subjects Preview */}
        <div className="relative max-w-6xl mx-auto px-4 mt-16 pb-16">
          <div>
            <StaticSubjectsCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureSubjects;
