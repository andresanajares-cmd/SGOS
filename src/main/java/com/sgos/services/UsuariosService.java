package com.sgos.services;
import com.sgos.entities.Usuarios;
//Contratos de servicios para la entidad Usuarios, 
//(define los métodos que se implementarán en la clase de servicio correspondiente)
public interface UsuariosService {

    // Método para registrar un nuevo usuario
    Usuarios registerUser(Usuarios usuario);

    // Método para autenticar un usuario
    boolean authenticateUser(String nombre, String contrasena);
}
