import { useState } from "react";
import Swal from "sweetalert2";
import usuarioApi from "../services/usuarioApi";

/**
 * Formulario de inicio de sesión y registro de usuarios.
 * @param {Function} onLoginExitoso función que se ejecuta cuando el login es correcto.
 */
function FormularioUsuario({ onLoginExitoso }) {
  // Campos del formulario (los nombres coinciden con la entidad Usuarios del backend)
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");

  // true = muestra "Registrarse", false = muestra "Iniciar sesión"
  const [modoRegistro, setModoRegistro] = useState(false);

  // Extrae un texto seguro del error de axios
  const obtenerMensajeError = (error) => {
    // Sin error.response: el servidor está apagado o no hay conexión
    if (!error.response) {
      return "No se pudo conectar con el servidor";
    }
    // Tu 401 responde un String; otros errores (500) responden un objeto JSON
    const datos = error.response.data;
    return typeof datos === "string" ? datos : "Ocurrió un error inesperado";
  };

  const manejarSubmit = async (e) => {
    e.preventDefault(); // evita que la página se recargue

    try {
      if (modoRegistro) {
        await usuarioApi.create({ nombre, contrasena });
        await Swal.fire({
          icon: "success",
          title: "Registro exitoso",
          text: "Usuario registrado correctamente. Ya puedes iniciar sesión.",
        });
        setModoRegistro(false); // vuelve al modo login
        setContrasena("");
      } else {
        const respuesta = await usuarioApi.login({ nombre, contrasena });
        await Swal.fire({
          icon: "success",
          title: respuesta, // "Autenticación satisfactoria"
          timer: 1500,
          showConfirmButton: false,
        });
        onLoginExitoso(); // avisa al componente padre (App)
      }
    } catch (error) {
      // Cualquier error HTTP (401, 500...) o de red cae aquí
      Swal.fire({
        icon: "error",
        title: "Error",
        text: obtenerMensajeError(error),
      });
    }
  };

  return (
    <form onSubmit={manejarSubmit}>
      <h2>{modoRegistro ? "Registrarse" : "Iniciar sesión"}</h2>

      <input
        placeholder="Usuario"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        required
      />

      <button type="submit">
        {modoRegistro ? "Registrarme" : "Ingresar"}
      </button>

      {/* Alterna entre login y registro */}
      <button type="button" onClick={() => setModoRegistro(!modoRegistro)}>
        {modoRegistro ? "Ya tengo cuenta" : "Crear cuenta nueva"}
      </button>
    </form>
  );
}

export default FormularioUsuario;