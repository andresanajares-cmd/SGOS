
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import DetalleSolicitud from "../components/DetalleSolicitud";
import ordenService from "../services/ordenService";
import authService from "../services/authService";
import { useCallback } from "react";
import { AnimatePresence } from "motion/react";
import CrearSolicitud from "../components/CrearSolicitud";
import "./Solicitudes.css";
import CambiarEstadoSolicitud from "../components/CambiarEstadoSolicitud";
const nombresEstado = {
  ABIERTA: "Abierta",
  EN_PROCESO: "En proceso",
  CERRADA: "Cerrada",
};

function Solicitudes() {
  const [solicitudCambiarEstado, setSolicitudCambiarEstado] = useState(null);
  const [solicitudEditar, setSolicitudEditar] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(5);

  const reducirMovimiento = useReducedMotion();

  const usuario = authService.getUsuario();
  const rol = usuario?.rol;
  
  const esAdministrador = rol === "ADMINISTRADOR";
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [versionListado, setVersionListado] = useState(0);

  const cerrarFormulario = useCallback(() => {
    setMostrarFormulario(false);
    setSolicitudEditar(null);
  }, []);

  const solicitudCreada = useCallback(() => {
    setMostrarFormulario(false);
    setSolicitudEditar(null);
    setPaginaActual(1);
    setVersionListado((anterior) => anterior + 1);
  }, []);

  const cerrarCambioEstado = useCallback(() => {
    setSolicitudCambiarEstado(null);
  }, []);

  const estadoActualizado = useCallback(() => {
    setSolicitudCambiarEstado(null);
    setVersionListado((anterior) => anterior + 1);
  }, []);
  // CARGAR ÓRDENES DESDE SPRING BOOT

  useEffect(() => {
    let activo = true;

    const cargarOrdenes = async () => {
      try {
        setCargando(true);
        setError(false);

        let datos;

        if (rol === "ADMINISTRADOR") {
          datos = await ordenService.obtenerTodasLasOrdenes();
        } else if (rol === "TECNICO") {
          datos = await ordenService.obtenerMisOrdenes();
        } else {
          throw new Error("Rol no autorizado");
        }

        if (!Array.isArray(datos)) {
          throw new Error("Formato de respuesta inesperado");
        }

        if (activo) {
          setOrdenes(datos);
        }
      } catch (err) {
        console.error("Error al cargar solicitudes:", err);

        if (activo) {
          setError(true);
          toast.error("No fue posible cargar las solicitudes");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarOrdenes();

    return () => {
      activo = false;
    };
  }, [rol, versionListado]);

  // FORMATEAR FECHA

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaValida = new Date(`${fecha}T00:00:00Z`);

    if (Number.isNaN(fechaValida.getTime())) {
      return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(fechaValida);
  };

  // NORMALIZAR TEXTO PARA LA BÚSQUEDA

  const normalizarTexto = (texto) =>
    String(texto ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // FILTRAR ÓRDENES

  const ordenesFiltradas = ordenes.filter((orden) => {
    const coincideEstado =
      filtroEstado === "TODAS" ||
      orden.estado === filtroEstado;

    const textoBusqueda = normalizarTexto(busqueda);

    const contenidoOrden = normalizarTexto(
      [
        orden.id,
        orden.descripcion,
        orden.cliente,
        orden.tecnico,
      ].join(" ")
    );

    return (
      coincideEstado &&
      contenidoOrden.includes(textoBusqueda)
    );
  });

  // ORDENAR POR FECHA DESCENDENTE

  const ordenesOrdenadas = [...ordenesFiltradas].sort((a, b) => {
    const diferencia =
      new Date(b.fecha).getTime() -
      new Date(a.fecha).getTime();

    return diferencia || b.id - a.id;
  });

  // PAGINACIÓN

  const totalRegistros = ordenesOrdenadas.length;

  const totalPaginas = Math.max(
    1,
    Math.ceil(totalRegistros / registrosPorPagina)
  );

  const paginaSegura = Math.min(paginaActual, totalPaginas);

  const indiceInicial = (paginaSegura - 1) * registrosPorPagina;
  const indiceFinal = indiceInicial + registrosPorPagina;

  const ordenesPaginadas = ordenesOrdenadas.slice(
    indiceInicial,
    indiceFinal
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("TODAS");
    setPaginaActual(1);
  };
  const abrirEdicion = (orden) => {
    setSolicitudEditar(orden);
    setMostrarFormulario(true);
  };

  return (
    <div className="solicitudes-page">
      
      <motion.section
        className="solicitudes-contenedor"
        initial={
          reducirMovimiento
            ? false
            : { opacity: 0, y: 14 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reducirMovimiento ? 0 : 0.35,
          ease: "easeOut",
        }}
      >
        {/* ENCABEZADO */}

        <div className="solicitudes-encabezado">
          <div className="solicitudes-encabezado-texto">
            <div className="solicitudes-encabezado-icono">
              <i className="bi bi-clipboard2-check"></i>
            </div>

            <div>
              <h2>Listado de solicitudes</h2>

              <p>
                {esAdministrador
                  ? "Consulta las órdenes de servicio registradas en SGOS."
                  : "Consulta las órdenes de servicio asignadas a tu usuario."}
              </p>
            </div>
          </div>


          <div className="solicitudes-acciones-encabezado">
            <div className="solicitudes-total">
              <i className="bi bi-collection"></i>

              <span>
                {cargando
                  ? "Cargando..."
                  : error
                    ? "No disponible"
                    : `${ordenes.length} solicitudes`}
              </span>
            </div>

            {esAdministrador && (
              <button
                type="button"
                className="solicitudes-nueva"
                onClick={() => {
                  setSolicitudEditar(null);
                  setMostrarFormulario(true);
                }}
              >
                <i className="bi bi-plus-lg"></i>
                Nueva solicitud
              </button>
            )}
          </div>

        </div>

        {/* BUSCADOR Y FILTROS */}

        <div className="solicitudes-filtros">
          <div className="solicitudes-buscador">
            <i className="bi bi-search"></i>

            <input
              type="search"
              placeholder="Buscar por número, descripción, cliente o técnico..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              aria-label="Buscar solicitudes"
            />
          </div>

          <div className="solicitudes-filtro-estado">
            <i className="bi bi-funnel"></i>

            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1);
              }}
              aria-label="Filtrar solicitudes por estado"
            >
              <option value="TODAS">Todos los estados</option>
              <option value="ABIERTA">Abiertas</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="CERRADA">Cerradas</option>
            </select>
          </div>

          {(busqueda || filtroEstado !== "TODAS") && (
            <button
              type="button"
              className="solicitudes-limpiar"
              onClick={limpiarFiltros}
            >
              <i className="bi bi-x-circle"></i>
              Limpiar
            </button>
          )}
        </div>

        {/* CONTADOR DE RESULTADOS */}

        {!cargando && !error && (
          <div className="solicitudes-resultados">
            {totalRegistros === ordenes.length
              ? `${totalRegistros} solicitudes disponibles`
              : `${totalRegistros} de ${ordenes.length} solicitudes encontradas`}
          </div>
        )}

        {/* TABLA DE SOLICITUDES */}

        <div className="solicitudes-tabla-wrapper">
          {cargando ? (
            <div className="solicitudes-estado-vacio" role="status">
              <i className="bi bi-arrow-repeat"></i>
              <h3>Cargando solicitudes...</h3>
              <p>Consultando la información del servidor.</p>
            </div>
          ) : error ? (
            <div className="solicitudes-estado-vacio" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <h3>No se pudieron cargar las solicitudes</h3>
              <p>Comprueba la conexión con Spring Boot.</p>
            </div>
          ) : totalRegistros === 0 ? (
            <div className="solicitudes-estado-vacio">
              <i className="bi bi-search"></i>

              <h3>
                {ordenes.length === 0
                  ? "No hay solicitudes disponibles"
                  : "No se encontraron resultados"}
              </h3>

              <p>
                {ordenes.length === 0
                  ? "Las órdenes aparecerán aquí cuando estén registradas."
                  : "Prueba con otra búsqueda o cambia el filtro de estado."}
              </p>
            </div>
          ) : (
            <div className="solicitudes-tabla-scroll">
              <table className="solicitudes-listado-tabla">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Descripción</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Técnico</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {ordenesPaginadas.map((orden) => (
                    <tr key={orden.id}>
                      <td>
                        <span className="solicitudes-numero">
                          #{orden.id}
                        </span>
                      </td>

                      <td>
                        <span
                          className="solicitudes-descripcion"
                          title={orden.descripcion || ""}
                        >
                          {orden.descripcion || "Sin descripción"}
                        </span>
                      </td>

                      <td>
                        {orden.cliente || "Sin cliente"}
                      </td>

                      <td>
                        {formatearFecha(orden.fecha)}
                      </td>

                      <td>
                        {orden.tecnico || "Sin asignar"}
                      </td>

                      <td>
                        <span
                          className={`solicitudes-badge estado-${orden.estado?.toLowerCase()}`}
                        >
                          {nombresEstado[orden.estado] ||
                            "Sin estado"}
                        </span>
                      </td>


                      <td>

                        <div className="solicitudes-acciones-fila">
                          {/* Disponible para administradores y técnicos */}
                          <button
                            type="button"
                            className="solicitudes-ver-detalles"
                            onClick={() => setSolicitudSeleccionada(orden)}
                            aria-label={`Ver detalles de la orden ${orden.id}`}
                          >
                            <i className="bi bi-eye"></i>
                            Ver detalles
                          </button>

                          {/* Exclusivo del administrador */}
                          {esAdministrador && (
                            <button
                              type="button"
                              className="solicitudes-editar"
                              onClick={() => abrirEdicion(orden)}
                              aria-label={`Editar orden ${orden.id}`}
                            >
                              <i className="bi bi-pencil-square"></i>
                              Editar
                            </button>
                          )}

                          {/* Disponible para administradores y técnicos */}
                          {(rol === "ADMINISTRADOR" || rol === "TECNICO") && (
                            <button
                              type="button"
                              className="solicitudes-cambiar-estado"
                              onClick={() => setSolicitudCambiarEstado(orden)}
                              aria-label={`Cambiar estado de la orden ${orden.id}`}
                            >
                              <i className="bi bi-arrow-repeat"></i>
                              Cambiar estado
                            </button>
                          )}
                        </div>

                      </td>


                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CONTROLES DE PAGINACIÓN */}

        {!cargando && !error && totalRegistros > 0 && (
          <div className="solicitudes-paginacion">
            <div className="paginacion-informacion">
              <span>
                Mostrando {indiceInicial + 1}–
                {Math.min(indiceFinal, totalRegistros)} de{" "}
                {totalRegistros} solicitudes
              </span>
            </div>

            <div className="paginacion-controles">
              <div className="paginacion-tamano">
                <label htmlFor="registros-pagina">
                  Mostrar
                </label>

                <select
                  id="registros-pagina"
                  value={registrosPorPagina}
                  onChange={(e) => {
                    setRegistrosPorPagina(
                      Number(e.target.value)
                    );
                    setPaginaActual(1);
                  }}
                >
                  <option value={2}>2</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div className="paginacion-navegacion">
                <button
                  type="button"
                  onClick={() =>
                    cambiarPagina(paginaSegura - 1)
                  }
                  disabled={paginaSegura === 1}
                  aria-label="Página anterior"
                  title="Página anterior"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                <span className="paginacion-actual">
                  {paginaSegura} de {totalPaginas}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    cambiarPagina(paginaSegura + 1)
                  }
                  disabled={paginaSegura === totalPaginas}
                  aria-label="Página siguiente"
                  title="Página siguiente"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.section>

      <DetalleSolicitud
        orden={solicitudSeleccionada}
        onClose={() => setSolicitudSeleccionada(null)}
      />

      <AnimatePresence>
        {esAdministrador && mostrarFormulario && (
          <CrearSolicitud
            key={solicitudEditar?.id ?? "nueva"}
            ordenEditar={solicitudEditar}
            onClose={cerrarFormulario}
            onCreada={solicitudCreada}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {solicitudCambiarEstado && (
          <CambiarEstadoSolicitud
            key={solicitudCambiarEstado.id}
            orden={solicitudCambiarEstado}
            onClose={cerrarCambioEstado}
            onActualizada={estadoActualizado}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

export default Solicitudes;
