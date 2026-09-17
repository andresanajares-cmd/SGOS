package com.sgos.entities;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table; 

//Clase Ordenes servicios, que representa una orden de servicio en el sistema. 
// Contiene atributos como id, descripcion, fecha, estado, cliente y responsable (columnas de la tabla en la base de datos). 


// Se utiliza la anotación @Entity para indicar que es una entidad de JPA 
@Entity

// @Table para especificar el nombre de la tabla en la base de datos.
@Table(name = "ordenes_servicios")

public class OrdenServicio {

    @Id //Pk - Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Generación automática del valor de la PK.
    private Long id;

    private String descripcion;
    private LocalDate fecha;
    private String estado;
    private String cliente;
    private String responsable;

    //Contructor vacio (necesario por el framework) y constructor con parámetros para inicializar los atributos de la clase.
    public OrdenServicio() {
    }

    public OrdenServicio(String descripcion, LocalDate fecha, String estado, String cliente, String responsable) {
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.estado = estado;
        this.cliente = cliente;
        this.responsable = responsable;
    }


    //Getters y Setters para acceder y modificar los atributos de la clase.

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getCliente() {
        return cliente;
    }

    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public String getResponsable() {
        return responsable;
    }

    public void setResponsable(String responsable) {
        this.responsable = responsable;
    }

}
