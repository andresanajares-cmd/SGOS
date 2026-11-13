
package com.sgos.services;

import com.sgos.dto.CrearUsuarioRequest;
import com.sgos.entities.Usuarios;


public interface UsuariosService {

    Usuarios registerUser(Usuarios usuario);

    boolean authenticateUser(String correo, String contrasena);

    Usuarios crearTecnico(CrearUsuarioRequest request);
}
