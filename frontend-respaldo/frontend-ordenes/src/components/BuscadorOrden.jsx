/**
 * Barra de búsqueda de órdenes por id.
 * No consulta la API directamente: solo notifica al padre (App)
 * cada vez que el texto cambia, para que él decida cómo filtrar.
 *
 * @param {string} valor - texto actual del input (controlado desde App)
 * @param {(texto: string) => void} onCambiar - callback al escribir
 */
function BuscadorOrden({ valor, onCambiar }) {
  return (
    <div className="mb-4">
      <label htmlFor="buscadorId" className="form-label fw-semibold texto-marino">
        Buscar orden por id
      </label>
      <input
        id="buscadorId"
        type="text"
        className="form-control input-oceano"
        placeholder="Ej: 3 (deja vacío para ver todas las órdenes)"
        value={valor}
        onChange={(evento) => onCambiar(evento.target.value)}
      />
    </div>
  );
}
export default BuscadorOrden;
