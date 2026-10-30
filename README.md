# SGOS - Servicio web de registro e inicio de sesión

Este proyecto es parte de mi sistema SGOS (Sistema Gestor de Órdenes de Servicio). En esta entrega, evidencia GA7-220501096-AA5-EV01, lo que se presenta es el **servicio web de registro e inicio de sesión de usuarios**, hecho con Spring Boot.

Ojo: **no es el sistema completo**. El proyecto también tiene el módulo de órdenes de servicio, que lo entregué en otra evidencia (AA3-EV01).

## Qué hace el servicio

El servicio recibe un usuario y una contraseña:

- **Registro:** guarda el usuario en la base de datos.
- **Inicio de sesión:** revisa si el usuario y la contraseña son correctos.
  - Si son correctos, responde "Autenticación satisfactoria".
  - Si no, responde "Error en la autenticación".

## Con qué lo hice

- Java 17, Spring Boot 3, Maven
- MySQL (con MySQL Workbench)
- Git y GitHub

## Rutas del servicio

Todas empiezan por `http://localhost:8080/api/usuarios`

| Método | Ruta | Para qué sirve |
|--------|------|----------------|
| POST | `/api/usuarios/registro` | Registra un usuario nuevo |
| POST | `/api/usuarios/login` | Inicia sesión |

### Registro

Se envía el usuario y la contraseña en el cuerpo de la petición:

```json
{
  "nombre": "andres",
  "contrasena": "1234"
}
```

Responde `200 OK` con el usuario que quedó guardado.

### Inicio de sesión

Se envía lo mismo:

```json
{
  "nombre": "andres",
  "contrasena": "1234"
}
```

Si los datos son correctos:

- Código: `200 OK`
- Mensaje: `Autenticación satisfactoria`

Si el usuario no existe o la contraseña está mal:

- Código: `401 Unauthorized`
- Mensaje: `Error en la autenticación`

## Cómo está organizado

```
SGOS/
├── src/        -> el backend (Spring Boot)
├── frontend/   -> el frontend (React)
├── pom.xml
└── README.md
```

El servicio de usuarios usa las mismas capas que el resto del backend:

- **UsuarioController:** recibe las peticiones de registro y login.
- **UsuariosSeriviceManager:** tiene la lógica para guardar el usuario y verificar las credenciales.
- **UsuariosRepository:** consulta la base de datos.
- **Usuarios:** la clase que representa la tabla de usuarios.

## Cómo correrlo

Necesitas tener instalado Java 17 o más, MySQL y Git.

**1. Clonar el repositorio**

```bash
git clone https://github.com/andresanajares-cmd/SGOS.git
cd SGOS
```

**2. Crear la base de datos**

En MySQL Workbench ejecuta:

```sql
CREATE DATABASE sgos;
```

Después abre `src/main/resources/application.properties` y pon tu usuario y contraseña de MySQL:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sgos
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_CONTRASEÑA
spring.jpa.hibernate.ddl-auto=update
```

Las tablas se crean solas la primera vez que se corre el backend.

**3. Correr el backend**

```bash
./mvnw spring-boot:run
```

(en Windows: `mvnw.cmd spring-boot:run`). Queda en `http://localhost:8080`.

## Cómo probarlo

Se puede probar con Postman o cualquier programa parecido:

1. Hacer un `POST` a `http://localhost:8080/api/usuarios/registro` con el JSON de arriba.
2. Hacer un `POST` a `http://localhost:8080/api/usuarios/login` con el mismo JSON. Debe salir "Autenticación satisfactoria".
3. Repetir el login con una contraseña distinta. Debe salir "Error en la autenticación" con código 401.

## Autor

Andrés Sebastián Anajar González
Análisis y Desarrollo de Software, ficha 3186597 - SENA

Repositorio: https://github.com/andresanajares-cmd/SGOS