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
    const response = await api.get("/ordenesservicios/mis-ordenes");

    return response.data;
  },

  obtenerEstados: async () => {
    const response = await api.get("/estados");

    return response.data;
  },

  obtenerTodasLasOrdenes: async () => {
    const primeraPagina = await ordenService.obtenerOrdenes(0, 100);

    const ordenes = [...primeraPagina.content];
    const totalPaginas = primeraPagina.totalPages;

    for (let pagina = 1; pagina < totalPaginas; pagina++) {
      const resultado = await ordenService.obtenerOrdenes(pagina, 100);

      ordenes.push(...resultado.content);
    }

    return ordenes;
  },
  crearOrden: async (datos) => {
    const response = await api.post("/ordenesservicios", datos);
    return response.data;
  },
  actualizarOrden: async (id, datos) => {
    const response = await api.put(`/ordenesservicios/${id}`, datos);
    return response.data;
  },
  cambiarEstado: async (id, estadoId) => {
    const response = await api.patch(`/ordenesservicios/${id}/estado`, {
      estadoId,
    });

    return response.data;
  },
};

export default ordenService;
