import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckSquare, Plus, Clock, Flag, BookOpen, Bell, Sun, AlignLeft, GripVertical } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureSidebar from '@/components/FeatureSidebar';

// Static To-Do Card Component - Reproduit l'interface exacte de l'app
const StaticTodoCard = () => (
  <div className="h-[520px] md:h-[620px] flex bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-2xl">
    {/* Yellow Sidebar - Navigation between feature pages */}
    <FeatureSidebar />

    {/* Main Content */}
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckSquare className="w-4 h-4" />
          <span className="text-sm">/</span>
          <span className="text-sm font-medium text-foreground">To-Do</span>
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">To-Do List</h2>
            <p className="text-sm text-muted-foreground">Gère tes tâches efficacement</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 px-6 pb-4 overflow-hidden">
        {/* Column: À faire */}
        <div className="flex-1 flex flex-col bg-muted/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm font-semibold text-foreground">À faire</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">3</span>
          </div>
          <div className="flex-1 space-y-2 overflow-hidden">
            {/* Task 1 */}
            <div className="p-3 bg-white dark:bg-card rounded-lg border border-border/30 shadow-sm">
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1">Réviser le chapitre 5</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">FINANCE</span>
                    <div className="flex items-center gap-1 text-[10px] text-red-500">
                      <Clock className="w-3 h-3" />
                      <span>Aujourd'hui</span>
                    </div>
                    <AlignLeft className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
                <Flag className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              </div>
            </div>
            {/* Task 2 */}
            <div className="p-3 bg-white dark:bg-card rounded-lg border border-border/30 shadow-sm">
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1">Préparer exposé</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-600 font-medium">MCG</span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>12 janv.</span>
                    </div>
                  </div>
                </div>
                <Flag className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              </div>
            </div>
            {/* Task 3 */}
            <div className="p-3 bg-white dark:bg-card rounded-lg border border-border/30 shadow-sm">
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1">Lire articles semaine</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 font-medium">MSI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column: En cours */}
        <div className="flex-1 flex flex-col bg-muted/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-foreground">En cours</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">2</span>
          </div>
          <div className="flex-1 space-y-2 overflow-hidden">
            {/* Task 4 */}
            <div className="p-3 bg-white dark:bg-card rounded-lg border-2 border-primary shadow-sm">
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1">Exercices maths</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium">MATHS</span>
                    <AlignLeft className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
                <Flag className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              </div>
            </div>
            {/* Task 5 */}
            <div className="p-3 bg-white dark:bg-card rounded-lg border border-border/30 shadow-sm">
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1">Résumé cours</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">FINANCE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column: Terminé */}
        <div className="hidden md:flex flex-1 flex-col bg-muted/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-foreground">Terminé</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">2</span>
          </div>
          <div className="flex-1 space-y-2 overflow-hidden">
            {/* Task 6 */}
            <div className="p-3 bg-white dark:bg-card rounded-lg border border-border/30 shadow-sm opacity-60">
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-through mb-1">QCM économie</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-600 font-medium">MCG</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Task 7 */}
            <div className="p-3 bg-white dark:bg-card rounded-lg border border-border/30 shadow-sm opacity-60">
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-through mb-1">Inscription exam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FeatureTodo = () => {
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
              To-Do
              <br />
              <span className="gradient-text-animated font-heading">
                List
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Organise toutes tes tâches avec un tableau Kanban intuitif. 
            Glisse-dépose tes tâches entre les colonnes, fixe des priorités 
            et ne rate plus jamais une deadline.
          </p>

          {/* CTA Button */}
          <div>
            <Link to="/auth?mode=signup">
              <Button variant="outline" size="lg" className="rounded-full px-6">
                Gérer mes tâches efficacement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Static To-Do Preview */}
        <div className="relative max-w-6xl mx-auto px-4 mt-16 pb-16">
          <div>
            <StaticTodoCard />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureTodo;
