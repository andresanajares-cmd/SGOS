
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import ordenService from "../services/ordenService";
import clienteService from "../services/clienteService";
import usuarioService from "../services/usuarioService";
import "./CrearSolicitud.css";

const obtenerFechaActual = () => {
    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
};

const formularioInicial = {
    descripcion: "",
    fecha: obtenerFechaActual(),
    estadoId: "",
    clienteId: "",
    tecnicoId: "",
};

function CrearSolicitud({
    ordenEditar = null,
    onClose,
    onCreada,
}) {
    const esEdicion = ordenEditar !== null;
    const [formulario, setFormulario] = useState(() =>
        ordenEditar
            ? {
                descripcion: ordenEditar.descripcion ?? "",
                fecha: ordenEditar.fecha ?? "",
                estadoId: String(ordenEditar.estadoId ?? ""),
                clienteId: String(ordenEditar.clienteId ?? ""),
                tecnicoId: String(ordenEditar.tecnicoId ?? ""),
            }
            : { ...formularioInicial }
    );
    const [clientes, setClientes] = useState([]);
    const [estados, setEstados] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [errorCarga, setErrorCarga] = useState(false);

    const reducirMovimiento = useReducedMotion();
    const modalRef = useRef(null);
    const cerrarRef = useRef(null);
    const guardandoRef = useRef(false);

    useEffect(() => {
        let activo = true;

        const cargarDatos = async () => {
            try {
                const [listaClientes, listaEstados, listaUsuarios] =
                    await Promise.all([
                        clienteService.obtenerClientes(),
                        ordenService.obtenerEstados(),
                        usuarioService.obtenerUsuarios(),
                    ]);

                if (!activo) return;

                if (
                    !Array.isArray(listaClientes) ||
                    !Array.isArray(listaEstados) ||
                    !Array.isArray(listaUsuarios)
                ) {
                    throw new Error("Formato de respuesta inesperado");
                }

                setClientes(listaClientes);
                setEstados(listaEstados);



                if (!ordenEditar) {
                    const estadoAbierta = listaEstados.find(
                        (estado) => estado.nombre === "ABIERTA"
                    );

                    if (estadoAbierta) {
                        setFormulario((anterior) => ({
                            ...anterior,
                            estadoId: String(estadoAbierta.id),
                        }));
                    }

                }

                setTecnicos(
                    listaUsuarios.filter(
                        (usuario) =>
                            usuario.rol === "TECNICO" && usuario.activo === true
                    )
                );
            } catch (error) {
                console.error("Error al cargar el formulario:", error);
                if (activo) {
                    setErrorCarga(true);
                    toast.error("No fue posible cargar los datos del formulario");
                }
            } finally {
                if (activo) setCargando(false);
            }
        };

        cargarDatos();

        return () => {
            activo = false;
        };
    }, []);

    useEffect(() => {
        const anterior = document.activeElement;
        const overflowAnterior = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        cerrarRef.current?.focus();

        const manejarTeclado = (evento) => {
            if (evento.key === "Escape" && !guardandoRef.current) {
                onClose();
            }

            if (evento.key === "Tab") {
                const elementos = Array.from(
                    modalRef.current?.querySelectorAll(
                        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
                    ) || []
                );

                if (!elementos.length) return;

                const primero = elementos[0];
                const ultimo = elementos[elementos.length - 1];

                if (evento.shiftKey && document.activeElement === primero) {
                    evento.preventDefault();
                    ultimo.focus();
                } else if (
                    !evento.shiftKey &&
                    document.activeElement === ultimo
                ) {
                    evento.preventDefault();
                    primero.focus();
                }
            }
        };

        document.addEventListener("keydown", manejarTeclado);

        return () => {
            document.removeEventListener("keydown", manejarTeclado);
            document.body.style.overflow = overflowAnterior;
            anterior?.focus?.();
        };
    }, [onClose]);

    const actualizarCampo = (evento) => {
        const { name, value } = evento.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    };

    const guardarSolicitud = async (evento) => {
        evento.preventDefault();

        if (guardandoRef.current || cargando || errorCarga) return;

        const descripcion = formulario.descripcion.trim();

        if (!descripcion || descripcion.length > 255) {
            toast.error("La descripción debe tener entre 1 y 255 caracteres");
            return;
        }

        if (
            !formulario.fecha ||
            !formulario.estadoId ||
            !formulario.clienteId
        ) {
            toast.error("Completa todos los campos obligatorios");
            return;
        }

        const datos = {
            descripcion,
            fecha: formulario.fecha,
            estadoId: Number(formulario.estadoId),
            clienteId: Number(formulario.clienteId),
            tecnicoId: formulario.tecnicoId
                ? Number(formulario.tecnicoId)
                : null,
        };

        try {
            guardandoRef.current = true;
            setGuardando(true);


            if (esEdicion) {
                const datosActualizacion = {
                    ...datos,
                    estadoId: Number(ordenEditar.estadoId),
                };

                await ordenService.actualizarOrden(
                    ordenEditar.id,
                    datosActualizacion
                );

                toast.success("Solicitud actualizada correctamente");
            } else {
                await ordenService.crearOrden(datos);
                toast.success("Solicitud creada correctamente");
            }

            onCreada();

        } catch (error) {
            console.error("Error al guardar la solicitud:", error);

            const mensaje =
                error.response?.data?.mensaje ||
                "No fue posible guardar la solicitud";

            toast.error(mensaje);
        } finally {
            guardandoRef.current = false;
            setGuardando(false);
        }
    };

    return (
        <motion.div
            className="crear-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducirMovimiento ? 0 : 0.2 }}
            onMouseDown={(evento) => {
                if (
                    evento.target === evento.currentTarget &&
                    !guardandoRef.current
                ) {
                    onClose();
                }
            }}
        >
            <motion.div
                ref={modalRef}
                className="crear-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="crear-titulo"
                initial={
                    reducirMovimiento
                        ? false
                        : { opacity: 0, y: 20, scale: 0.97 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.97 }}
                transition={{ duration: reducirMovimiento ? 0 : 0.25 }}
            >
                <div className="crear-encabezado">
                    <div className="crear-encabezado-info">
                        <div className="crear-icono">
                            <i className="bi bi-plus-circle"></i>
                        </div>

                        <div>
                            <h2 id="crear-titulo">
                                {esEdicion ? `Editar solicitud #${ordenEditar.id}` : "Nueva solicitud"}
                            </h2>

                            <p>
                                {esEdicion
                                    ? "Actualiza la información de la orden de servicio."
                                    : "Registra una nueva orden de servicio en SGOS."}
                            </p>
                        </div>
                    </div>

                    <button
                        ref={cerrarRef}
                        type="button"
                        className="crear-cerrar"
                        onClick={onClose}
                        disabled={guardando}
                        aria-label="Cerrar formulario"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {cargando ? (
                    <div className="crear-mensaje">
                        <i className="bi bi-arrow-repeat"></i>
                        <p>Cargando información...</p>
                    </div>
                ) : errorCarga ? (
                    <div className="crear-mensaje">
                        <i className="bi bi-exclamation-circle"></i>
                        <p>No se pudieron cargar los datos necesarios.</p>
                        <button type="button" onClick={onClose}>
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <form onSubmit={guardarSolicitud}>
                        <div className="crear-contenido">

                            <div className="crear-campo">
                                <label htmlFor="crear-descripcion">
                                    Descripción <span>*</span>
                                </label>

                                <textarea
                                    id="crear-descripcion"
                                    name="descripcion"
                                    value={formulario.descripcion}
                                    onChange={actualizarCampo}
                                    placeholder="Describe el servicio solicitado..."
                                    maxLength={255}
                                    required
                                    disabled={guardando}
                                    rows={4}
                                />

                                <small>{formulario.descripcion.length}/255 caracteres</small>
                            </div>

                            {!esEdicion && (
                                <div className="crear-campo">
                                    <label htmlFor="crear-estado">
                                        Estado <span>*</span>
                                    </label>

                                    <select
                                        id="crear-estado"
                                        name="estadoId"
                                        value={formulario.estadoId}
                                        onChange={actualizarCampo}
                                        required
                                        disabled={guardando}
                                    >
                                        <option value="">Selecciona un estado</option>

                                        {estados.map((estado) => (
                                            <option key={estado.id} value={estado.id}>
                                                {estado.nombre.replaceAll("_", " ")}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}


                            <div className="crear-grid">
                                <div className="crear-campo">
                                    <label htmlFor="crear-fecha">
                                        Fecha <span>*</span>
                                    </label>

                                    <input
                                        id="crear-fecha"
                                        type="date"
                                        name="fecha"
                                        value={formulario.fecha}
                                        onChange={actualizarCampo}
                                        required
                                        disabled={guardando}
                                    />
                                </div>

                         

                                <div className="crear-campo">
                                    <label htmlFor="crear-cliente">
                                        Cliente <span>*</span>
                                    </label>

                                    <select
                                        id="crear-cliente"
                                        name="clienteId"
                                        value={formulario.clienteId}
                                        onChange={actualizarCampo}
                                        required
                                        disabled={guardando}
                                    >
                                        <option value="">Selecciona un cliente</option>

                                        {clientes.map((cliente) => (
                                            <option key={cliente.id} value={cliente.id}>
                                                {cliente.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="crear-campo">
                                    <label htmlFor="crear-tecnico">
                                        Técnico asignado
                                    </label>

                                    <select
                                        id="crear-tecnico"
                                        name="tecnicoId"
                                        value={formulario.tecnicoId}
                                        onChange={actualizarCampo}
                                        disabled={guardando}
                                    >
                                        <option value="">Sin asignar</option>

                                        {tecnicos.map((tecnico) => (
                                            <option key={tecnico.id} value={tecnico.id}>
                                                {tecnico.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <p className="crear-obligatorios">
                                Los campos marcados con * son obligatorios.
                            </p>
                        </div>

                        <div className="crear-pie">
                            <button
                                type="button"
                                className="crear-cancelar"
                                onClick={onClose}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="crear-guardar"
                                disabled={guardando || !clientes.length || !estados.length}
                            >
                                <i
                                    className={
                                        guardando
                                            ? "bi bi-arrow-repeat"
                                            : "bi bi-check-lg"
                                    }
                                ></i>
                                {guardando
                                    ? "Guardando..."
                                    : esEdicion
                                        ? "Guardar cambios"
                                        : "Guardar solicitud"}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
}

export default CrearSolicitud;
