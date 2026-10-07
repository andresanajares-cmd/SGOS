package com.sgos.repositories;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sgos.entities.Usuarios;

//patrón de diseño llamado Repository combinado 
public interface UsuariosRepository extends JpaRepository<Usuarios, Long> {
    // Método para buscar un usuario por su nombre de usuario
    Optional<Usuarios> findByUsername(String username);
}
