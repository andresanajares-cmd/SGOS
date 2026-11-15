
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ autenticado }) {
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
