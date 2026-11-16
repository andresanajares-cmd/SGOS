import api from "./api";

const clienteService = {
  obtenerClientes: async () => {
    const response = await api.get("/clientes");
    return response.data;
  },

  obtenerClientePorId: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  crearCliente: async (datos) => {
    const response = await api.post("/clientes", datos);
    return response.data;
  },

  actualizarCliente: async (id, datos) => {
    const response = await api.put(`/clientes/${id}`, datos);
    return response.data;
  },

  eliminarCliente: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },
};

export default clienteService;