
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Usuarios from "./pages/Usuarios";
import { Toaster } from "sonner";

import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Solicitudes from "./pages/Solicitudes";
import Clientes from "./pages/Clientes";

import authService from "./services/authService";



function RutasAplicacion() {
  const navigate = useNavigate();

  const [autenticado, setAutenticado] = useState(
    () => authService.isAuthenticated()
  );

  const iniciarSesion = () => {
    setAutenticado(true);
    navigate("/", { replace: true });
  };

  const cerrarSesion = () => {
    authService.logout();
    setAutenticado(false);
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          autenticado ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLoginSuccess={iniciarSesion} />
          )
        }
      />

      <Route
        element={<ProtectedRoute autenticado={autenticado} />}
      >
        <Route
          element={
            <DashboardLayout onLogout={cerrarSesion} />
          }
        >
          <Route index element={<Inicio />} />

          <Route
            path="solicitudes"
            element={<Solicitudes />}
          />

          <Route
            path="clientes"
            element={<Clientes />}
          />

          <Route path="/usuarios" element={<Usuarios />} />

         
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={3500}
        toastOptions={{
          style: {
            fontFamily: "Poppins, sans-serif",
            borderRadius: "12px",
          },
        }}
      />

      <RutasAplicacion />
    </BrowserRouter>
  );
}

export default App;
