import Swal from "sweetalert2";

// Instancia de SweetAlert2 preconfigurada con los colores del proyecto
// (paleta Ocean Blue Serenity), para no repetir los estilos en cada uso.
const alertaOceano = Swal.mixin({
  confirmButtonColor: "#064789", // azul marino profundo
  cancelButtonColor: "#6b7280",
  background: "#ffffff",
  color: "#4a5568",
});

/**
 * Renderiza una sola fila de la tabla, con los datos de la orden
 * y los botones de acción (editar / eliminar).
 *
 * @param {Object} orden - datos de la orden de servicio
 * @param {(orden: Object) => void} onEditar
 * @param {(id: number) => void} onEliminar
 */
function FilaOrden({ orden, onEditar, onEliminar }) {
  // Normaliza el estado a una sola palabra en minúsculas para usarlo
  // como clase CSS (ej: "En proceso" -> "en-proceso").
  const claseEstado = (orden.estado || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/\s+/g, "-");

  // Muestra una alerta de confirmación (como la Pantalla 3 del prototipo)
  // antes de eliminar. Solo si el usuario confirma, se ejecuta onEliminar.
  const manejarEliminar = async () => {
    const resultado = await alertaOceano.fire({
      icon: "warning",
      title: "Advertencia",
      html: `¿Estás seguro de que deseas eliminar la Orden de Servicio <b>#${orden.id}</b>? Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (resultado.isConfirmed) {
      onEliminar(orden.id);
    }
  };

  return (
    <tr>
      <td>{orden.id}</td>
      <td>{orden.descripcion}</td>
      <td>{orden.fecha}</td>
      <td>
        <span className={`badge estado-${claseEstado}`}>
          {orden.estado}
        </span>
      </td>
      <td>{orden.cliente}</td>
      <td>{orden.responsable}</td>
      <td className="text-end">
        <button
          type="button"
          className="btn btn-sm btn-editar me-2"
          onClick={() => onEditar(orden)}
        >
          Editar
        </button>
        <button
          type="button"
          className="btn btn-sm btn-eliminar"
          onClick={manejarEliminar}
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}

export default FilaOrden;
