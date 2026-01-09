import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Folder, Upload, Search, MoreVertical, File, Download, Trash2, Bell, Sun, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureSidebar from '@/components/FeatureSidebar';
import ParallaxBackground from '@/components/ParallaxBackground';
import { useConfetti } from '@/hooks/useConfetti';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

// Static Files Card Component - Reproduit l'interface exacte de l'app
const StaticFilesCard = () => (
  <div className="h-[520px] md:h-[620px] flex bg-[#FFFDF8] dark:bg-card rounded-xl md:rounded-2xl border border-border/20 overflow-hidden shadow-2xl">
    {/* Yellow Sidebar - Navigation between feature pages */}
    <FeatureSidebar />

    {/* Main Content */}
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span className="text-sm">/</span>
          <span className="text-sm font-medium text-foreground">Mes fiches</span>
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
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Mes fiches</h2>
            <p className="text-sm text-muted-foreground">Stocke et organise tes cours</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-border/50 bg-white dark:bg-card w-48"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            <Upload className="w-4 h-4" />
            Importer
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-6 pb-3 text-sm">
        <button className="text-primary hover:underline">Mes fiches</button>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <span className="text-foreground font-medium">Finance</span>
      </div>

      {/* File Grid */}
      <div className="flex-1 px-6 pb-4 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Folder 1 */}
          <div className="p-4 bg-white dark:bg-card rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Folder className="w-6 h-6 text-primary" />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm font-medium text-foreground truncate">Mathématiques</p>
            <p className="text-xs text-muted-foreground">8 fichiers</p>
          </div>

          {/* Folder 2 */}
          <div className="p-4 bg-white dark:bg-card rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Folder className="w-6 h-6 text-blue-500" />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm font-medium text-foreground truncate">Finance</p>
            <p className="text-xs text-muted-foreground">12 fichiers</p>
          </div>

          {/* File 1 - PDF */}
          <div className="p-4 bg-white dark:bg-card rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <File className="w-6 h-6 text-red-500" />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm font-medium text-foreground truncate">Chapitre 5.pdf</p>
            <p className="text-xs text-muted-foreground">2.4 MB</p>
          </div>

          {/* File 2 - Word */}
          <div className="p-4 bg-white dark:bg-card rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <File className="w-6 h-6 text-blue-600" />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm font-medium text-foreground truncate">Notes cours.docx</p>
            <p className="text-xs text-muted-foreground">156 KB</p>
          </div>

          {/* Folder 3 */}
          <div className="hidden md:block p-4 bg-white dark:bg-card rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Folder className="w-6 h-6 text-green-500" />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm font-medium text-foreground truncate">MCG</p>
            <p className="text-xs text-muted-foreground">5 fichiers</p>
          </div>

          {/* File 3 */}
          <div className="hidden md:block p-4 bg-white dark:bg-card rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <File className="w-6 h-6 text-red-500" />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm font-medium text-foreground truncate">Résumé exam.pdf</p>
            <p className="text-xs text-muted-foreground">1.8 MB</p>
          </div>

          {/* File 4 */}
          <div className="hidden md:block p-4 bg-white dark:bg-card rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Folder className="w-6 h-6 text-purple-500" />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm font-medium text-foreground truncate">MSI</p>
            <p className="text-xs text-muted-foreground">3 fichiers</p>
          </div>

          {/* Upload Zone */}
          <div className="hidden md:flex p-4 bg-muted/30 rounded-xl border-2 border-dashed border-border/50 items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="text-center">
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Glisser-déposer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FeatureFiles = () => {
  const { triggerConfetti } = useConfetti();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Background decorations with parallax */}
      <ParallaxBackground />

      {/* Hero Section */}
      <main className="relative pt-24 md:pt-32">
        <motion.div 
          className="max-w-5xl mx-auto px-4 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          {/* Main heading */}
          <div className="space-y-4 md:space-y-6 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight font-heading">
              Mes
              <br />
              <span className="gradient-text-animated font-heading">
                Fiches
              </span>
            </h1>
          </div>

          {/* Description */}
          <motion.p 
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Stocke tous tes cours, fiches de révision et documents au même endroit. 
            Organise-les par matière, recherche rapidement et accède à tes fichiers 
            depuis n'importe où.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/auth?mode=signup" onClick={triggerConfetti}>
              <Button variant="outline" size="lg" className="rounded-full px-6 group">
                Organiser mes cours
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Static Files Preview */}
        <motion.div 
          className="relative max-w-6xl mx-auto px-4 mt-16 pb-16"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div>
            <StaticFilesCard />
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default FeatureFiles;