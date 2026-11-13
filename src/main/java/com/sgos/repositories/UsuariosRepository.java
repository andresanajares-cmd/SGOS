
package com.sgos.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sgos.entities.Usuarios;



public interface UsuariosRepository extends JpaRepository<Usuarios, Long> {

    Optional<Usuarios> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    boolean existsByRol_Nombre(String nombre);

}
