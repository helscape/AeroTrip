import { LocationProvider, Route, Router } from "preact-iso";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { MainLayout } from "@/layouts/MainLayout";
import { AccountPage } from "@/pages/AccountPage";
import { BookingPage } from "@/pages/BookingPage";
import { ConfirmationPage } from "@/pages/ConfirmationPage";
import { FlightDetailPage } from "@/pages/FlightDetailPage";
import { HelpPage } from "@/pages/HelpPage";
import { HomePage } from "@/pages/HomePage";
import { LegalPage } from "@/pages/LegalPage";
import { LoginPage } from "@/pages/LoginPage";
import { ManageBookingPage } from "@/pages/ManageBookingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SearchResultsPage } from "@/pages/SearchResultsPage";

export function App() {
  return (
    <LocationProvider>
      <ToastProvider>
        <AuthProvider>
          <MainLayout>
            <Router>
              <Route path="/" component={HomePage} />
              <Route path="/search" component={SearchResultsPage} />
              <Route path="/flights/:id" component={FlightDetailPage} />
              <Route path="/booking" component={BookingPage} />
              <Route path="/bookings/:reference" component={ConfirmationPage} />
              <Route path="/manage" component={ManageBookingPage} />
              <Route path="/login" component={LoginPage} />
              <Route
                path="/account"
                component={() => (
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                )}
              />
              <Route path="/help" component={HelpPage} />
              <Route path="/legal/:topic" component={LegalPage} />
              <Route default component={NotFoundPage} />
            </Router>
          </MainLayout>
        </AuthProvider>
      </ToastProvider>
    </LocationProvider>
  );
}
