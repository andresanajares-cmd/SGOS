import api from "./api";

const usuarioService = {
  obtenerUsuarios: async () => {
    const response = await api.get("/usuarios");
    return response.data;
  },
};

export default usuarioService;