import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { PresenceProvider } from "@/components/PresenceProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import PostCheckout from "./pages/PostCheckout";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Progression from "./pages/Progression";
import Subjects from "./pages/Subjects";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminStats from "./pages/AdminStats";
import Invite from "./pages/Invite";
import CancelSubscription from "./pages/CancelSubscription";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PresenceProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/post-checkout" element={<PostCheckout />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/app" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/progression" element={<Progression />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/stats" element={<AdminStats />} />
                <Route path="/invite/:token" element={<Invite />} />
                <Route path="/cancel" element={<CancelSubscription />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PresenceProvider>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
