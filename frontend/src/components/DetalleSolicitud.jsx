
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./DetalleSolicitud.css";
import ordenService from "../services/ordenService";
import { toast } from "sonner";
const nombresEstado = {
  ABIERTA: "Abierta",
  EN_PROCESO: "En proceso",
  CERRADA: "Cerrada",
};

function DetalleSolicitud({ orden, onClose }) {
  const reducirMovimiento = useReducedMotion();
  const referenciaModal = useRef(null);
  const referenciaCerrar = useRef(null);
  const elementoAnterior = useRef(null);
  const [seguimientos, setSeguimientos] = useState([]);
  const [cargandoSeguimientos, setCargandoSeguimientos] = useState(false);
  const [errorSeguimientos, setErrorSeguimientos] = useState(false);
  const [comentario, setComentario] = useState("");
  const [guardandoSeguimiento, setGuardandoSeguimiento] = useState(false);
  useEffect(() => {
    setComentario("");
  }, [orden?.id]);
  useEffect(() => {
    if (!orden) return;

    elementoAnterior.current = document.activeElement;

    const manejarTeclado = (evento) => {
      if (evento.key === "Escape") {
        if (!guardandoSeguimiento) {
          onClose();
        }
      }

      if (evento.key === "Tab") {
        const elementos = referenciaModal.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!elementos?.length) return;

        const primero = elementos[0];
        const ultimo = elementos[elementos.length - 1];

        if (evento.shiftKey && document.activeElement === primero) {
          evento.preventDefault();
          ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault();
          primero.focus();
        }
      }
    };

    document.addEventListener("keydown", manejarTeclado);
    referenciaCerrar.current?.focus();

    const desbordamientoAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", manejarTeclado);
      document.body.style.overflow = desbordamientoAnterior;
      elementoAnterior.current?.focus?.();
    };
  }, [orden, onClose, guardandoSeguimiento]);
  useEffect(() => {
    if (!orden?.id) {
      return;
    }

    let activo = true;

    const cargarSeguimientos = async () => {
      setCargandoSeguimientos(true);
      setErrorSeguimientos(false);
      setSeguimientos([]);

      try {
        const datos = await ordenService.obtenerSeguimientos(orden.id);

        if (!Array.isArray(datos)) {
          throw new Error("Formato de seguimientos no válido");
        }

        const ordenados = [...datos].sort(
          (a, b) =>
            new Date(b.fechaRegistro).getTime() -
            new Date(a.fechaRegistro).getTime()
        );

        if (activo) {
          setSeguimientos(ordenados);
        }
      } catch (error) {
        console.error("Error al cargar seguimientos:", error);

        if (activo) {
          setErrorSeguimientos(true);
        }
      } finally {
        if (activo) {
          setCargandoSeguimientos(false);
        }
      }
    };

    cargarSeguimientos();

    return () => {
      activo = false;
    };
  }, [orden?.id]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaValida = new Date(`${fecha}T00:00:00Z`);

    if (Number.isNaN(fechaValida.getTime())) {
      return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(fechaValida);
  };
  const formatearFechaHora = (fecha) => {
    if (!fecha) return "Fecha no disponible";

    const fechaValida = new Date(fecha);

    if (Number.isNaN(fechaValida.getTime())) {
      return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(fechaValida);
  };
  const esCambioEstado = (comentario) => {
    return comentario?.startsWith("Cambio de estado:") ?? false;
  };
  const cerrarModalSeguro = () => {
    if (guardandoSeguimiento) return;

    onClose();
  };
  const guardarSeguimiento = async (evento) => {
    evento.preventDefault();

    const comentarioLimpio = comentario.trim();

    if (!comentarioLimpio) {
      toast.warning("Escribe un comentario antes de guardar");
      return;
    }

    if (comentarioLimpio.length > 1000) {
      toast.warning("El comentario no puede superar los 1000 caracteres");
      return;
    }

    if (!orden?.id || guardandoSeguimiento) return;

    const ordenId = orden.id;

    setGuardandoSeguimiento(true);

    try {
      // Registrar el seguimiento
      const nuevoSeguimiento = await ordenService.crearSeguimiento(
        ordenId,
        comentarioLimpio
      );

      // Agregar el registro al historial sin hacer otra petición
      setSeguimientos((anteriores) => {
        if (anteriores.some((item) => item.id === nuevoSeguimiento.id)) {
          return anteriores;
        }

        return [nuevoSeguimiento, ...anteriores];
      });

      setComentario("");
      setErrorSeguimientos(false);

      toast.success("Seguimiento registrado correctamente");
    } catch (error) {
      console.error("Error al registrar seguimiento:", error);

      toast.error(
        "No se pudo confirmar el registro. Consulta el historial antes de volver a intentarlo."
      );
    } finally {
      setGuardandoSeguimiento(false);
    }
  };
  return (
    <AnimatePresence>
      {orden && (
        <motion.div
          className="detalle-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducirMovimiento ? 0 : 0.2 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              cerrarModalSeguro();
            }
          }}
        >
          <motion.div
            ref={referenciaModal}
            className="detalle-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-titulo"
            tabIndex={-1}
            initial={
              reducirMovimiento
                ? false
                : { opacity: 0, scale: 0.96, y: 20 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reducirMovimiento
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 12 }
            }
            transition={{
              duration: reducirMovimiento ? 0 : 0.25,
              ease: "easeOut",
            }}
          >
            <div className="detalle-encabezado">
              <div className="detalle-encabezado-info">
                <div className="detalle-icono">
                  <i className="bi bi-clipboard2-check"></i>
                </div>

                <div>
                  <h2 id="detalle-titulo">
                    Detalles de la solicitud
                  </h2>
                  <p>Orden de servicio #{orden.id}</p>
                </div>
              </div>

              <button
                ref={referenciaCerrar}
                type="button"
                className="detalle-cerrar"
                onClick={cerrarModalSeguro}
                disabled={guardandoSeguimiento}
                aria-label="Cerrar detalles"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="detalle-contenido">
              <div className="detalle-estado-fila">
                <span className="detalle-etiqueta">Estado actual</span>

                <span
                  className={`solicitudes-badge estado-${orden.estado?.toLowerCase()}`}
                >
                  {nombresEstado[orden.estado] || "Sin estado"}
                </span>
              </div>

              <div className="detalle-descripcion">
                <span className="detalle-etiqueta">
                  Descripción del servicio
                </span>
                <p>{orden.descripcion || "Sin descripción"}</p>
              </div>

              <div className="detalle-grid">
                <div className="detalle-campo">
                  <div className="detalle-campo-icono">
                    <i className="bi bi-building"></i>
                  </div>

                  <div>
                    <span className="detalle-etiqueta">Cliente</span>
                    <p>{orden.cliente || "Sin cliente"}</p>
                  </div>
                </div>

                <div className="detalle-campo">
                  <div className="detalle-campo-icono">
                    <i className="bi bi-person-gear"></i>
                  </div>

                  <div>
                    <span className="detalle-etiqueta">
                      Técnico asignado
                    </span>
                    <p>{orden.tecnico || "Sin asignar"}</p>
                  </div>
                </div>

                <div className="detalle-campo">
                  <div className="detalle-campo-icono">
                    <i className="bi bi-calendar3"></i>
                  </div>

                  <div>
                    <span className="detalle-etiqueta">Fecha</span>
                    <p>{formatearFecha(orden.fecha)}</p>
                  </div>
                </div>

                <div className="detalle-campo">
                  <div className="detalle-campo-icono">
                    <i className="bi bi-hash"></i>
                  </div>

                  <div>
                    <span className="detalle-etiqueta">
                      Número de orden
                    </span>
                    <p>#{orden.id}</p>
                  </div>
                </div>
              </div>
              <div className="detalle-seguimiento-formulario">
                <div className="detalle-seguimiento-encabezado">
                  <i className="bi bi-chat-left-text"></i>
                  <h3>Agregar seguimiento</h3>
                </div>

                <form onSubmit={guardarSeguimiento}>
                  <label
                    htmlFor="detalle-comentario"
                    className="detalle-etiqueta"
                  >
                    Comentario u observación
                  </label>

                  <textarea
                    id="detalle-comentario"
                    className="detalle-seguimiento-textarea"
                    placeholder="Describe las actividades realizadas, observaciones o novedades de la orden..."
                    value={comentario}
                    onChange={(evento) => setComentario(evento.target.value)}
                    maxLength={1000}
                    rows={4}
                    disabled={guardandoSeguimiento}
                    required
                  />

                  <div className="detalle-seguimiento-acciones">
                    <span className="detalle-seguimiento-contador">
                      {comentario.length}/1000 caracteres
                    </span>

                    <button
                      type="submit"
                      className="detalle-seguimiento-guardar"
                      disabled={guardandoSeguimiento || !comentario.trim()}
                    >
                      {guardandoSeguimiento ? (
                        <>
                          <i className="bi bi-arrow-repeat"></i>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send"></i>
                          Guardar seguimiento
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              <div className="detalle-historial">
                <div className="detalle-historial-encabezado">
                  <i className="bi bi-clock-history"></i>
                  <h3>Historial de seguimiento</h3>
                </div>

                {cargandoSeguimientos ? (
                  <div className="detalle-historial-mensaje">
                    <i className="bi bi-arrow-repeat"></i>
                    <p>Cargando historial de seguimiento...</p>
                  </div>
                ) : errorSeguimientos ? (
                  <div className="detalle-historial-mensaje">
                    <i className="bi bi-exclamation-circle"></i>
                    <p>No fue posible cargar el historial de seguimiento.</p>
                  </div>
                ) : seguimientos.length === 0 ? (
                  <div className="detalle-historial-mensaje">
                    <i className="bi bi-inbox"></i>
                    <p>Esta orden todavía no tiene seguimientos registrados.</p>
                  </div>
                ) : (
                  <div className="detalle-historial-lista">
                    {seguimientos.map((seguimiento) => (
                      <div
                        key={seguimiento.id}
                        className="detalle-historial-item"
                      >
                        <div
                          className={`detalle-historial-indicador ${esCambioEstado(seguimiento.comentario)
                              ? "detalle-historial-estado"
                              : "detalle-historial-comentario-icono"
                            }`}
                        >
                          <i
                            className={
                              esCambioEstado(seguimiento.comentario)
                                ? "bi bi-arrow-repeat"
                                : "bi bi-chat-left-text"
                            }
                          ></i>
                        </div>

                        <div className="detalle-historial-informacion">
                          <p className="detalle-historial-comentario">
                            {seguimiento.comentario || "Sin comentario"}
                          </p>

                          <div className="detalle-historial-metadatos">
                            <span>
                              <i className="bi bi-person"></i>
                              {seguimiento.usuarioNombre || "Usuario desconocido"}
                            </span>

                            <span>
                              <i className="bi bi-calendar3"></i>
                              {formatearFechaHora(seguimiento.fechaRegistro)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="detalle-pie">
              <button
                type="button"
                className="detalle-boton-cerrar"
                onClick={cerrarModalSeguro}
                disabled={guardandoSeguimiento}
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DetalleSolicitud;
