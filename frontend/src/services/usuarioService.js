
import api from "./api";

const usuarioService = {
  // Obtener todos los usuarios
  obtenerUsuarios: async () => {
    const response = await api.get("/usuarios");
    return response.data;
  },

  // Obtener un usuario por ID
  obtenerUsuarioPorId: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Registrar un nuevo técnico
  crearTecnico: async (datos) => {
    const response = await api.post("/usuarios", datos);
    return response.data;
  },

  // Activar o desactivar un usuario
  cambiarEstadoUsuario: async (id, activo) => {
    const response = await api.patch(`/usuarios/${id}/estado`, {
      activo,
    });
    return response.data;
  },

  // Cambiar el rol de un usuario
  cambiarRolUsuario: async (id, rol) => {
    const response = await api.patch(`/usuarios/${id}/rol`, {
      rol,
    });
    return response.data;
  },
};

export default usuarioService;
