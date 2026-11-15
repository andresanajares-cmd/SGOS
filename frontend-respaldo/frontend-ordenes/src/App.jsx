import { useState } from "react";
import FormularioUsuario from "./components/FormularioUsuario";
import PaginaOrdenes from "./components/PaginaOrdenes";
import "./App.css";

function App() {
  // false = el usuario aún no inicia sesión
  const [autenticado, setAutenticado] = useState(false);

  // Sin sesión: solo se muestra el login/registro
  if (!autenticado) {
    return <FormularioUsuario onLoginExitoso={() => setAutenticado(true)} />;
  }

  // Con sesión: se muestra el módulo de órdenes
  return <PaginaOrdenes onCerrarSesion={() => setAutenticado(false)} />;
}

export default App;