import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/layout/NavBar";
import GlobalFooter from "./components/layout/GlobalFooter";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import GalleryPage from "./pages/Gallery";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import UserAgreement from "./pages/UserAgreement";
import DataProtection from "./pages/DataProtection";
import Players from "./pages/Players";
import CoachPortal from "./pages/CoachPortal";
import AdminManagement from "./pages/AdminManagement";
import PlayerManagement from "./pages/PlayerManagement";
import TournamentManagement from "./pages/TournamentManagement";
import TrainingManagement from "./pages/TrainingManagement";
import JerseyLikesManagement from "./pages/JerseyLikesManagement";
import AuditLogs from "./pages/AuditLogs";
import DeletedRecords from "./pages/DeletedRecords";
import ExportCenter from "./pages/ExportCenter";
import GalleryManagement from "./pages/GalleryManagement";
import ContactInfoManagement from "./pages/ContactInfoManagement";
import AboutManagement from "./pages/AboutManagement";
import ScrollToTop from "./components/common/ScrollToTop";

/**
 * Layout Component
 * Conditionally renders NavBar and GlobalFooter based on current route
 * Portal pages have their own layout system
 */
const Layout = ({ children }) => {
  const location = useLocation();

  // Portal routes that use the dashboard layout (no public nav/footer)
  const portalRoutes = [
    "/coach-portal",
    "/manage-players",
    "/manage-tournaments",
    "/manage-trainings",
    "/jersey-likes",
    "/admin-management",
    "/audit-logs",
    "/deleted-records",
    "/export-center",
    "/change-password",
    "/manage-gallery",
    "/manage-contact-info",
    "/manage-about",
  ];

  const isPortalRoute = portalRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {!isPortalRoute && <NavBar />}
      <main className={isPortalRoute ? "" : "flex-grow"}>
        {children}
      </main>
      {!isPortalRoute && <GlobalFooter />}
      <ScrollToTop />
    </div>
  );
};

/**
 * Main App Component
 * Root component for Anantapur Football Club website
 * Features: React Router navigation, page routing, and auth-based route protection
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/terms-and-conditions" element={<UserAgreement />} />
            <Route path="/privacy-policy" element={<DataProtection />} />

            {/* Protected routes - coach only */}
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/players"
              element={
                <ProtectedRoute>
                  <Players />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach-portal"
              element={
                <ProtectedRoute>
                  <CoachPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-management"
              element={
                <ProtectedRoute requiredRole="SUPER_ADMIN">
                  <AdminManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-players"
              element={
                <ProtectedRoute>
                  <PlayerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-tournaments"
              element={
                <ProtectedRoute>
                  <TournamentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-trainings"
              element={
                <ProtectedRoute>
                  <TrainingManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jersey-likes"
              element={
                <ProtectedRoute>
                  <JerseyLikesManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute requiredRole="SUPER_ADMIN">
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deleted-records"
              element={
                <ProtectedRoute requiredRole="SUPER_ADMIN">
                  <DeletedRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/export-center"
              element={
                <ProtectedRoute>
                  <ExportCenter />
                </ProtectedRoute>
              }
            />

            {/* Super Admin - CMS & Config routes */}
            <Route
              path="/manage-gallery"
              element={
                <ProtectedRoute requiredRole="SUPER_ADMIN">
                  <GalleryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-contact-info"
              element={
                <ProtectedRoute requiredRole="SUPER_ADMIN">
                  <ContactInfoManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-about"
              element={
                <ProtectedRoute requiredRole="SUPER_ADMIN">
                  <AboutManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
