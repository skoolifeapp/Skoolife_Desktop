import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { PresenceProvider } from "@/components/PresenceProvider";
import { LayoutSidebarProvider } from "@/contexts/LayoutSidebarContext";
import { SchoolRoleProvider } from "@/hooks/useSchoolRole";
import { AppLayout } from "@/components/AppLayout";
import CookieConsent from "@/components/CookieConsent";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const Progression = lazy(() => import("./pages/Progression"));
const Subjects = lazy(() => import("./pages/Subjects"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminStats = lazy(() => import("./pages/AdminStats"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const Invite = lazy(() => import("./pages/Invite"));
const InviteAccept = lazy(() => import("./pages/InviteAccept"));
const Pomodoro = lazy(() => import("./pages/Pomodoro"));
const StudyFiles = lazy(() => import("./pages/StudyFiles"));
const FeatureCalendar = lazy(() => import("./pages/FeatureCalendar"));
const FeatureProgression = lazy(() => import("./pages/FeatureProgression"));
const FeatureSubjects = lazy(() => import("./pages/FeatureSubjects"));
const FeaturePomodoro = lazy(() => import("./pages/FeaturePomodoro"));
const FeatureSettings = lazy(() => import("./pages/FeatureSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Legal = lazy(() => import("./pages/Legal"));
const Privacy = lazy(() => import("./pages/Privacy"));

// Institution B2B pages
const CreateInstitution = lazy(() => import("./pages/institution/CreateInstitution"));
const JoinInstitution = lazy(() => import("./pages/institution/JoinInstitution"));
const InstitutionDashboard = lazy(() => import("./pages/institution/InstitutionDashboard"));
const TeacherDashboard = lazy(() => import("./pages/institution/TeacherDashboard"));
const ManageCohorts = lazy(() => import("./pages/institution/ManageCohorts"));
const ManageStudents = lazy(() => import("./pages/institution/ManageStudents"));
const ManageTeachers = lazy(() => import("./pages/institution/ManageTeachers"));
const InstitutionSettings = lazy(() => import("./pages/institution/InstitutionSettings"));
const Contact = lazy(() => import("./pages/Contact"));

// Optimized QueryClient with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Minimal loading fallback for public pages (no skeleton)
const MinimalLoader = () => (
  <div className="min-h-screen" />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CookieConsent />
          <BrowserRouter>
            <LayoutSidebarProvider>
              <SchoolRoleProvider>
                <PresenceProvider>
                  <Suspense fallback={<MinimalLoader />}>
                  <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/features/calendar" element={<FeatureCalendar />} />
                      <Route path="/features/progression" element={<FeatureProgression />} />
                      <Route path="/features/subjects" element={<FeatureSubjects />} />
                      <Route path="/features/pomodoro" element={<FeaturePomodoro />} />
                      <Route path="/features/settings" element={<FeatureSettings />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/legal" element={<Legal />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      
                      {/* Institution B2B routes */}
                      <Route path="/institution/create" element={<CreateInstitution />} />
                      <Route path="/join" element={<JoinInstitution />} />
                      <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
                      <Route path="/institution/students" element={<ManageStudents />} />
                      <Route path="/institution/cohorts" element={<ManageCohorts />} />
                      <Route path="/institution/teachers" element={<ManageTeachers />} />
                      <Route path="/institution/settings" element={<InstitutionSettings />} />
                      <Route path="/contact" element={<Contact />} />

                      {/* App routes with persistent sidebar */}
                      <Route element={<AppLayout />}>
                        <Route path="/app" element={<Dashboard />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/progression" element={<Progression />} />
                        <Route path="/subjects" element={<Subjects />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/pomodoro" element={<Pomodoro />} />
                        <Route path="/study-files" element={<StudyFiles />} />
                      </Route>

                      <Route path="/admin" element={<Admin />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/stats" element={<AdminStats />} />
                      <Route path="/admin/analytics" element={<AdminAnalytics />} />
                      <Route path="/invite/:token" element={<Invite />} />
                      <Route path="/invite-accept/:token" element={<InviteAccept />} />
                      <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
                </PresenceProvider>
              </SchoolRoleProvider>
            </LayoutSidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
