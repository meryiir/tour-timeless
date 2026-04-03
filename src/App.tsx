import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollToTop from "@/components/ScrollToTop";
import PublicLayout from "@/components/PublicLayout";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

const HomePage = lazy(() => import("@/pages/HomePage"));
const ActivitiesPage = lazy(() => import("@/pages/ActivitiesPage"));
const ActivityDetailPage = lazy(() => import("@/pages/ActivityDetailPage"));
const DestinationsPage = lazy(() => import("@/pages/DestinationsPage"));
const DestinationDetailPage = lazy(() => import("@/pages/DestinationDetailPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminActivities = lazy(() => import("@/pages/admin/AdminActivities"));
const AdminDestinations = lazy(() => import("@/pages/admin/AdminDestinations"));
const ActivityFormPage = lazy(() => import("@/pages/admin/ActivityFormPage"));
const DestinationFormPage = lazy(() => import("@/pages/admin/DestinationFormPage"));
const AdminBookings = lazy(() => import("@/pages/admin/AdminBookings"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminReviews = lazy(() => import("@/pages/admin/AdminReviews"));
const AdminContactMessages = lazy(() => import("@/pages/admin/AdminContactMessages"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <CurrencyProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/activities/:slug" element={<ActivityDetailPage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin - Protected */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="activities/new" element={<ActivityFormPage />} />
                <Route path="activities/:id/edit" element={<ActivityFormPage />} />
                <Route path="activities" element={<AdminActivities />} />
                <Route path="destinations/new" element={<DestinationFormPage />} />
                <Route path="destinations/:id/edit" element={<DestinationFormPage />} />
                <Route path="destinations" element={<AdminDestinations />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="messages" element={<AdminContactMessages />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
        </CurrencyProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
