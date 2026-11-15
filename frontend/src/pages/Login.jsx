
import { useState } from "react";

import { toast } from "sonner";
import authService from "../services/authService";
import "./Login.css";

function Login({ onLoginSuccess }) {
  

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo.trim() || !contrasena) {
      toast.warning("Completa todos los campos");
      return;
    }

    setCargando(true);

    try {
      const usuario = await authService.login(
        correo.trim(),
        contrasena
      );

      toast.success(`Bienvenido, ${usuario.nombre}`);
      onLoginSuccess();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Correo o contraseña incorrectos");
      } else if (error.response?.status === 400) {
        toast.error("Verifica los datos ingresados");
      } else if (!error.response) {
        toast.error("No se pudo conectar con el servidor");
      } else {
        toast.error("No fue posible iniciar sesión");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <section className="login-brand">
          <div className="login-logo">
            <i className="bi bi-layers-half"></i>
          </div>

          <h1>SGOS</h1>
          <p>Sistema Gestor de Órdenes de Servicio</p>

          <div className="login-brand-footer">
            <i className="bi bi-shield-check"></i>
            <span>Gestión segura y centralizada</span>
          </div>
        </section>

        <section className="login-form-section">
          <div className="login-form-header">
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresa tus credenciales para continuar.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="correo">Correo electrónico</label>

              <div className="login-input-wrapper">
                <i className="bi bi-envelope"></i>
                <input
                  id="correo"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="contrasena">Contraseña</label>

              <div className="login-input-wrapper">
                <i className="bi bi-lock"></i>

                <input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() =>
                    setMostrarContrasena(!mostrarContrasena)
                  }
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  <i
                    className={`bi ${mostrarContrasena
                        ? "bi-eye-slash"
                        : "bi-eye"
                      }`}
                  ></i>
                </button>
              </div>
            </div>

            <button
              className="login-submit"
              type="submit"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span className="login-spinner"></span>
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            Acceso exclusivo para personal autorizado
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
