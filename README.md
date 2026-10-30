# SGOS - Sistema Gestor de Órdenes de Servicio

Este proyecto es el módulo de órdenes de servicio de mi sistema SGOS. Ojo: **no es el sistema completo**, solo este módulo, que es lo que se pide en la evidencia GA7-220501096-AA3-EV01.

Con él se pueden crear, ver, editar y eliminar órdenes de servicio. El backend lo hice con Spring Boot y el frontend con React.

## Qué hace

- Crear una orden
- Ver todas las órdenes
- Buscar una orden por su id
- Editar una orden
- Eliminar una orden

Cada orden tiene:

- **id**: se genera solo
- **fecha**
- **responsable**: quién se encarga de la orden
- **cliente**
- **descripcion**: qué hay que hacer
- **estado**: por ejemplo Pendiente, En proceso o Finalizada

## Con qué lo hice

- Backend: Java 17, Spring Boot 3, Maven
- Frontend: React con Vite
- Base de datos: MySQL (la manejé con MySQL Workbench)
- Versionamiento: Git y GitHub

## Cómo está organizado

```
SGOS/
├── src/        -> el backend (Spring Boot)
├── frontend/   -> el frontend (React)
├── pom.xml
└── README.md
```

En el backend separé el código por capas: los **controllers** reciben las peticiones, los **services** tienen la lógica, los **repositories** hablan con la base de datos y las **entities** son las clases que representan las tablas.

En el frontend, dentro de `frontend/frontend-ordenes/src`, los **components** son las pantallas y piezas de la interfaz, y **services** es donde se hacen las llamadas a la API.

## Cómo correrlo

Necesitas tener instalado Java 17 o más, Node.js, MySQL y Git.

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

**4. Correr el frontend**

En otra terminal:

```bash
cd frontend/frontend-ordenes
npm install
npm run dev
```

Queda en `http://localhost:5173`.

## Rutas de la API

Todas empiezan por `http://localhost:8080/api/ordenesservicios`

| Método | Ruta | Para qué sirve |
|--------|------|----------------|
| GET | `/api/ordenesservicios` | Trae todas las órdenes |
| GET | `/api/ordenesservicios/{id}` | Trae una orden por id (404 si no existe) |
| POST | `/api/ordenesservicios` | Crea una orden |
| PUT | `/api/ordenesservicios/{id}` | Edita una orden (404 si no existe) |
| DELETE | `/api/ordenesservicios/{id}` | Elimina una orden (404 si no existe) |

Ejemplo de lo que se manda para crear o editar una orden:

```json
{
  "fecha": "2025-01-15",
  "responsable": "Carlos Gómez",
  "cliente": "Empresa XYZ",
  "descripcion": "Mantenimiento preventivo de equipos",
  "estado": "Pendiente"
}
```

## Cosas que tener en cuenta

En el proyecto también hay código de usuarios y login. Eso es de otra evidencia y no hace parte de esta entrega, pero lo dejé ahí para no dañar nada.

## Autor

Andres Sebastian Anajar Gonzalez
Análisis y Desarrollo de Software, ficha 3186597 - SENA

Repositorio: https://github.com/andresanajares-cmd/SGOS