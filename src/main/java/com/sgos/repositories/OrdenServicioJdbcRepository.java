
package com.sgos.repositories;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.sgos.config.ConexionBD;
import com.sgos.entities.OrdenServicio;

@Repository
public class OrdenServicioJdbcRepository {

    private final ConexionBD conexionBD;

    public OrdenServicioJdbcRepository(ConexionBD conexionBD) {
        this.conexionBD = conexionBD;
    }

    // Consultar todas las órdenes de servicio.
    public List<OrdenServicio> findAll() {

        List<OrdenServicio> ordenes = new ArrayList<>();

        String sql = "SELECT * FROM ordenes_servicios";

        try (Connection conexion = conexionBD.getConnection();
             PreparedStatement ps = conexion.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                ordenes.add(mapearOrden(rs));
            }

        } catch (SQLException e) {
            throw new RuntimeException(
                "Error al consultar las órdenes de servicio", e);
        }

        return ordenes;
    }

    // Consultar una orden por su ID.
    public Optional<OrdenServicio> findById(Long id) {

        String sql =
            "SELECT * FROM ordenes_servicios WHERE id = ?";

        try (Connection conexion = conexionBD.getConnection();
             PreparedStatement ps = conexion.prepareStatement(sql)) {

            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return Optional.of(mapearOrden(rs));
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException(
                "Error al buscar la orden de servicio", e);
        }

        return Optional.empty();
    }

    // Insertar una nueva orden de servicio.
    public OrdenServicio save(OrdenServicio orden) {

        String sql = """
            INSERT INTO ordenes_servicios
            (descripcion, fecha, estado, cliente, responsable)
            VALUES (?, ?, ?, ?, ?)
            """;

        try (Connection conexion = conexionBD.getConnection();
             PreparedStatement ps = conexion.prepareStatement(
                 sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, orden.getDescripcion());
            ps.setDate(2, orden.getFecha() != null
                ? Date.valueOf(orden.getFecha()) : null);
            ps.setString(3, orden.getEstado());
            ps.setString(4, orden.getCliente());
            ps.setString(5, orden.getResponsable());

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {

                if (rs.next()) {
                    orden.setId(rs.getLong(1));
                }
            }

            return orden;

        } catch (SQLException e) {
            throw new RuntimeException(
                "Error al insertar la orden de servicio", e);
        }
    }

    // Actualizar una orden existente.
    public OrdenServicio update(Long id, OrdenServicio orden) {

        String sql = """
            UPDATE ordenes_servicios
            SET descripcion = ?, fecha = ?, estado = ?,
                cliente = ?, responsable = ?
            WHERE id = ?
            """;

        try (Connection conexion = conexionBD.getConnection();
             PreparedStatement ps = conexion.prepareStatement(sql)) {

            ps.setString(1, orden.getDescripcion());
            ps.setDate(2, orden.getFecha() != null
                ? Date.valueOf(orden.getFecha()) : null);
            ps.setString(3, orden.getEstado());
            ps.setString(4, orden.getCliente());
            ps.setString(5, orden.getResponsable());
            ps.setLong(6, id);

            int filas = ps.executeUpdate();

            if (filas == 0) {
                throw new RuntimeException(
                    "Orden de servicio no encontrada con id: " + id);
            }

            orden.setId(id);
            return orden;

        } catch (SQLException e) {
            throw new RuntimeException(
                "Error al actualizar la orden de servicio", e);
        }
    }

    // Eliminar una orden por su ID.
    public void deleteById(Long id) {

        String sql =
            "DELETE FROM ordenes_servicios WHERE id = ?";

        try (Connection conexion = conexionBD.getConnection();
             PreparedStatement ps = conexion.prepareStatement(sql)) {

            ps.setLong(1, id);

            int filas = ps.executeUpdate();

            if (filas == 0) {
                throw new RuntimeException(
                    "Orden de servicio no encontrada con id: " + id);
            }

        } catch (SQLException e) {
            throw new RuntimeException(
                "Error al eliminar la orden de servicio", e);
        }
    }

    // Convertir un registro SQL en un objeto OrdenServicio.
    private OrdenServicio mapearOrden(ResultSet rs)
            throws SQLException {

        OrdenServicio orden = new OrdenServicio();

        orden.setId(rs.getLong("id"));
        orden.setDescripcion(rs.getString("descripcion"));

        Date fecha = rs.getDate("fecha");

        if (fecha != null) {
            orden.setFecha(fecha.toLocalDate());
        }

        orden.setEstado(rs.getString("estado"));
        orden.setCliente(rs.getString("cliente"));
        orden.setResponsable(rs.getString("responsable"));

        return orden;
    }
}
