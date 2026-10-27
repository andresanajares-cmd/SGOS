import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ordenServicioApi from "../services/ordenServicioApi";
import BuscadorOrden from "./BuscadorOrden";
import TablaOrdenes from "./TablaOrdenes";
import FormularioOrden from "./FormularioOrden";

// Notificación pequeña (toast) en la esquina, que se cierra sola.
const notificar = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

/**
 * Página principal del módulo de órdenes de servicio.
 * @param {Function} onCerrarSesion función que se ejecuta al presionar "Cerrar sesión".
 */
function PaginaOrdenes({ onCerrarSesion }) {
  // ...aquí van EXACTAMENTE los mismos estados y funciones que ya tenías
  // (ordenes, busqueda, cargarOrdenes, manejarGuardar, manejarEliminar, etc.)

  return (
    <div className="pagina-ordenes">
      <header className="encabezado-app">
        <div className="container py-4 d-flex justify-content-between align-items-center">
          <h1 className="h4 mb-0 text-white fw-semibold">
            Sistema de Gestión de Órdenes de Servicio
          </h1>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-nueva-orden" onClick={manejarNuevaOrden}>
              + Nueva orden
            </button>
            {/* Botón nuevo para cerrar sesión */}
            <button type="button" className="btn btn-outline-light" onClick={onCerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* ...el <main> igual que lo tenías */}
    </div>
  );
}

export default PaginaOrdenes;