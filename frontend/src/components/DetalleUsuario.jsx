
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import usuarioService from "../services/usuarioService";
import "./DetalleUsuario.css";

function DetalleUsuario({ abierto, usuarioId, onCerrar }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!abierto || usuarioId == null) return;

    let vigente = true;

    const cargarDetalle = async () => {
      setUsuario(null);
      setCargando(true);

      try {
        const datos = await usuarioService.obtenerUsuarioPorId(
          usuarioId
        );

        if (vigente) {
          setUsuario(datos);
        }
      } catch (error) {
        console.error("Error al consultar usuario:", error);

        if (vigente) {
          toast.error("No se pudo consultar el usuario");
        }
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    };

    cargarDetalle();

    return () => {
      vigente = false;
    };
  }, [abierto, usuarioId]);

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="detalle-usuario-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              onCerrar();
            }
          }}
        >
          <motion.div
            className="detalle-usuario-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detalle-usuario-titulo"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
          >
            <div className="detalle-usuario-header">
              <div>
                <h2 id="detalle-usuario-titulo">
                  Detalles del usuario
                </h2>
                <p>Información del usuario registrado en SGOS.</p>
              </div>

              <button
                type="button"
                className="detalle-usuario-cerrar"
                onClick={onCerrar}
                aria-label="Cerrar detalles"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="detalle-usuario-body">
              {cargando ? (
                <p className="detalle-usuario-mensaje">
                  Cargando información...
                </p>
              ) : !usuario ? (
                <p className="detalle-usuario-mensaje">
                  No se pudo mostrar la información del usuario.
                </p>
              ) : (
                <>
                  <div className="detalle-usuario-perfil">
                    <div className="detalle-usuario-avatar">
                      <i className="bi bi-person"></i>
                    </div>

                    <div>
                      <h3>{usuario.nombre}</h3>
                      <p>{usuario.correo}</p>
                    </div>
                  </div>

                  <div className="detalle-usuario-grid">
                    <div className="detalle-usuario-campo">
                      <span>Identificador</span>
                      <strong>#{usuario.id}</strong>
                    </div>

                    <div className="detalle-usuario-campo">
                      <span>Teléfono</span>
                      <strong>
                        {usuario.telefono || "No registrado"}
                      </strong>
                    </div>

                    <div className="detalle-usuario-campo">
                      <span>Rol</span>
                      <strong>
                        {usuario.rol === "ADMINISTRADOR"
                          ? "Administrador"
                          : "Técnico"}
                      </strong>
                    </div>

                    <div className="detalle-usuario-campo">
                      <span>Estado</span>
                      <span
                        className={`detalle-usuario-estado ${
                          usuario.activo
                            ? "detalle-usuario-activo"
                            : "detalle-usuario-inactivo"
                        }`}
                      >
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="detalle-usuario-footer">
              <button type="button" onClick={onCerrar}>
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DetalleUsuario;
