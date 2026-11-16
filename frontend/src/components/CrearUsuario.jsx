
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import usuarioService from "../services/usuarioService";
import "./CrearUsuario.css";

const datosIniciales = {
  nombre: "",
  correo: "",
  contrasena: "",
  telefono: "",
};

function CrearUsuario({ abierto, onCerrar, onCreado }) {
  const [datos, setDatos] = useState(datosIniciales);
  const [guardando, setGuardando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setDatos((anteriores) => ({
      ...anteriores,
      [name]: value,
    }));
  };

  const cerrarModal = () => {
    if (guardando) return;

    setDatos(datosIniciales);
    setMostrarContrasena(false);
    onCerrar();
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    const nombre = datos.nombre.trim();
    const correo = datos.correo.trim();
    const telefono = datos.telefono.trim();

    if (!nombre || !correo || !datos.contrasena.trim()) {
      toast.error("Completa los campos obligatorios");
      return;
    }

    if (datos.contrasena.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setGuardando(true);

    try {
      const nuevoUsuario = await usuarioService.crearTecnico({
        nombre,
        correo,
        contrasena: datos.contrasena,
        telefono,
      });

      toast.success("Técnico registrado correctamente");

      setDatos(datosIniciales);
      setMostrarContrasena(false);

      onCreado(nuevoUsuario);
      onCerrar();
    } catch (error) {
      console.error("Error al registrar técnico:", error);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          "No se pudo registrar el técnico"
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="crear-usuario-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) cerrarModal();
          }}
        >
          <motion.div
            className="crear-usuario-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crear-usuario-titulo"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
          >
            <div className="crear-usuario-header">
              <div>
                <h2 id="crear-usuario-titulo">
                  Registrar técnico
                </h2>
                <p>Ingresa los datos del nuevo usuario.</p>
              </div>

              <button
                type="button"
                className="crear-usuario-cerrar"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={manejarSubmit}>
              <div className="crear-usuario-body">
                <div className="crear-usuario-campo">
                  <label htmlFor="usuario-nombre">
                    Nombre completo *
                  </label>
                  <input
                    id="usuario-nombre"
                    type="text"
                    name="nombre"
                    value={datos.nombre}
                    onChange={manejarCambio}
                    placeholder="Nombre del técnico"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="crear-usuario-campo">
                  <label htmlFor="usuario-correo">
                    Correo electrónico *
                  </label>
                  <input
                    id="usuario-correo"
                    type="email"
                    name="correo"
                    value={datos.correo}
                    onChange={manejarCambio}
                    placeholder="correo@ejemplo.com"
                    maxLength={120}
                    required
                  />
                </div>

                <div className="crear-usuario-campo">
                  <label htmlFor="usuario-telefono">
                    Teléfono
                  </label>
                  <input
                    id="usuario-telefono"
                    type="tel"
                    name="telefono"
                    value={datos.telefono}
                    onChange={manejarCambio}
                    placeholder="Número de contacto"
                    maxLength={20}
                  />
                </div>

                <div className="crear-usuario-campo">
                  <label htmlFor="usuario-contrasena">
                    Contraseña *
                  </label>

                  <div className="crear-usuario-password">
                    <input
                      id="usuario-contrasena"
                      type={mostrarContrasena ? "text" : "password"}
                      name="contrasena"
                      value={datos.contrasena}
                      onChange={manejarCambio}
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarContrasena((anterior) => !anterior)
                      }
                      aria-label={
                        mostrarContrasena
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                    >
                      <i
                        className={`bi ${
                          mostrarContrasena
                            ? "bi-eye-slash"
                            : "bi-eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="crear-usuario-footer">
                <button
                  type="button"
                  className="crear-usuario-cancelar"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="crear-usuario-guardar"
                  disabled={guardando}
                >
                  {guardando ? (
                    "Registrando..."
                  ) : (
                    <>
                      <i className="bi bi-person-plus"></i>
                      Registrar técnico
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CrearUsuario;
