import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AppLayout from "./layouts/AppLayout";
import Planning from "./pages/Planning";
import ProgressionPage from "./pages/ProgressionPage";
import BudgetPage from "./pages/BudgetPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* App routes with shared layout */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/planning" replace />} />
              <Route path="planning" element={<Planning />} />
              <Route path="progression" element={<ProgressionPage />} />
              <Route path="budget" element={<BudgetPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Legacy redirects */}
            <Route path="/progression" element={<Navigate to="/app/progression" replace />} />
            <Route path="/budget" element={<Navigate to="/app/budget" replace />} />
            <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
