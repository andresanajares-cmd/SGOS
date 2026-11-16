
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import ordenService from "../services/ordenService";
import authService from "../services/authService";

import "./Inicio.css";

const estadisticas = [
  {
    titulo: "Solicitudes abiertas",
    icono: "bi-inbox",
    clase: "abiertas",
    estado: "ABIERTA",
  },
  {
    titulo: "En proceso",
    icono: "bi-clock-history",
    clase: "proceso",
    estado: "EN_PROCESO",
  },
  {
    titulo: "Solicitudes cerradas",
    icono: "bi-check-circle",
    clase: "cerradas",
    estado: "CERRADA",
  },
];

function Inicio() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const reducirMovimiento = useReducedMotion();

  useEffect(() => {
    let activo = true;

    const cargarEstadisticas = async () => {
      try {
        setCargando(true);
        setError(null);

        const usuario = authService.getUsuario();

        if (!usuario) {
          throw new Error("No se encontró la sesión del usuario.");
        }

        let datos;

        if (usuario.rol === "ADMINISTRADOR") {
          datos = await ordenService.obtenerTodasLasOrdenes();
        } else if (usuario.rol === "TECNICO") {
          datos = await ordenService.obtenerMisOrdenes();
        } else {
          throw new Error(
            "El rol del usuario no tiene estadísticas configuradas."
          );
        }

        if (!Array.isArray(datos)) {
          throw new Error(
            "El servidor devolvió un formato de órdenes inesperado."
          );
        }

        if (activo) {
          setOrdenes(datos);
        }
      } catch (err) {
        console.error("Error al cargar estadísticas:", err);

        if (activo) {
          setError(
            "No fue posible cargar las estadísticas. Intenta nuevamente."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarEstadisticas();

    return () => {
      activo = false;
    };
  }, []);

  const contarPorEstado = (estado) =>
    ordenes.filter((orden) => orden.estado === estado).length;
  const solicitudesRecientes = [...ordenes]
    .sort((a, b) => {
      const diferenciaFecha =
        new Date(b.fecha) - new Date(a.fecha);

      return diferenciaFecha !== 0
        ? diferenciaFecha
        : b.id - a.id;
    })
    .slice(0, 5);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${fecha}T00:00:00Z`));
  };

  const formatearEstado = (estado) => {
    const nombres = {
      ABIERTA: "Abierta",
      EN_PROCESO: "En proceso",
      CERRADA: "Cerrada",
    };

    return nombres[estado] || estado || "Sin estado";
  };

  return (
    <div className="inicio-page">
      <div className="estadisticas-grid">
        {estadisticas.map((item, index) => (
          <motion.div
            key={item.clase}
            className={`estadistica-card ${item.clase}`}
            initial={
              reducirMovimiento
                ? false
                : { opacity: 0, y: 16 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducirMovimiento ? 0 : 0.35,
              delay: reducirMovimiento ? 0 : index * 0.07,
              ease: "easeOut",
            }}
          >
            <div className="estadistica-superior">
              <span>{item.titulo}</span>

              <div className="estadistica-icono">
                <i className={`bi ${item.icono}`}></i>
              </div>
            </div>

            <div className="estadistica-valor">
              <h2>
                {cargando || error
                  ? "—"
                  : contarPorEstado(item.estado)}
              </h2>

              <span>
                {cargando
                  ? "Cargando..."
                  : error
                    ? "No disponible"
                    : "Datos actualizados"}
              </span>
            </div>

            <div className="estadistica-barra"></div>
          </motion.div>
        ))}
      </div>

      {error && (
        <p role="alert" style={{ color: "#b42318" }}>
          {error}
        </p>
      )}

      <section className="solicitudes-panel">
        <div className="solicitudes-panel-header">
          <div>
            <h2>Solicitudes recientes</h2>
            <p>Últimas órdenes de servicio registradas</p>
          </div>

          <div className="solicitudes-panel-icon">
            <i className="bi bi-list-task"></i>
          </div>
        </div>


        {cargando ? (
          <div className="solicitudes-placeholder">
            <i className="bi bi-arrow-repeat"></i>
            <h3>Cargando solicitudes...</h3>
            <p>Consultando las órdenes de servicio.</p>
          </div>
        ) : error ? (
          <div className="solicitudes-placeholder" role="alert">
            <i className="bi bi-exclamation-circle"></i>
            <h3>No se pudieron cargar las solicitudes</h3>
            <p>Comprueba la conexión con el servidor.</p>
          </div>
        ) : solicitudesRecientes.length === 0 ? (
          <div className="solicitudes-placeholder">
            <i className="bi bi-clipboard-data"></i>
            <h3>No hay solicitudes registradas</h3>
            <p>Las órdenes aparecerán aquí cuando estén disponibles.</p>
          </div>
        ) : (
          <motion.div
            className="solicitudes-tabla-contenedor"
            initial={
              reducirMovimiento
                ? false
                : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducirMovimiento ? 0 : 0.35,
              ease: "easeOut",
            }}
          >
            <table className="solicitudes-tabla">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Descripción</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Técnico</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {solicitudesRecientes.map((orden) => (
                  <tr key={orden.id}>
                    <td>
                      <span className="solicitud-id">
                        #{orden.id}
                      </span>
                    </td>

                    <td>
                      <span
                        className="solicitud-descripcion"
                        title={orden.descripcion}
                      >
                        {orden.descripcion || "Sin descripción"}
                      </span>
                    </td>

                    <td>{orden.cliente || "Sin cliente"}</td>

                    <td>{formatearFecha(orden.fecha)}</td>

                    <td>{orden.tecnico || "Sin asignar"}</td>

                    <td>
                      <span
                        className={`solicitud-estado ${orden.estado === "ABIERTA"
                            ? "estado-abierta"
                            : orden.estado === "EN_PROCESO"
                              ? "estado-proceso"
                              : orden.estado === "CERRADA"
                                ? "estado-cerrada"
                                : ""
                          }`}
                      >
                        {formatearEstado(orden.estado)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

      </section>
    </div>
  );
}

export default Inicio;
