import FilaOrden from "./FilaOrden";

/**
 * Tabla que recorre la lista de órdenes ya filtrada y renderiza
 * una FilaOrden por cada registro. Muestra un mensaje si no hay
 * resultados.
 *
 * @param {Array} ordenes - lista ya filtrada (por App)
 * @param {(orden: Object) => void} onEditar
 * @param {(id: number) => void} onEliminar
 */
function TablaOrdenes({ ordenes, onEditar, onEliminar }) {
  if (ordenes.length === 0) {
    return (
      <div className="text-center py-5 estado-vacio">
        <p className="mb-0">No se encontraron órdenes de servicio con ese id.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive tabla-contenedor">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            <th>Id</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Cliente</th>
            <th>Responsable</th>
            <th className="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((orden) => (
            <FilaOrden
              key={orden.id}
              orden={orden}
              onEditar={onEditar}
              onEliminar={onEliminar}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaOrdenes;
