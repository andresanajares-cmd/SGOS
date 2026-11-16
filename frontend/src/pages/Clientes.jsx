
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import clienteService from "../services/clienteService";
import CrearCliente from "../components/CrearCliente";
import DetalleCliente from "../components/DetalleCliente";
import EditarCliente from "../components/EditarCliente";
import authService from "../services/authService";
import Swal from "sweetalert2";
import "./Clientes.css";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarCrearCliente, setMostrarCrearCliente] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clienteEditar, setClienteEditar] = useState(null);
  const clientesPorPagina = 10;
  const reducirMovimiento = useReducedMotion();

  const usuario = authService.getUsuario();
  const esAdministrador = usuario?.rol === "ADMINISTRADOR";

  // Cargar clientes desde el backend
  useEffect(() => {
    let activo = true;

    const cargarClientes = async () => {
      try {
        setCargando(true);
        setError(false);

        const datos = await clienteService.obtenerClientes();

        if (!Array.isArray(datos)) {
          throw new Error("Formato de clientes no válido");
        }

        if (activo) {
          setClientes(datos);
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);

        if (activo) {
          setError(true);
          toast.error("No fue posible cargar los clientes");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarClientes();

    return () => {
      activo = false;
    };
  }, []);

  // Filtrar clientes según el término de búsqueda
  const clientesFiltrados = clientes.filter((cliente) => {
    const termino = busqueda.toLocaleLowerCase("es").trim();

    return (
      (cliente.nombre ?? "")
        .toLocaleLowerCase("es")
        .includes(termino) ||
      (cliente.correo ?? "")
        .toLocaleLowerCase("es")
        .includes(termino) ||
      (cliente.telefono ?? "")
        .toLocaleLowerCase("es")
        .includes(termino) ||
      (cliente.direccion ?? "")
        .toLocaleLowerCase("es")
        .includes(termino)
    );
  });

  // Calcular paginación
  const totalPaginas = Math.ceil(
    clientesFiltrados.length / clientesPorPagina
  );

  const clientesPaginados = clientesFiltrados.slice(
    (paginaActual - 1) * clientesPorPagina,
    paginaActual * clientesPorPagina
  );

  // Actualizar búsqueda y reiniciar paginación
  const cambiarBusqueda = (evento) => {
    setBusqueda(evento.target.value);
    setPaginaActual(1);
  };
  const clienteCreado = (nuevoCliente) => {
    setClientes((anteriores) => {
      if (anteriores.some((cliente) => cliente.id === nuevoCliente.id)) {
        return anteriores;
      }

      return [nuevoCliente, ...anteriores];
    });

    setBusqueda("");
    setPaginaActual(1);
    setMostrarCrearCliente(false);
  };

  const clienteActualizado = (clienteModificado) => {
    setClientes((anteriores) =>
      anteriores.map((cliente) =>
        cliente.id === clienteModificado.id
          ? clienteModificado
          : cliente
      )
    );

    setClienteEditar(null);
  };


  const eliminarCliente = async (cliente) => {
    if (!esAdministrador) return;

    const resultado = await Swal.fire({
      title: "¿Eliminar cliente?",
      text: `¿Estás seguro de que deseas eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!resultado.isConfirmed) return;

    Swal.fire({
      title: "Eliminando cliente...",
      text: "Por favor, espera.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await clienteService.eliminarCliente(cliente.id);

      setClientes((anteriores) =>
        anteriores.filter((item) => item.id !== cliente.id)
      );

      setPaginaActual(1);

      await Swal.fire({
        title: "Cliente eliminado",
        text: "El cliente se eliminó correctamente.",
        icon: "success",
        confirmButtonColor: "#064789",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.error("Error al eliminar cliente:", error);

      const mensajeServidor =
        error.response?.data?.message ||
        error.response?.data?.mensaje;

      const mensaje =
        typeof mensajeServidor === "string"
          ? mensajeServidor
          : "No fue posible eliminar el cliente. Verifica si tiene órdenes de servicio asociadas.";

      await Swal.fire({
        title: "No se pudo eliminar",
        text: mensaje,
        icon: "error",
        confirmButtonColor: "#064789",
        confirmButtonText: "Entendido",
      });
    }
  };


  return (
    <motion.div
      className="clientes-page"
      initial={reducirMovimiento ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reducirMovimiento ? 0 : 0.3,
      }}
    >
      <div className="clientes-contenedor">
        {/* Encabezado */}
        <div className="clientes-encabezado">
          <div>
            <h1>Gestión de clientes</h1>
            <p>
              Consulta y administra los clientes registrados en SGOS.
            </p>
          </div>

          <button
            type="button"
            className="clientes-boton-nuevo"
            onClick={() => setMostrarCrearCliente(true)}
          >
            <i className="bi bi-plus-lg"></i>
            Nuevo cliente
          </button>
        </div>

        {/* Contenedor principal */}

        {/* Buscador */}
        <div className="clientes-busqueda">
          <i className="bi bi-search"></i>

          <input
            type="search"
            placeholder="Buscar por nombre, correo, teléfono o dirección..."
            value={busqueda}
            onChange={cambiarBusqueda}
            aria-label="Buscar clientes"
          />
        </div>

        {/* Encabezado de la tabla */}
        <div className="clientes-tabla-encabezado">
          <h2>Clientes registrados</h2>

          <span>
            {clientesFiltrados.length} de {clientes.length} clientes
          </span>
        </div>

        {/* Estados de carga y tabla */}
        {cargando ? (
          <div className="clientes-mensaje">
            Cargando clientes...
          </div>
        ) : error ? (
          <div className="clientes-mensaje">
            No fue posible cargar los clientes.
          </div>
        ) : clientes.length === 0 ? (
          <div className="clientes-mensaje">
            No hay clientes registrados.
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="clientes-mensaje">
            No se encontraron clientes que coincidan con la búsqueda.
          </div>
        ) : (
          <>
            {/* Tabla de clientes */}
            <div className="clientes-tabla-contenedor">
              <table className="clientes-tabla">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Correo electrónico</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {clientesPaginados.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.nombre}</td>
                      <td>{cliente.correo}</td>
                      <td>
                        {cliente.telefono || "No registrado"}
                      </td>
                      <td>
                        {cliente.direccion || "No registrada"}
                      </td>

                      <td>
                        <div className="clientes-acciones">
                          {/* Ver detalles */}
                          <button
                            type="button"
                            title="Ver detalles"
                            aria-label={`Ver detalles de ${cliente.nombre}`}
                            onClick={() => setClienteSeleccionado(cliente)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          {/* Acciones del administrador */}
                          {esAdministrador && (
                            <>
                              <button
                                type="button"
                                title="Editar cliente"
                                aria-label={`Editar cliente ${cliente.nombre}`}
                                onClick={() => setClienteEditar(cliente)}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>

                              <button
                                type="button"
                                title="Eliminar cliente"
                                aria-label={`Eliminar cliente ${cliente.nombre}`}
                                onClick={() => eliminarCliente(cliente)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="clientes-paginacion">
                <span>
                  Página {paginaActual} de {totalPaginas}
                </span>

                <div className="clientes-paginacion-botones">
                  <button
                    type="button"
                    onClick={() =>
                      setPaginaActual((actual) => actual - 1)
                    }
                    disabled={paginaActual === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                    Anterior
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPaginaActual((actual) => actual + 1)
                    }
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {mostrarCrearCliente && (
        <CrearCliente
          onClose={() => setMostrarCrearCliente(false)}
          onClienteCreado={clienteCreado}
        />

      )}
      {clienteSeleccionado && (
        <DetalleCliente
          cliente={clienteSeleccionado}
          onClose={() => setClienteSeleccionado(null)}
        />
      )}
      {esAdministrador && clienteEditar && (
        <EditarCliente
          cliente={clienteEditar}
          onClose={() => setClienteEditar(null)}
          onClienteActualizado={clienteActualizado}
        />
      )}
    </motion.div>
  );
}

export default Clientes;
