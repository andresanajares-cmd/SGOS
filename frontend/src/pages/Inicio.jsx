
import "./Inicio.css";

const estadisticas = [
  {
    titulo: "Solicitudes abiertas",
    icono: "bi-inbox",
    clase: "abiertas",
  },
  {
    titulo: "En proceso",
    icono: "bi-clock-history",
    clase: "proceso",
  },
  {
    titulo: "Solicitudes cerradas",
    icono: "bi-check-circle",
    clase: "cerradas",
  },
];

function Inicio() {
  return (
    <div className="inicio-page">
   

      <div className="estadisticas-grid">
        {estadisticas.map((item) => (
          <div
            key={item.clase}
            className={`estadistica-card ${item.clase}`}
          >
            <div className="estadistica-superior">
              <span>{item.titulo}</span>

              <div className="estadistica-icono">
                <i className={`bi ${item.icono}`}></i>
              </div>
            </div>

            <div className="estadistica-valor">
              <h2>—</h2>
              <span>Sin consultar</span>
            </div>

            <div className="estadistica-barra"></div>
          </div>
        ))}
      </div>

      <section className="solicitudes-panel">
        <div className="solicitudes-panel-header">
          <div>
            <h2>Solicitudes recientes</h2>
            <p>Últimas órdenes de servicio registradas</p>
          </div>

          <div className="solicitudes-panel-icon">
            <i className="bi bi-list-task"></i>
          </div>
        </div>

        <div className="solicitudes-placeholder">
          <i className="bi bi-clipboard-data"></i>
          <h3>Solicitudes pendientes de cargar</h3>
          <p>
            Próximamente se mostrarán las órdenes
            obtenidas desde Spring Boot.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Inicio;
