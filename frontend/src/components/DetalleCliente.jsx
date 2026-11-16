
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

import "./DetalleCliente.css";

function DetalleCliente({ cliente, onClose }) {
  const reducirMovimiento = useReducedMotion();
  const referenciaModal = useRef(null);
  const referenciaCerrar = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    referenciaCerrar.current?.focus();

    const manejarTeclado = (evento) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        onCloseRef.current();
        return;
      }

      if (evento.key !== "Tab") return;

      const elementos = referenciaModal.current?.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled])'
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

  if (!cliente) return null;

  return (
    <motion.div
      className="detalle-cliente-overlay"
      initial={reducirMovimiento ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        ref={referenciaModal}
        className="detalle-cliente-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-cliente-titulo"
        initial={
          reducirMovimiento
            ? false
            : { opacity: 0, scale: 0.96, y: 15 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{
          duration: reducirMovimiento ? 0 : 0.25,
        }}
      >
        <div className="detalle-cliente-encabezado">
          <div>
            <h2 id="detalle-cliente-titulo">
              Detalles del cliente
            </h2>
            <p>
              Información del cliente registrado en SGOS.
            </p>
          </div>

          <button
            ref={referenciaCerrar}
            type="button"
            className="detalle-cliente-cerrar"
            onClick={onClose}
            aria-label="Cerrar detalles"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="detalle-cliente-contenido">
          <div className="detalle-cliente-campo">
            <span className="detalle-cliente-etiqueta">
              <i className="bi bi-hash"></i>
              Identificador
            </span>
            <p>{cliente.id}</p>
          </div>

          <div className="detalle-cliente-campo">
            <span className="detalle-cliente-etiqueta">
              <i className="bi bi-person"></i>
              Nombre
            </span>
            <p>{cliente.nombre}</p>
          </div>

          <div className="detalle-cliente-campo">
            <span className="detalle-cliente-etiqueta">
              <i className="bi bi-envelope"></i>
              Correo electrónico
            </span>
            <p>{cliente.correo}</p>
          </div>

          <div className="detalle-cliente-campo">
            <span className="detalle-cliente-etiqueta">
              <i className="bi bi-telephone"></i>
              Teléfono
            </span>
            <p>{cliente.telefono || "No registrado"}</p>
          </div>

          <div className="detalle-cliente-campo detalle-cliente-ancho">
            <span className="detalle-cliente-etiqueta">
              <i className="bi bi-geo-alt"></i>
              Dirección
            </span>
            <p>{cliente.direccion || "No registrada"}</p>
          </div>
        </div>

        <div className="detalle-cliente-pie">
          <button
            type="button"
            onClick={onClose}
            className="detalle-cliente-boton-cerrar"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default DetalleCliente;
