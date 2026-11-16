
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import clienteService from "../services/clienteService";
import "./CrearCliente.css";

function EditarCliente({ cliente, onClose, onClienteActualizado }) {
  const [formulario, setFormulario] = useState({
    nombre: cliente.nombre ?? "",
    correo: cliente.correo ?? "",
    telefono: cliente.telefono ?? "",
    direccion: cliente.direccion ?? "",
  });

  const [guardando, setGuardando] = useState(false);

  const reducirMovimiento = useReducedMotion();
  const referenciaModal = useRef(null);
  const referenciaNombre = useRef(null);
  const guardandoRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    referenciaNombre.current?.focus();

    const manejarTeclado = (evento) => {
      if (evento.key === "Escape" && !guardandoRef.current) {
        onCloseRef.current();
        return;
      }

      if (evento.key !== "Tab") return;

      const elementos = referenciaModal.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled])'
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
    };

    document.addEventListener("keydown", manejarTeclado);

    return () => {
      document.removeEventListener("keydown", manejarTeclado);
      document.body.style.overflow = overflowAnterior;
      elementoAnterior?.focus?.();
    };
  }, []);

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const cerrarSeguro = () => {
    if (guardandoRef.current) return;
    onCloseRef.current();
  };

  const guardarCambios = async (evento) => {
    evento.preventDefault();

    if (guardandoRef.current) return;

    const datos = {
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      telefono: formulario.telefono.trim(),
      direccion: formulario.direccion.trim(),
    };

    if (!datos.nombre || !datos.correo) {
      toast.warning("El nombre y el correo son obligatorios");
      return;
    }

    if (
      datos.nombre.length > 120 ||
      datos.correo.length > 120 ||
      datos.telefono.length > 20 ||
      datos.direccion.length > 200
    ) {
      toast.warning("Uno de los campos supera la longitud permitida");
      return;
    }

    const datosOriginales = {
      nombre: (cliente.nombre ?? "").trim(),
      correo: (cliente.correo ?? "").trim().toLowerCase(),
      telefono: (cliente.telefono ?? "").trim(),
      direccion: (cliente.direccion ?? "").trim(),
    };

    const hayCambios = Object.keys(datos).some(
      (campo) => datos[campo] !== datosOriginales[campo]
    );

    if (!hayCambios) {
      toast.info("No se realizaron cambios");
      cerrarSeguro();
      return;
    }

    guardandoRef.current = true;
    setGuardando(true);

    try {
      const clienteActualizado =
        await clienteService.actualizarCliente(cliente.id, datos);

      toast.success("Cliente actualizado correctamente");

      onClienteActualizado(clienteActualizado);
    } catch (error) {
      console.error("Error al actualizar cliente:", error);

      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.mensaje ||
        "No se pudo actualizar el cliente";

      toast.error(
        typeof mensaje === "string"
          ? mensaje
          : "No se pudo actualizar el cliente"
      );
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
  };

  return (
    <motion.div
      className="crear-cliente-overlay"
      initial={reducirMovimiento ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          cerrarSeguro();
        }
      }}
    >
      <motion.div
        ref={referenciaModal}
        className="crear-cliente-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-cliente-titulo"
        initial={
          reducirMovimiento
            ? false
            : { opacity: 0, scale: 0.96, y: 15 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: reducirMovimiento ? 0 : 0.25,
        }}
      >
        <div className="crear-cliente-encabezado">
          <div>
            <h2 id="editar-cliente-titulo">
              Editar cliente
            </h2>
            <p>
              Modifica la información del cliente seleccionado.
            </p>
          </div>

          <button
            type="button"
            className="crear-cliente-cerrar"
            onClick={cerrarSeguro}
            disabled={guardando}
            aria-label="Cerrar formulario"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <form onSubmit={guardarCambios}>
          <div className="crear-cliente-campos">
            <div className="crear-cliente-campo">
              <label htmlFor="editar-cliente-nombre">
                Nombre completo <span>*</span>
              </label>

              <input
                ref={referenciaNombre}
                id="editar-cliente-nombre"
                name="nombre"
                type="text"
                value={formulario.nombre}
                onChange={actualizarCampo}
                maxLength={120}
                required
                disabled={guardando}
                placeholder="Nombre del cliente"
              />
            </div>

            <div className="crear-cliente-campo">
              <label htmlFor="editar-cliente-correo">
                Correo electrónico <span>*</span>
              </label>

              <input
                id="editar-cliente-correo"
                name="correo"
                type="email"
                value={formulario.correo}
                onChange={actualizarCampo}
                maxLength={120}
                required
                disabled={guardando}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="crear-cliente-campo">
              <label htmlFor="editar-cliente-telefono">
                Teléfono
              </label>

              <input
                id="editar-cliente-telefono"
                name="telefono"
                type="tel"
                value={formulario.telefono}
                onChange={actualizarCampo}
                maxLength={20}
                disabled={guardando}
                placeholder="Número de contacto"
              />
            </div>

            <div className="crear-cliente-campo">
              <label htmlFor="editar-cliente-direccion">
                Dirección
              </label>

              <input
                id="editar-cliente-direccion"
                name="direccion"
                type="text"
                value={formulario.direccion}
                onChange={actualizarCampo}
                maxLength={200}
                disabled={guardando}
                placeholder="Dirección del cliente"
              />
            </div>
          </div>

          <div className="crear-cliente-pie">
            <button
              type="button"
              className="crear-cliente-cancelar"
              onClick={cerrarSeguro}
              disabled={guardando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="crear-cliente-guardar"
              disabled={guardando}
            >
              {guardando ? (
                <>
                  <i className="bi bi-arrow-repeat"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default EditarCliente;
