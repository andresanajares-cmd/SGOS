package com.sgos.controllers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sgos.entities.Usuarios;
import com.sgos.services.UsuariosSeriviceManager;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuariosSeriviceManager usuarioService;
    
     // Endpoint para registrar un nuevo usuario
  
    @PostMapping("/registro")
    public ResponseEntity<Usuarios> registro(@RequestBody Usuarios usuario) {
        Usuarios nuevoUsuario = usuarioService.registerUser(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    // Endpoint para iniciar sesión

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Usuarios usuario) {
        boolean autenticado = usuarioService.authenticateUser(usuario.getNombre(), usuario.getContrasena());

        if (autenticado) {
            return ResponseEntity.ok("Autenticación satisfactoria");
        } else {
            return ResponseEntity.status(401).body("Error en la autenticación");
        }
    }

}
