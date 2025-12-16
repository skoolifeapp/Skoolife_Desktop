import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { PresenceProvider } from "@/components/PresenceProvider";
import { AppLayout } from "@/components/AppLayout";

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
const Invite = lazy(() => import("./pages/Invite"));
const InviteAccept = lazy(() => import("./pages/InviteAccept"));
const CancelSubscription = lazy(() => import("./pages/CancelSubscription"));
const Subscription = lazy(() => import("./pages/Subscription"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
          <BrowserRouter>
            <PresenceProvider>
              <Suspense fallback={<MinimalLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/pricing" element={<Pricing />} />
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
                  </Route>
                  
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/stats" element={<AdminStats />} />
                  <Route path="/invite/:token" element={<Invite />} />
                  <Route path="/invite-accept/:token" element={<InviteAccept />} />
                  <Route path="/cancel" element={<CancelSubscription />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </PresenceProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
