
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./DetalleSolicitud.css";

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

  useEffect(() => {
    if (!orden) return;

    elementoAnterior.current = document.activeElement;

    const manejarTeclado = (evento) => {
      if (evento.key === "Escape") {
        onClose();
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
  }, [orden, onClose]);

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
            if (e.target === e.currentTarget) onClose();
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
                onClick={onClose}
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
            </div>

            <div className="detalle-pie">
              <button
                type="button"
                className="detalle-boton-cerrar"
                onClick={onClose}
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
    