package com.sgos.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sgos.entities.Usuarios;
import com.sgos.repositories.UsuariosRepository;




@Service
public class UsuariosSeriviceManager implements UsuariosService {

    @Autowired 
    private UsuariosRepository repository; //Inyeccion de dependencias para acceder a los metodos del repositorio de la entidad OrdenServicio. 

    @Override
    public Usuarios registerUser(Usuarios usuario) {
        return repository.save(usuario);
    }
    // Implementación del método de autenticación de usuario
    @Override
    public boolean authenticateUser(String nombre, String contrasena) {
        // Busca el usuario por su nombre de usuario en la base de datos
        Optional<Usuarios> usuarioEncontrado = repository.findByUsername(nombre);

        if (usuarioEncontrado.isEmpty()) {
            return false;
        }
        // Compara la contraseña proporcionada con la almacenada en la base de datos
        return usuarioEncontrado.get().getContrasena().equals(contrasena);
    }

}
