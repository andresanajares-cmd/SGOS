import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ordenServicioApi from "./services/ordenServicioApi";
import BuscadorOrden from "./components/BuscadorOrden";
import TablaOrdenes from "./components/TablaOrdenes";
import FormularioOrden from "./components/FormularioOrden";
import "./App.css";

// Notificación pequeña (toast) en la esquina, que se cierra sola.
// Se usa para confirmar que una acción (crear/editar/eliminar) tuvo éxito.
const notificar = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

function App() {
  // Lista completa de órdenes traída del backend.
  const [ordenes, setOrdenes] = useState([]);
  // Texto escrito en la barra de búsqueda.
  const [busqueda, setBusqueda] = useState("");
  // Orden actualmente en edición (null = formulario en modo creación).
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  // Controla si el formulario está visible.
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial de todas las órdenes al montar el componente.
  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    try {
      setCargando(true);
      const datos = await ordenServicioApi.getAll();
      setOrdenes(datos);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar las órdenes. Verifica que el backend esté activo.");
    } finally {
      setCargando(false);
    }
  };

  // Filtro derivado: si la búsqueda está vacía, se muestran todas;
  // si no, se filtra por coincidencia del id.
  const ordenesFiltradas =
    busqueda.trim() === ""
      ? ordenes
      : ordenes.filter((orden) => String(orden.id).includes(busqueda.trim()));

  const manejarNuevaOrden = () => {
    setOrdenSeleccionada(null);
    setMostrarFormulario(true);
  };

  const manejarEditar = (orden) => {
    setOrdenSeleccionada(orden);
    setMostrarFormulario(true);
  };

  const manejarGuardar = async (orden) => {
    try {
      if (orden.id) {
        await ordenServicioApi.update(orden.id, orden);
        notificar.fire({ icon: "success", title: "Orden actualizada" });
      } else {
        await ordenServicioApi.create(orden);
        notificar.fire({ icon: "success", title: "Orden creada" });
      }
      await cargarOrdenes();
      setMostrarFormulario(false);
      setOrdenSeleccionada(null);
    } catch (err) {
      notificar.fire({ icon: "error", title: "No se pudo guardar la orden" });
    }
  };

  const manejarEliminar = async (id) => {
    try {
      await ordenServicioApi.remove(id);
      await cargarOrdenes();
      notificar.fire({ icon: "success", title: "Orden eliminada" });
    } catch (err) {
      notificar.fire({ icon: "error", title: "No se pudo eliminar la orden" });
    }
  };

  return (
    <div className="pagina-ordenes">
      <header className="encabezado-app">
        <div className="container py-4 d-flex justify-content-between align-items-center">
          <h1 className="h4 mb-0 text-white fw-semibold">
            Sistema de Gestión de Órdenes de Servicio
          </h1>
          <button type="button" className="btn btn-nueva-orden" onClick={manejarNuevaOrden}>
            + Nueva orden
          </button>
        </div>
      </header>

      <main className="container py-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {mostrarFormulario && (
          <FormularioOrden
            ordenSeleccionada={ordenSeleccionada}
            onGuardar={manejarGuardar}
            onCancelar={() => setMostrarFormulario(false)}
          />
        )}

        <BuscadorOrden valor={busqueda} onCambiar={setBusqueda} />

        {cargando ? (
          <p className="texto-marino">Cargando órdenes...</p>
        ) : (
          <TablaOrdenes
            ordenes={ordenesFiltradas}
            onEditar={manejarEditar}
            onEliminar={manejarEliminar}
          />
        )}
      </main>
    </div>
  );
}

export default App;
