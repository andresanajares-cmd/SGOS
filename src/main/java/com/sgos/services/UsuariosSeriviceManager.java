package com.sgos.services;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sgos.dto.CambiarRolRequest;
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
        String contrasenaEncriptada
                = passwordEncoder.encode(usuario.getContrasena());

        usuario.setContrasena(contrasenaEncriptada);

        // Guardar el usuario
        return repository.save(usuario);
    }

    @Override
    public boolean authenticateUser(String correo, String contrasena) {

        Optional<Usuarios> usuarioEncontrado
                = repository.findByCorreo(correo.trim().toLowerCase(java.util.Locale.ROOT));

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

    @Override
    public List<Usuarios> listarUsuarios() {
        return repository.findAll();
    }

    @Override
    public Usuarios buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("El usuario no existe"));
    }

    @Override
    @Transactional
    public Usuarios cambiarEstado(Long id, boolean activo) {

        Usuarios usuario = buscarPorId(id);

        if (!activo
                && Boolean.TRUE.equals(usuario.getActivo())
                && "ADMINISTRADOR".equals(
                        usuario.getRol().getNombre())) {

            long administradoresActivos = repository.findAll()
                    .stream()
                    .filter(u -> Boolean.TRUE.equals(u.getActivo()))
                    .filter(u -> "ADMINISTRADOR".equals(
                            u.getRol().getNombre()))
                    .count();

            if (administradoresActivos <= 1) {
                throw new IllegalArgumentException(
                        "No se puede desactivar al último administrador activo"
                );
            }
        }

        usuario.setActivo(activo);

        return repository.save(usuario);
    }

    @Override
    @Transactional
    public Usuarios cambiarRol(
            Long id,
            CambiarRolRequest request,
            Long administradorId) {

        // Buscar el usuario que realizará el cambio
        Usuarios administrador = buscarPorId(administradorId);

        // Verificar que sea un administrador activo
        if (!Boolean.TRUE.equals(administrador.getActivo())
                || !administrador.getRol().getNombre()
                        .equals("ADMINISTRADOR")) {

            throw new IllegalArgumentException(
                    "No tienes permisos para cambiar roles"
            );
        }

        // Buscar el usuario cuyo rol se modificará
        Usuarios usuario = buscarPorId(id);

        // Impedir que el administrador cambie su propio rol
        if (usuario.getId().equals(administradorId)) {
            throw new IllegalArgumentException(
                    "No puedes cambiar tu propio rol"
            );
        }

        // Buscar el nuevo rol en la base de datos
        Rol nuevoRol = rolRepository
                .findByNombre(request.rol())
                .orElseThrow(() -> new IllegalArgumentException(
                        "El rol solicitado no existe"
                ));

        String rolActual = usuario.getRol().getNombre();
        String rolSolicitado = nuevoRol.getNombre();

        // Evitar cambios innecesarios
        if (rolActual.equals(rolSolicitado)) {
            throw new IllegalArgumentException(
                    "El usuario ya tiene asignado ese rol"
            );
        }

        // Verificar si se está degradando a un administrador
        if (rolActual.equals("ADMINISTRADOR")
                && rolSolicitado.equals("TECNICO")
                && Boolean.TRUE.equals(usuario.getActivo())) {

            long administradoresActivos = repository.findAll()
                    .stream()
                    .filter(u -> Boolean.TRUE.equals(u.getActivo()))
                    .filter(u -> u.getRol().getNombre()
                            .equals("ADMINISTRADOR"))
                    .count();

            if (administradoresActivos <= 1) {
                throw new IllegalArgumentException(
                        "No puedes cambiar el rol del último administrador activo"
                );
            }
        }

        // Asignar el nuevo rol
        usuario.setRol(nuevoRol);

        // Guardar los cambios
        return repository.save(usuario);
    }

}
