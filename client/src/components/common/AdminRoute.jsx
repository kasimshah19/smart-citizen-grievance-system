import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../shared/constants/roles";

function AdminRoute({ children }) {
  const { citizen, loading } = useAuth();

  if (loading) return null;

  if (!citizen) {
    return <Navigate to="/login" replace />;
  }

  if (citizen.role !== ROLES.ADMIN) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default AdminRoute;