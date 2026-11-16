
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import clienteService from "../services/clienteService";

import "./CrearCliente.css";

const datosIniciales = {
  nombre: "",
  correo: "",
  telefono: "",
  direccion: "",
};

function CrearCliente({ onClose, onClienteCreado }) {
  const [formulario, setFormulario] = useState(datosIniciales);
  const [guardando, setGuardando] = useState(false);

  const reducirMovimiento = useReducedMotion();
  const referenciaModal = useRef(null);
  const referenciaNombre = useRef(null);
  const guardandoRef = useRef(false);

  useEffect(() => {
    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    referenciaNombre.current?.focus();

    const manejarTeclado = (evento) => {
      if (evento.key === "Escape" && !guardandoRef.current) {
        onClose();
      }

      if (evento.key !== "Tab") return;

      const elementos = referenciaModal.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled])'
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
  }, [onClose]);

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const cerrarSeguro = () => {
    if (guardandoRef.current) return;
    onClose();
  };

  const guardarCliente = async (evento) => {
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

    guardandoRef.current = true;
    setGuardando(true);

    try {
      const nuevoCliente = await clienteService.crearCliente(datos);

      toast.success("Cliente registrado correctamente");
      onClienteCreado(nuevoCliente);
    } catch (error) {
      console.error("Error al registrar cliente:", error);

      const mensaje =
        error.response?.data?.message ||
        error.response?.data?.mensaje ||
        "No se pudo registrar el cliente";

      toast.error(
        typeof mensaje === "string"
          ? mensaje
          : "No se pudo registrar el cliente"
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
        aria-labelledby="crear-cliente-titulo"
        initial={
          reducirMovimiento
            ? false
            : { opacity: 0, scale: 0.96, y: 15 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reducirMovimiento ? 0 : 0.25 }}
      >
        <div className="crear-cliente-encabezado">
          <div>
            <h2 id="crear-cliente-titulo">Nuevo cliente</h2>
            <p>Completa los datos para registrar un cliente.</p>
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

        <form onSubmit={guardarCliente}>
          <div className="crear-cliente-campos">
            <div className="crear-cliente-campo">
              <label htmlFor="cliente-nombre">
                Nombre completo <span>*</span>
              </label>
              <input
                ref={referenciaNombre}
                id="cliente-nombre"
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
              <label htmlFor="cliente-correo">
                Correo electrónico <span>*</span>
              </label>
              <input
                id="cliente-correo"
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
              <label htmlFor="cliente-telefono">Teléfono</label>
              <input
                id="cliente-telefono"
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
              <label htmlFor="cliente-direccion">Dirección</label>
              <input
                id="cliente-direccion"
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
                  Guardar cliente
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default CrearCliente;
