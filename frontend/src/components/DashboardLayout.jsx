
import { useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import { toast } from "sonner";
import authService from "../services/authService";
import "./DashboardLayout.css";

const opcionesMenu = [
  {
    ruta: "/",
    icono: "bi-grid-1x2-fill",
    nombre: "Inicio",
    end: true,
  },
  {
    ruta: "/solicitudes",
    icono: "bi-clipboard2-check",
    nombre: "Solicitudes",
  },
  {
    ruta: "/clientes",
    icono: "bi-people-fill",
    nombre: "Clientes",
  },
  {
    ruta: "/usuarios",
    icono: "bi-person-gear",
    nombre: "Usuarios y roles",
  },
  {
    ruta: "/catalogos",
    icono: "bi-collection-fill",
    nombre: "Catálogos",
  },
];

const informacionPaginas = {
  "/": {
    titulo: "Resumen general",
    descripcion:
      "Consulta el estado de las órdenes de servicio y las actividades del sistema.",
  },
  "/solicitudes": {
    titulo: "Solicitudes",
    descripcion:
      "Gestiona y consulta las órdenes de servicio registradas.",
  },
  "/clientes": {
    titulo: "Clientes",
    descripcion:
      "Administra la información de los clientes del sistema.",
  },
  "/usuarios": {
    titulo: "Usuarios y roles",
    descripcion:
      "Gestiona los usuarios y sus roles dentro de SGOS.",
  },
  "/catalogos": {
    titulo: "Catálogos",
    descripcion:
      "Consulta y administra los datos de referencia del sistema.",
  },
};

function DashboardLayout({ onLogout }) {

  const location = useLocation();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuContraido, setMenuContraido] = useState(false);
  const reducirMovimiento = useReducedMotion();
  const paginaActual =
    informacionPaginas[location.pathname] ||
    informacionPaginas["/"];

  const usuario = authService.getUsuario();

  const cerrarSesion = () => {
    setMenuAbierto(false);

    onLogout();

    toast.success("Sesión cerrada correctamente", {
      description: "Has salido de SGOS de forma segura.",
    });
  };

  return (
    <div
      className={`dashboard-layout ${menuContraido ? "layout-collapsed" : ""
        }`}
    >
      {menuAbierto && (
        <button
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      <aside
        className={`sidebar ${menuAbierto ? "sidebar-open" : ""
          }`}
      >
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="logo-placeholder">
              <i className="bi bi-layers-half"></i>
            </div>

            <span className="sidebar-logo-text">
              Espacio para logo
            </span>
          </div>

          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setMenuContraido(!menuContraido)}
            aria-label={
              menuContraido
                ? "Expandir barra lateral"
                : "Contraer barra lateral"
            }
            title={
              menuContraido
                ? "Expandir menú"
                : "Contraer menú"
            }
            aria-expanded={!menuContraido}
          >
            <i
              className={`bi ${menuContraido
                ? "bi-chevron-right"
                : "bi-chevron-left"
                }`}
            ></i>
          </button>
        </div>

        <nav
          className="sidebar-nav"
          aria-label="Menú principal"
        >
          {opcionesMenu.map((opcion) => (
            <NavLink
              key={opcion.ruta}
              to={opcion.ruta}
              end={opcion.end}
              onClick={() => setMenuAbierto(false)}
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
              title={menuContraido ? opcion.nombre : undefined}
              aria-label={opcion.nombre}
            >
              <i className={`bi ${opcion.icono}`}></i>
              <span className="sidebar-link-text">
                {opcion.nombre}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            onClick={cerrarSesion}
            title={menuContraido ? "Cerrar sesión" : undefined}
            aria-label="Cerrar sesión"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span className="sidebar-link-text">
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              type="button"
              className="menu-toggle"
              aria-label="Abrir menú"
              onClick={() => setMenuAbierto(true)}
            >
              <i className="bi bi-list"></i>
            </button>

            <div className="header-title">
              <h2>{paginaActual.titulo}</h2>
              <span>{paginaActual.descripcion}</span>
            </div>
          </div>

          <div className="header-user">
            <div className="user-avatar">
              <i className="bi bi-person-fill"></i>
            </div>

            <div className="user-details">
              <strong>
                {usuario?.nombre || "Usuario"}
              </strong>
              <span>
                {usuario?.rol || "SGOS"}
              </span>
            </div>
          </div>
        </header>


        <main className="dashboard-main">
          <motion.div
            key={location.pathname}
            initial={
              reducirMovimiento
                ? false
                : { opacity: 0, y: 16 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducirMovimiento ? 0 : 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Outlet />
          </motion.div>
        </main>


      </div>
    </div>
  );
}

export default DashboardLayout;
