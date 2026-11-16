
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import usuarioService from "../services/usuarioService";
import "./Usuarios.css";
import Swal from "sweetalert2";
import CrearUsuario from "../components/CrearUsuario";
import DetalleUsuario from "../components/DetalleUsuario";
const USUARIOS_POR_PAGINA = 10;

function Usuarios() {
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [filtroRol, setFiltroRol] = useState("TODOS");
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [paginaActual, setPaginaActual] = useState(1);
    const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
    const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState(null);
    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const datos = await usuarioService.obtenerUsuarios();
                setUsuarios(datos);
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
                toast.error("No se pudieron cargar los usuarios");
            } finally {
                setCargando(false);
            }
        };

        cargarUsuarios();
    }, []);

    const usuariosFiltrados = useMemo(() => {
        return usuarios.filter((usuario) => {
            const texto = busqueda.toLowerCase().trim();

            const coincideBusqueda =
                usuario.nombre?.toLowerCase().includes(texto) ||
                usuario.correo?.toLowerCase().includes(texto);

            const coincideRol =
                filtroRol === "TODOS" || usuario.rol === filtroRol;

            const coincideEstado =
                filtroEstado === "TODOS" ||
                (filtroEstado === "ACTIVOS" && usuario.activo) ||
                (filtroEstado === "INACTIVOS" && !usuario.activo);

            return coincideBusqueda && coincideRol && coincideEstado;
        });
    }, [usuarios, busqueda, filtroRol, filtroEstado]);

    const totalPaginas = Math.max(
        1,
        Math.ceil(usuariosFiltrados.length / USUARIOS_POR_PAGINA)
    );

    const usuariosPaginados = usuariosFiltrados.slice(
        (paginaActual - 1) * USUARIOS_POR_PAGINA,
        paginaActual * USUARIOS_POR_PAGINA
    );

    const actualizarFiltros = (setter, valor) => {
        setter(valor);
        setPaginaActual(1);
    };
    const manejarUsuarioCreado = (nuevoUsuario) => {
        setUsuarios((anteriores) => [nuevoUsuario, ...anteriores]);

        setBusqueda("");
        setFiltroRol("TODOS");
        setFiltroEstado("TODOS");
        setPaginaActual(1);
    };

    const abrirDetalleUsuario = (id) => {
        setUsuarioSeleccionadoId(id);
        setModalDetalleAbierto(true);
    };

    const cerrarDetalleUsuario = () => {
        setModalDetalleAbierto(false);
        setUsuarioSeleccionadoId(null);
    };


    const cambiarRol = async (usuario) => {
        const nuevoRol =
            usuario.rol === "ADMINISTRADOR"
                ? "TECNICO"
                : "ADMINISTRADOR";

        const nuevoRolTexto =
            nuevoRol === "ADMINISTRADOR"
                ? "administrador"
                : "técnico";

        const resultado = await Swal.fire({
            title: "¿Cambiar rol de usuario?",
            html: `
      ¿Estás seguro de que deseas cambiar el rol de
      <strong>${usuario.nombre}</strong>
      a <strong>${nuevoRolTexto}</strong>?
    `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, cambiar rol",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#064789",
            cancelButtonColor: "#6c757d",
            reverseButtons: true,
        });

        if (!resultado.isConfirmed) return;

        try {
            const usuarioActualizado =
                await usuarioService.cambiarRolUsuario(
                    usuario.id,
                    nuevoRol
                );

            setUsuarios((anteriores) =>
                anteriores.map((u) =>
                    u.id === usuario.id ? usuarioActualizado : u
                )
            );

            toast.success("Rol actualizado correctamente");
        } catch (error) {
            console.error("Error al cambiar rol:", error);

            toast.error(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "No se pudo cambiar el rol del usuario"
            );
        }
    };

    const cambiarEstado = async (usuario) => {
        const nuevoEstado = !usuario.activo;
        const accion = nuevoEstado ? "activar" : "desactivar";

        const resultado = await Swal.fire({
            title: `¿${nuevoEstado ? "Activar" : "Desactivar"} usuario?`,
            text: `¿Estás seguro de que deseas ${accion} la cuenta de ${usuario.nombre}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#064789",
            cancelButtonColor: "#6c757d",
            reverseButtons: true,
        });

        if (!resultado.isConfirmed) return;

        try {
            const usuarioActualizado =
                await usuarioService.cambiarEstadoUsuario(
                    usuario.id,
                    nuevoEstado
                );

            setUsuarios((anteriores) =>
                anteriores.map((u) =>
                    u.id === usuario.id ? usuarioActualizado : u
                )
            );

            toast.success(
                nuevoEstado
                    ? "Usuario activado correctamente"
                    : "Usuario desactivado correctamente"
            );
        } catch (error) {
            console.error("Error al cambiar estado:", error);

            toast.error(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "No se pudo cambiar el estado del usuario"
            );
        }
    };



    return (
        <motion.div
            className="usuarios-page"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="usuarios-contenedor">

                <div className="usuarios-encabezado">
                    <div>
                        <h2>Gestión de usuarios</h2>
                        <p>Administra los técnicos y administradores de SGOS.</p>
                    </div>

                    <button
                        type="button"
                        className="usuarios-btn-crear"
                        onClick={() => setModalCrearAbierto(true)}
                    >
                        <i className="bi bi-person-plus"></i>
                        Registrar técnico
                    </button>
                </div>

                <div className="usuarios-filtros">
                    <div className="usuarios-buscador">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            value={busqueda}
                            onChange={(e) =>
                                actualizarFiltros(setBusqueda, e.target.value)
                            }
                        />
                    </div>

                    <select
                        value={filtroRol}
                        onChange={(e) =>
                            actualizarFiltros(setFiltroRol, e.target.value)
                        }
                        aria-label="Filtrar por rol"
                    >
                        <option value="TODOS">Todos los roles</option>
                        <option value="ADMINISTRADOR">Administradores</option>
                        <option value="TECNICO">Técnicos</option>
                    </select>

                    <select
                        value={filtroEstado}
                        onChange={(e) =>
                            actualizarFiltros(setFiltroEstado, e.target.value)
                        }
                        aria-label="Filtrar por estado"
                    >
                        <option value="TODOS">Todos los estados</option>
                        <option value="ACTIVOS">Activos</option>
                        <option value="INACTIVOS">Inactivos</option>
                    </select>
                </div>

                <div className="usuarios-tabla-wrapper">
                    <table className="usuarios-tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Correo electrónico</th>
                                <th>Teléfono</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cargando ? (
                                <tr>
                                    <td colSpan="6" className="usuarios-mensaje">
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : usuariosPaginados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="usuarios-mensaje">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                usuariosPaginados.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td className="usuarios-nombre">
                                            {usuario.nombre}
                                        </td>
                                        <td>{usuario.correo}</td>
                                        <td>{usuario.telefono || "No registrado"}</td>
                                        <td>
                                            <span
                                                className={`usuarios-rol ${usuario.rol === "ADMINISTRADOR"
                                                    ? "usuarios-rol-admin"
                                                    : "usuarios-rol-tecnico"
                                                    }`}
                                            >
                                                {usuario.rol === "ADMINISTRADOR"
                                                    ? "Administrador"
                                                    : "Técnico"}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`usuarios-estado ${usuario.activo
                                                    ? "usuarios-estado-activo"
                                                    : "usuarios-estado-inactivo"
                                                    }`}
                                            >
                                                {usuario.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="usuarios-acciones">

                                                <button
                                                    type="button"
                                                    className="usuarios-btn-detalle"
                                                    title="Ver detalles"
                                                    aria-label={`Ver detalles de ${usuario.nombre}`}
                                                    onClick={() => abrirDetalleUsuario(usuario.id)}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="usuarios-btn-rol"
                                                    title={
                                                        usuario.rol === "TECNICO"
                                                            ? "Convertir en administrador"
                                                            : "Convertir en técnico"
                                                    }
                                                    aria-label={`Cambiar rol de ${usuario.nombre}`}
                                                    onClick={() => cambiarRol(usuario)}
                                                >
                                                    <i className="bi bi-person-gear"></i>
                                                </button>

                                                <button
                                                    type="button"
                                                    className={`usuarios-btn-estado ${usuario.activo
                                                        ? "usuarios-btn-desactivar"
                                                        : "usuarios-btn-activar"
                                                        }`}
                                                    title={
                                                        usuario.activo
                                                            ? "Desactivar usuario"
                                                            : "Activar usuario"
                                                    }
                                                    aria-label={`${usuario.activo ? "Desactivar" : "Activar"
                                                        } a ${usuario.nombre}`}
                                                    onClick={() => cambiarEstado(usuario)}
                                                >
                                                    <i
                                                        className={`bi ${usuario.activo
                                                            ? "bi-person-x"
                                                            : "bi-person-check"
                                                            }`}
                                                    ></i>
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!cargando && (
                    <div className="usuarios-paginacion">
                        <span>
                            Mostrando {usuariosPaginados.length} de{" "}
                            {usuariosFiltrados.length} usuarios
                        </span>

                        <div className="usuarios-paginacion-controles">
                            <button
                                type="button"
                                disabled={paginaActual === 1}
                                onClick={() => setPaginaActual((p) => p - 1)}
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>

                            <span>
                                {paginaActual} de {totalPaginas}
                            </span>

                            <button
                                type="button"
                                disabled={paginaActual === totalPaginas}
                                onClick={() => setPaginaActual((p) => p + 1)}
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CrearUsuario
                abierto={modalCrearAbierto}
                onCerrar={() => setModalCrearAbierto(false)}
                onCreado={manejarUsuarioCreado}
            />

            <DetalleUsuario
                abierto={modalDetalleAbierto}
                usuarioId={usuarioSeleccionadoId}
                onCerrar={cerrarDetalleUsuario}
            />

        </motion.div>
    );
}

export default Usuarios;
