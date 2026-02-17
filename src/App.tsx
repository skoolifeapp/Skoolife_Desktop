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
import { AppLayout } from "@/components/AppLayout";
import CookieConsent from "@/components/CookieConsent";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PostCheckout = lazy(() => import("./pages/PostCheckout"));
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
const CancelSubscription = lazy(() => import("./pages/CancelSubscription"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Pomodoro = lazy(() => import("./pages/Pomodoro"));
const StudyFiles = lazy(() => import("./pages/StudyFiles"));
const Tasks = lazy(() => import("./pages/Tasks"));
const AITools = lazy(() => import("./pages/AITools"));
const FeatureCalendar = lazy(() => import("./pages/FeatureCalendar"));
const FeatureProgression = lazy(() => import("./pages/FeatureProgression"));
const FeatureSubjects = lazy(() => import("./pages/FeatureSubjects"));
const FeaturePomodoro = lazy(() => import("./pages/FeaturePomodoro"));
const FeatureSettings = lazy(() => import("./pages/FeatureSettings"));
const FeatureTodo = lazy(() => import("./pages/FeatureTodo"));
const FeatureFiles = lazy(() => import("./pages/FeatureFiles"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const Legal = lazy(() => import("./pages/Legal"));
const Privacy = lazy(() => import("./pages/Privacy"));
const DesktopOnly = lazy(() => import("./pages/DesktopOnly"));
// B2B School pages
const SchoolLanding = lazy(() => import("./pages/SchoolLanding"));
const SchoolSignup = lazy(() => import("./pages/SchoolSignup"));
const SchoolDashboard = lazy(() => import("./pages/SchoolDashboard"));
const SchoolStudents = lazy(() => import("./pages/SchoolStudents"));
const SchoolCohorts = lazy(() => import("./pages/SchoolCohorts"));
const SchoolAccessCodes = lazy(() => import("./pages/SchoolAccessCodes"));
const SchoolAnalytics = lazy(() => import("./pages/SchoolAnalytics"));
const SchoolSettings = lazy(() => import("./pages/SchoolSettings"));
const SchoolProfile = lazy(() => import("./pages/SchoolProfile"));

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
              <PresenceProvider>
                <Suspense fallback={<MinimalLoader />}>
                  <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/features/calendar" element={<FeatureCalendar />} />
                      <Route path="/features/progression" element={<FeatureProgression />} />
                      <Route path="/features/subjects" element={<FeatureSubjects />} />
                      <Route path="/features/pomodoro" element={<FeaturePomodoro />} />
                      <Route path="/features/settings" element={<FeatureSettings />} />
                      <Route path="/features/todo" element={<FeatureTodo />} />
                      <Route path="/features/files" element={<FeatureFiles />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/legal" element={<Legal />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/desktop-only" element={<DesktopOnly />} />
                      <Route path="/post-checkout" element={<PostCheckout />} />
                      <Route path="/onboarding" element={<Onboarding />} />

                      {/* App routes with persistent sidebar - no Suspense here, handled in AppLayout */}
                      <Route element={<AppLayout />}>
                        <Route path="/app" element={<Dashboard />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/progression" element={<Progression />} />
                        <Route path="/subjects" element={<Subjects />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/subscription" element={<Subscription />} />
                        <Route path="/cancel" element={<CancelSubscription />} />
                        <Route path="/pomodoro" element={<Pomodoro />} />
                        <Route path="/study-files" element={<StudyFiles />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/ai-tools" element={<AITools />} />
                      </Route>

                      <Route path="/admin" element={<Admin />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/stats" element={<AdminStats />} />
                      <Route path="/admin/analytics" element={<AdminAnalytics />} />
                      <Route path="/invite/:token" element={<Invite />} />
                      <Route path="/invite-accept/:token" element={<InviteAccept />} />
                      <Route path="/cancel" element={<CancelSubscription />} />
                      
                      {/* B2B School routes */}
                      <Route path="/etablissements" element={<SchoolLanding />} />
                      <Route path="/etablissements/inscription" element={<SchoolSignup />} />
                      <Route path="/school" element={<SchoolDashboard />} />
                      <Route path="/school/students" element={<SchoolStudents />} />
                      <Route path="/school/cohorts" element={<SchoolCohorts />} />
                      <Route path="/school/codes" element={<SchoolAccessCodes />} />
                      <Route path="/school/analytics" element={<SchoolAnalytics />} />
                      <Route path="/school/settings" element={<SchoolSettings />} />
                      <Route path="/school/profile" element={<SchoolProfile />} />
                      
                      <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </PresenceProvider>
            </LayoutSidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
