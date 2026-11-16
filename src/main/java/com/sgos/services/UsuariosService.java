package com.sgos.services;

import java.util.List;

import com.sgos.dto.CrearUsuarioRequest;
import com.sgos.entities.Usuarios;
import com.sgos.dto.CambiarRolRequest;

public interface UsuariosService {

    Usuarios registerUser(Usuarios usuario);

    boolean authenticateUser(String correo, String contrasena);

    Usuarios crearTecnico(CrearUsuarioRequest request);

    List<Usuarios> listarUsuarios();

    Usuarios buscarPorId(Long id);

    Usuarios cambiarEstado(Long id, boolean activo);

    Usuarios cambiarRol(Long id, CambiarRolRequest request, Long administradorId);
}
