import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import NewComplaintPage from "./pages/NewComplaintPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import ComplaintDetailPage from "./pages/ComplaintDetailPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import HelpSupportPage from "./pages/HelpSupportPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminComingSoonPage from "./pages/AdminComingSoonPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";
import AdminDepartmentsPage from "./pages/AdminDepartmentsPage";
import AdminEmployeesPage from "./pages/AdminEmployeesPage";
import AdminComplaintsPage from "./pages/AdminComplaintsPage";
import AdminComplaintDetailPage from "./pages/AdminComplaintDetailPage";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Citizen Portal */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/new-complaint"
        element={
          <ProtectedRoute>
            <NewComplaintPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/complaints"
        element={
          <ProtectedRoute>
            <MyComplaintsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/complaints/:id"
        element={
          <ProtectedRoute>
            <ComplaintDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/help"
        element={
          <ProtectedRoute>
            <HelpSupportPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <AdminRoute>
            <AdminComplaintsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/complaints/:id"
        element={
          <AdminRoute>
            <AdminComplaintDetailPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <AdminRoute>
            <AdminDepartmentsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <AdminRoute>
            <AdminEmployeesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminComingSoonPage title="Users" />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <AdminRoute>
            <AdminComingSoonPage title="Announcements" />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/support-tickets"
        element={
          <AdminRoute>
            <AdminComingSoonPage title="Support Tickets" />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <AdminComingSoonPage title="Analytics" />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminComingSoonPage title="Settings" />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;