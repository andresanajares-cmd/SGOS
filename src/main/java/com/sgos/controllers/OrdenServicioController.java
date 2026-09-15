package com.sgos.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.entities.OrdenServicio;
import com.sgos.services.OrdenServicioServiceManager;


@RestController
@RequestMapping ("/api/ordenesservicios") 
public class OrdenServicioController {

    @Autowired
    private OrdenServicioServiceManager serviceManager;

    @GetMapping()
    public List<OrdenServicio> findAll() {
        return this.serviceManager.findAll();
    }


}
