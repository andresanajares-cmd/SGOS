package com.sgos.repositories;

import org.springframework.data.repository.CrudRepository;

import com.sgos.entities.OrdenServicio;

//patrón de diseño llamado Repository combinado con Proxies dinámicos de Java 
//(nos permite implemetar metodos CRUD (Create, Read, Update, Delete)).
public interface OrdenServicioRepository extends CrudRepository<OrdenServicio, Long> {
    
}
