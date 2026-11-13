
package com.sgos.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sgos.entities.Rol;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(String nombre);

}
