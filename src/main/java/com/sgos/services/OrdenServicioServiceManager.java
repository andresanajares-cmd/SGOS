package com.sgos.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sgos.entities.OrdenServicio;
import com.sgos.repositories.OrdenServicioRepository;


@Service
public class OrdenServicioServiceManager implements OrdenServicioService {
    
    @Autowired 
    private OrdenServicioRepository repository;

    @Override 
    public List<OrdenServicio> findAll() {
        return (List<OrdenServicio>) this.repository.findAll();
    }

    @Override
    public OrdenServicio findById(Long id) {
        return this.repository.findById(id).get();
    }

    @Override
    public OrdenServicio save(OrdenServicio ordenServicio) {
        return this.repository.save(ordenServicio);
    }

    @Override
    public void deleteById(Long id) {
        this.repository.deleteById(id);
    }
    
}
