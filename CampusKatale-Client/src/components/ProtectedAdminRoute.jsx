import { Navigate } from "react-router-dom";
import { useAdmin } from "../hooks/AuthProvider";

function ProtectedAdminRoute({ children }) {
  const isAdmin = useAdmin();
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

export default ProtectedAdminRoute;