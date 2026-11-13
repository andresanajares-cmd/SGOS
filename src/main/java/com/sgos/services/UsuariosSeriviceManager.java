
package com.sgos.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sgos.dto.CrearUsuarioRequest;
import com.sgos.entities.Rol;
import com.sgos.entities.Usuarios;
import com.sgos.repositories.RolRepository;
import com.sgos.repositories.UsuariosRepository;

@Service
public class UsuariosSeriviceManager implements UsuariosService {

    @Autowired
    private UsuariosRepository repository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Usuarios registerUser(Usuarios usuario) {

        // Verificar si el correo ya existe
        if (repository.existsByCorreo(usuario.getCorreo())) {
            throw new IllegalArgumentException(
                "El correo ya está registrado"
            );
        }

        // Asignar siempre el rol TECNICO en el registro público
        Rol rol = rolRepository.findByNombre("TECNICO")
            .orElseThrow(() -> new IllegalStateException(
                "El rol TECNICO no existe"
            ));

        usuario.setId(null);
        usuario.setRol(rol);
        usuario.setActivo(true);

        // Proteger la contraseña con BCrypt
        String contrasenaEncriptada =
            passwordEncoder.encode(usuario.getContrasena());

        usuario.setContrasena(contrasenaEncriptada);

        // Guardar el usuario
        return repository.save(usuario);
    }

    @Override
    public boolean authenticateUser(String correo, String contrasena) {

        Optional<Usuarios> usuarioEncontrado =
            repository.findByCorreo(correo);

        if (usuarioEncontrado.isEmpty()) {
            return false;
        }

        Usuarios usuario = usuarioEncontrado.get();

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            return false;
        }

        // Comparar la contraseña con el hash almacenado
        return passwordEncoder.matches(
            contrasena,
            usuario.getContrasena()
        );
    }

@Override
public Usuarios crearTecnico(CrearUsuarioRequest request) {

    String correo = request.correo().trim().toLowerCase();

    if (repository.existsByCorreo(correo)) {
        throw new IllegalArgumentException(
            "El correo ya está registrado"
        );
    }

    Rol rolTecnico = rolRepository
        .findByNombre("TECNICO")
        .orElseThrow(() -> new IllegalStateException(
            "No existe el rol TECNICO"
        ));

    Usuarios usuario = new Usuarios();

    usuario.setNombre(request.nombre().trim());
    usuario.setCorreo(correo);
    usuario.setContrasena(
        passwordEncoder.encode(request.contrasena())
    );
    usuario.setTelefono(request.telefono());
    usuario.setRol(rolTecnico);
    usuario.setActivo(true);

    return repository.save(usuario);
}

}
