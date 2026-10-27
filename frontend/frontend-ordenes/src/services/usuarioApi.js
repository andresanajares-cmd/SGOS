import axios from "axios";

// URL base de la API REST del backend (Spring Boot).
// Cambiar aquí si el backend corre en otro host/puerto.
const BASE_URL = "http://localhost:8080/api/usuarios";

const usuarioApi = {

  /**
   * Registra un nuevo usuario.
   * @param {Object} usuario objeto con nombre y contrasena.
   * @returns {Promise<Object>} usuario creado (con id asignado)
   */
  create: async (usuario) => {
    const respuesta = await axios.post(`${BASE_URL}/registro`, usuario);
    return respuesta.data;
  },

  /**
   * Inicia sesión con las credenciales del usuario.
   * @param {Object} usuario objeto con nombre y contrasena.
   * @returns {Promise<string>} mensaje de autenticación del backend.
   * @throws error de axios (status 401) si las credenciales son incorrectas.
   */
  login: async (usuario) => {
    const respuesta = await axios.post(`${BASE_URL}/login`, usuario);
    return respuesta.data;
  }

};

export default usuarioApi;