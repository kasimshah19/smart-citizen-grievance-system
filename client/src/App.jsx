import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
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
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminSupportTicketsPage from "./pages/AdminSupportTicketsPage";
import AdminAnnouncementsPage from "./pages/AdminAnnouncementsPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import EmployeeRoute from "./components/common/EmployeeRoute";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import EmployeeComplaintsPage from "./pages/EmployeeComplaintsPage";
import EmployeeComplaintDetailPage from "./pages/EmployeeComplaintDetailPage";
import EmployeeProfilePage from "./pages/EmployeeProfilePage";
import EmployeeSettingsPage from "./pages/EmployeeSettingsPage";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
            <AdminUsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <AdminRoute>
            <AdminAnnouncementsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/support-tickets"
        element={
          <AdminRoute>
            <AdminSupportTicketsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <AdminAnalyticsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        }
      />

      {/* Employee Portal */}
      <Route
        path="/employee"
        element={
          <EmployeeRoute>
            <EmployeeDashboardPage />
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/complaints"
        element={
          <EmployeeRoute>
            <EmployeeComplaintsPage />
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/complaints/:id"
        element={
          <EmployeeRoute>
            <EmployeeComplaintDetailPage />
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <EmployeeRoute>
            <EmployeeProfilePage />
          </EmployeeRoute>
        }
      />
      <Route
        path="/employee/settings"
        element={
          <EmployeeRoute>
            <EmployeeSettingsPage />
          </EmployeeRoute>
        }
      />
    </Routes>
  );
}

export default App;
