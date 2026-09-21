import axios from "axios";

// URL base de la API REST del backend (Spring Boot).
// Cambiar aquí si el backend corre en otro host/puerto.
const BASE_URL = "http://localhost:8080/api/ordenesservicios";

/**
 * Servicio de acceso a datos para el recurso OrdenServicio.
 * Centraliza las llamadas HTTP para que los componentes no
 * necesiten conocer la URL ni la librería usada (axios).
 */
const ordenServicioApi = {
  /**
   * Obtiene todas las órdenes de servicio registradas.
   * @returns {Promise<Array>} lista de órdenes
   */
  getAll: async () => {
    const respuesta = await axios.get(BASE_URL);
    return respuesta.data;
  },

  /**
   * Busca una orden de servicio por su id.
   * @param {number|string} id
   * @returns {Promise<Object>} orden encontrada
   */
  getById: async (id) => {
    const respuesta = await axios.get(`${BASE_URL}/${id}`);
    return respuesta.data;
  },

  /**
   * Crea una nueva orden de servicio.
   * @param {Object} orden objeto con descripcion, fecha, estado, cliente, responsable
   * @returns {Promise<Object>} orden creada (con id asignado)
   */
  create: async (orden) => {
    const respuesta = await axios.post(BASE_URL, orden);
    return respuesta.data;
  },

  /**
   * Actualiza una orden de servicio existente.
   * @param {number|string} id
   * @param {Object} orden datos actualizados
   * @returns {Promise<Object>} orden actualizada
   */
  update: async (id, orden) => {
    const respuesta = await axios.put(`${BASE_URL}/${id}`, orden);
    return respuesta.data;
  },

  /**
   * Elimina una orden de servicio por su id.
   * Requiere que el backend tenga el endpoint DELETE implementado.
   * @param {number|string} id
   */
  remove: async (id) => {
    await axios.delete(`${BASE_URL}/${id}`);
  },
};

export default ordenServicioApi;
