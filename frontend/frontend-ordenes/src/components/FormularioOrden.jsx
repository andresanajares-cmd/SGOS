import { useState, useEffect } from "react";

// Valores iniciales de un formulario vacío (modo creación).
const ORDEN_VACIA = {
  descripcion: "",
  fecha: "",
  estado: "Pendiente",
  cliente: "",
  responsable: "",
};

/**
 * Formulario controlado para crear o editar una orden de servicio.
 * Si recibe `ordenSeleccionada`, se precarga en modo edición;
 * si es null, se muestra vacío en modo creación.
 *
 * @param {Object|null} ordenSeleccionada
 * @param {(orden: Object) => void} onGuardar
 * @param {() => void} onCancelar
 */
function FormularioOrden({ ordenSeleccionada, onGuardar, onCancelar }) {
  const [orden, setOrden] = useState(ORDEN_VACIA);

  // Cada vez que cambia la orden seleccionada (por ejemplo, al
  // presionar "Editar" en otra fila), se actualiza el formulario.
  useEffect(() => {
    setOrden(ordenSeleccionada ?? ORDEN_VACIA);
  }, [ordenSeleccionada]);

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setOrden((anterior) => ({ ...anterior, [name]: value }));
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    onGuardar(orden);
    setOrden(ORDEN_VACIA);
  };

  const esEdicion = Boolean(ordenSeleccionada && ordenSeleccionada.id);

  return (
    <form onSubmit={manejarEnvio} className="formulario-orden p-4 mb-4">
      <h2 className="h5 texto-marino fw-semibold mb-3">
        {esEdicion ? `Editar orden #${ordenSeleccionada.id}` : "Nueva orden de servicio"}
      </h2>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Descripción</label>
          <input
            type="text"
            name="descripcion"
            className="form-control input-oceano"
            value={orden.descripcion}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            name="fecha"
            className="form-control input-oceano"
            value={orden.fecha}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Estado</label>
          <select
            name="estado"
            className="form-select input-oceano"
            value={orden.estado}
            onChange={manejarCambio}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Finalizada">Finalizada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Cliente</label>
          <input
            type="text"
            name="cliente"
            className="form-control input-oceano"
            value={orden.cliente}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Responsable</label>
          <input
            type="text"
            name="responsable"
            className="form-control input-oceano"
            value={orden.responsable}
            onChange={manejarCambio}
            required
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button type="button" className="btn btn-limpiar" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-guardar">
          {esEdicion ? "Guardar cambios" : "Crear orden"}
        </button>
      </div>
    </form>
  );
}

export default FormularioOrden;
