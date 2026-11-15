
import api from "./api";

const authService = {
  login: async (correo, contrasena) => {
    const response = await api.post("/usuarios/login", {
      correo,
      contrasena,
    });

    const { token, id, nombre, correo: correoUsuario, rol } =
      response.data;

    if (!token) {
      throw new Error(
        "El servidor no devolvió un token de autenticación"
      );
    }

    const usuario = {
      id,
      nombre,
      correo: correoUsuario,
      rol,
    };

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("usuario", JSON.stringify(usuario));

    return usuario;
  },

  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
  },

  isAuthenticated: () => {
    return Boolean(sessionStorage.getItem("token"));
  },

  getUsuario: () => {
    const usuario = sessionStorage.getItem("usuario");

    if (!usuario) {
      return null;
    }

    try {
      return JSON.parse(usuario);
    } catch {
      return null;
    }
  },

  getToken: () => {
    return sessionStorage.getItem("token");
  },
};

export default authService;
