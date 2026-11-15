
import api from "./api";

const ordenService = {
  obtenerOrdenes: async (pagina = 0, tamano = 10) => {
    const response = await api.get("/ordenesservicios", {
      params: {
        page: pagina,
        size: tamano,
      },
    });

    return response.data;
  },

  obtenerMisOrdenes: async () => {
    const response = await api.get(
      "/ordenesservicios/mis-ordenes"
    );

    return response.data;
  },

  obtenerEstados: async () => {
    const response = await api.get("/estados");

    return response.data;
  },
};

export default ordenService;
