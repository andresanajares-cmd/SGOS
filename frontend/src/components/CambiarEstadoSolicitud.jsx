
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import ordenService from "../services/ordenService";
import "./CambiarEstadoSolicitud.css";

const nombresEstado = {
  ABIERTA: "Abierta",
  EN_PROCESO: "En proceso",
  CERRADA: "Cerrada",
};
const transicionesPermitidas = {
  ABIERTA: ["EN_PROCESO"],
  EN_PROCESO: ["CERRADA"],
  CERRADA: [],
};

const mostrarEstado = (nombre) =>
  nombresEstado[nombre] ||
  nombre?.replaceAll("_", " ") ||
  "Sin estado";

function CambiarEstadoSolicitud({
  orden,
  onClose,
  onActualizada,
}) {
  const [estados, setEstados] = useState([]);
  const [estadoId, setEstadoId] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);
  const estadosDisponibles = estados.filter((estado) =>
    (transicionesPermitidas[orden.estado] ?? []).includes(estado.nombre)
  );

  const tieneTransiciones = estadosDisponibles.length > 0;
  const reducirMovimiento = useReducedMotion();
  const guardandoRef = useRef(false);
  const cerrarRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    let activo = true;

    const cargarEstados = async () => {
      try {
        const datos = await ordenService.obtenerEstados();

        if (!Array.isArray(datos)) {
          throw new Error("Formato de estados inesperado");
        }

        if (activo) setEstados(datos);
      } catch (error) {
        console.error("Error al cargar estados:", error);

        if (activo) {
          setErrorCarga(true);
          toast.error("No fue posible cargar los estados");
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarEstados();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();

    const manejarTeclado = (evento) => {
      if (evento.key === "Escape" && !guardandoRef.current) {
        onClose();
      }

      if (evento.key === "Tab") {
        const elementos = Array.from(
          modalRef.current?.querySelectorAll(
            'button:not(:disabled), select:not(:disabled)'
          ) || []
        );

        if (!elementos.length) return;

        const primero = elementos[0];
        const ultimo = elementos[elementos.length - 1];

        if (evento.shiftKey && document.activeElement === primero) {
          evento.preventDefault();
          ultimo.focus();
        } else if (
          !evento.shiftKey &&
          document.activeElement === ultimo
        ) {
          evento.preventDefault();
          primero.focus();
        }
      }
    };

    document.addEventListener("keydown", manejarTeclado);

    return () => {
      document.removeEventListener("keydown", manejarTeclado);
      document.body.style.overflow = overflowAnterior;
      elementoAnterior?.focus?.();
    };
  }, [onClose]);

  const guardarEstado = async (evento) => {
    evento.preventDefault();

    if (guardandoRef.current || cargando || errorCarga) return;

    if (!estadoId) {
      toast.warning("Selecciona un estado");
      return;
    }

    if (Number(estadoId) === Number(orden.estadoId)) {
      toast.info("La solicitud ya tiene ese estado");
      return;
    }

    const estadoSeleccionado = estados.find(
      (estado) => estado.id === Number(estadoId)
    );

    if (!estadoSeleccionado) {
      toast.error("El estado seleccionado no es válido");
      return;
    }

    // Solicitar confirmación antes de enviar el PATCH.
    const confirmacion = await Swal.fire({
      title: "¿Confirmar cambio de estado?",
      html: `
        <p>
          ¿Deseas cambiar la orden
          <strong>#${orden.id}</strong>
          al estado
          <strong>${mostrarEstado(estadoSeleccionado.nombre)}</strong>?
        </p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#064789",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmacion.isConfirmed) return;

    try {
      guardandoRef.current = true;
      setGuardando(true);

      await ordenService.cambiarEstado(
        orden.id,
        Number(estadoId)
      );

      toast.success("Estado actualizado correctamente");
      onActualizada();
    } catch (error) {
      console.error("Error al cambiar estado:", error);

      const mensaje =
        error.response?.data?.mensaje ||
        "No fue posible cambiar el estado de la solicitud";

      toast.error(mensaje);
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
  };

  return (
    <motion.div
      className="cambiar-estado-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: reducirMovimiento ? 0 : 0.2,
      }}
      onMouseDown={(evento) => {
        if (
          evento.target === evento.currentTarget &&
          !guardandoRef.current
        ) {
          onClose();
        }
      }}
    >
      <motion.section
        ref={modalRef}
        className="cambiar-estado-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cambiar-estado-titulo"
        initial={
          reducirMovimiento
            ? false
            : { opacity: 0, y: 16, scale: 0.97 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{
          duration: reducirMovimiento ? 0 : 0.25,
        }}
      >
        <div className="cambiar-estado-encabezado">
          <div className="cambiar-estado-titulo-grupo">
            <div className="cambiar-estado-icono">
              <i className="bi bi-arrow-repeat"></i>
            </div>

            <div>
              <h2 id="cambiar-estado-titulo">
                Cambiar estado
              </h2>
              <p>Orden de servicio #{orden.id}</p>
            </div>
          </div>

          <button
            ref={cerrarRef}
            type="button"
            className="cambiar-estado-cerrar"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar formulario"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={guardarEstado}>
          <div className="cambiar-estado-contenido">
            <div className="cambiar-estado-actual">
              <span>Estado actual</span>
              <strong>{mostrarEstado(orden.estado)}</strong>
            </div>

            <label htmlFor="nuevo-estado">
              Nuevo estado
            </label>

            <select
              id="nuevo-estado"
              value={estadoId}
              onChange={(evento) =>
                setEstadoId(evento.target.value)
              }
              disabled={cargando || guardando || errorCarga}
              required
            >
              <option value="">Selecciona un estado</option>

              {estadosDisponibles.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {mostrarEstado(estado.nombre)}
                </option>

              ))}
            </select>

            <p className="cambiar-estado-ayuda">
              {cargando
                ? "Consultando los estados disponibles..."
                : errorCarga
                  ? "No fue posible consultar los estados."
                  : tieneTransiciones
                    ? "Selecciona el siguiente estado de la orden. Una vez confirmado, no podrás regresar al estado anterior."
                    : "Esta orden no tiene cambios de estado disponibles."}
            </p>

            {errorCarga && (
              <p className="cambiar-estado-error">
                No se pudieron cargar los estados disponibles.
              </p>
            )}
          </div>

          <div className="cambiar-estado-pie">
            <button
              type="button"
              className="cambiar-estado-cancelar"
              onClick={onClose}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="cambiar-estado-guardar"
              disabled={cargando ||
                guardando ||
                errorCarga ||
                !tieneTransiciones ||
                !estadoId ||
                Number(estadoId) === Number(orden.estadoId)
              }
            >
              <i className="bi bi-check-lg"></i>
              {guardando ? "Guardando..." : "Cambiar estado"}

            </button>
          </div>
        </form>
      </motion.section>
    </motion.div>
  );
}

export default CambiarEstadoSolicitud;
