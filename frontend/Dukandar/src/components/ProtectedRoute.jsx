import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowed, role }) => {
  if (!role) return <Navigate to="/login" replace />;
  if (!allowed.includes(role)) return <Navigate to="/not-authorized" replace />;

  return children;
};

export default ProtectedRoute;
