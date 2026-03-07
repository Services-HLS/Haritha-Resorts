import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PropertyProvider, useProperty } from "@/contexts/PropertyContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import Login from "./pages/Login";
import GlobalDashboard from "./pages/GlobalDashboard";
import PropertyDashboard from "./pages/property/PropertyDashboard";
import RoomsManagement from "./pages/property/RoomsManagement";
import RoomDetails from "./pages/property/RoomDetails";
import BookingManagement from "./pages/property/BookingManagement";
import GuestManagement from "./pages/property/GuestManagement";
import BillingPayments from "./pages/property/BillingPayments";
import RestaurantOrders from "./pages/property/RestaurantOrders";
import AmenitiesManagement from "./pages/property/AmenitiesManagement";
import Reports from "./pages/property/Reports";
import SettingsPage from "./pages/property/Settings";
import DayView from "./pages/property/DayView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PropertyGuard({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { currentProperty, setCurrentProperty, allProperties } = useProperty();

  useEffect(() => {
    if (id && (!currentProperty || currentProperty.id !== id)) {
      if (id === 'all') {
        setCurrentProperty({ id: 'all' } as any);
      } else {
        const prop = allProperties.find(p => p.id === id);
        if (prop) setCurrentProperty(prop);
      }
    }
  }, [id, currentProperty, allProperties, setCurrentProperty]);

  if (user?.role === 'Property Manager' && user.propertyId !== id) {
    return <Navigate to={`/property/${user.propertyId}/dashboard`} replace />;
  }

  if (!currentProperty || currentProperty.id !== id) return null;

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={user?.role === 'Property Manager' ? <Navigate to={`/property/${user.propertyId}/dashboard`} replace /> : <GlobalDashboard />} />

        <Route path="/property/:id/*" element={
          <PropertyGuard>
            <Routes>
              <Route path="dashboard" element={<PropertyDashboard />} />
              <Route path="rooms" element={<RoomsManagement />} />
              <Route path="rooms/:roomId" element={<RoomDetails />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="day-view/:date" element={<DayView />} />
              <Route path="guests" element={<GuestManagement />} />
              <Route path="billing" element={<BillingPayments />} />
              <Route path="restaurant" element={<RestaurantOrders />} />
              <Route path="amenities" element={<AmenitiesManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<SettingsPage />} />
            </Routes>
          </PropertyGuard>
        } />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <PropertyProvider>
            <AppRoutes />
          </PropertyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
