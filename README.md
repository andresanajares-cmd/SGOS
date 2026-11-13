# SGOS - Sistema Gestor de Órdenes de Servicio

SGOS es un proyecto que hice durante mi formación en el SENA para gestionar órdenes de servicio. Tiene un backend en Spring Boot, un frontend en React y una base de datos MySQL.

Este repositorio reúne lo que entregué en tres evidencias. **No es el sistema completo**, son los módulos de cada evidencia:

| Evidencia | Qué es | Dónde está |
|-----------|--------|-----------|
| GA7-220501096-AA3-EV01 | Módulo de órdenes de servicio (CRUD completo) | Backend y frontend |
| GA7-220501096-AA5-EV01 | Servicio web de registro e inicio de sesión | Backend |
| GA7-220501096-AA5-EV02 | Pruebas de la API con Postman | Se prueba lo de las dos anteriores |

## Con qué lo hice

- Backend: Java 17, Spring Boot 3, Maven
- Frontend: React con Vite
- Base de datos: MySQL (con MySQL Workbench)
- Pruebas: Postman
- Versionamiento: Git y GitHub

## Cómo está organizado

```
SGOS/
├── src/        -> el backend (Spring Boot)
├── frontend/   -> el frontend (React)
├── postman/    -> material de pruebas con Postman
├── pom.xml
└── README.md
```

En el backend separé el código por capas: los **controllers** reciben las peticiones, los **services** tienen la lógica, los **repositories** hablan con la base de datos y las **entities** son las clases que representan las tablas.

---

## Qué hay que instalar

Antes de ejecutar el proyecto necesitas tener esto en tu computador:

| Programa | Para qué lo uso | Versión | Dónde descargarlo |
|----------|-----------------|---------|-------------------|
| JDK (Java) | Correr el backend | 17 o superior | https://adoptium.net |
| Node.js (trae npm) | Correr el frontend | 18 o superior | https://nodejs.org |
| MySQL Server | Base de datos | 8.0 o superior | https://dev.mysql.com/downloads/mysql |
| MySQL Workbench | Administrar la base de datos | La más reciente | https://dev.mysql.com/downloads/workbench |
| Git | Clonar el repositorio | La más reciente | https://git-scm.com |
| Postman | Probar la API | La más reciente | https://www.postman.com/downloads |
| Visual Studio Code (opcional) | Editor para abrir el código | La más reciente | https://code.visualstudio.com |

**Maven no hay que instalarlo.** El proyecto trae el archivo `mvnw`, que descarga y usa Maven por su cuenta.

### Cómo revisar que quedó bien instalado

Abre una terminal y escribe estos comandos. Cada uno debe mostrar una versión:

```bash
java -version
node -v
npm -v
git --version
mysql --version
```

Si alguno dice que no se reconoce el comando, cierra y vuelve a abrir la terminal. Si sigue igual, la instalación no quedó en el PATH y toca revisarla.

Además, MySQL Server tiene que estar **encendido** cuando corras el backend. Al instalarlo te pide una contraseña para el usuario `root`, anótala porque se usa en `application.properties`.

---

## Cómo ejecutar el proyecto

Con todo lo anterior instalado, sigue estos pasos.

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

**4. Correr el frontend** (solo si quieres usar la interfaz de órdenes)

En otra terminal:

```bash
cd frontend/frontend-ordenes
npm install
npm run dev
```

Queda en `http://localhost:5173`.

---

## Evidencia AA3-EV01: módulo de órdenes de servicio

Es el CRUD de órdenes: crear, ver todas, buscar por id, editar y eliminar.

Cada orden tiene:

- **id**: se genera solo
- **fecha**
- **responsable**: quién se encarga de la orden
- **cliente**
- **descripcion**: qué hay que hacer
- **estado**: por ejemplo Pendiente, En proceso o Finalizada

### Rutas

Todas empiezan por `http://localhost:8080/api/ordenesservicios`

| Método | Ruta | Para qué sirve | Respuesta |
|--------|------|----------------|-----------|
| GET | `/api/ordenesservicios` | Trae todas las órdenes | 200 |
| GET | `/api/ordenesservicios/{id}` | Trae una orden por id | 200, o 404 si no existe |
| POST | `/api/ordenesservicios` | Crea una orden | 201 |
| PUT | `/api/ordenesservicios/{id}` | Edita una orden | 201, o 404 si no existe |
| DELETE | `/api/ordenesservicios/{id}` | Elimina una orden | 204, o 404 si no existe |

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

### Cómo probarlo

- **Con el frontend:** con backend y frontend corriendo, abre `http://localhost:5173` y usa la pantalla de órdenes para crear, buscar, editar y eliminar.
- **Con Postman:** haz las peticiones de la tabla de arriba a `http://localhost:8080`.

---

## Evidencia AA5-EV01: servicio web de registro e inicio de sesión

El servicio recibe un usuario y una contraseña:

- **Registro:** guarda el usuario en la base de datos.
- **Inicio de sesión:** revisa si el usuario y la contraseña son correctos. Si lo son, responde "Autenticación satisfactoria". Si no, responde "Error en la autenticación".

### Rutas

Todas empiezan por `http://localhost:8080/api/usuarios`

| Método | Ruta | Para qué sirve |
|--------|------|----------------|
| POST | `/api/usuarios/registro` | Registra un usuario nuevo |
| POST | `/api/usuarios/login` | Inicia sesión |

El cuerpo es el mismo en las dos:

```json
{
  "nombre": "andres",
  "contrasena": "1234"
}
```

### Respuestas del login

| Caso | Código | Mensaje |
|------|--------|---------|
| Usuario y contraseña correctos | 200 OK | Autenticación satisfactoria |
| Contraseña incorrecta o usuario que no existe | 401 Unauthorized | Error en la autenticación |

---

## Evidencia AA5-EV02: pruebas de la API con Postman

Probé el servicio de la AA5-EV01 con Postman. Para repetir las pruebas:

1. Deja el backend corriendo (paso 3 de arriba).
2. Abre Postman y haz un `POST` a `http://localhost:8080/api/usuarios/registro` con el JSON de ejemplo. Debe responder 200.
3. Haz un `POST` a `http://localhost:8080/api/usuarios/login` con el mismo JSON. Debe responder "Autenticación satisfactoria" con código 200.
4. Repite el login cambiando la contraseña por otra (por ejemplo `9999`). Debe responder "Error en la autenticación" con código 401.
5. Repite el login con un usuario que no exista (por ejemplo `noexiste`). Debe responder también "Error en la autenticación" con código 401.

Un detalle: no registres dos veces el mismo usuario, porque el servicio todavía no valida usuarios repetidos. Si pasa, borra el repetido desde MySQL Workbench.

---

## Problemas comunes

| Problema | Qué hacer |
|----------|-----------|
| El backend no arranca y dice que no se puede conectar a la base de datos | Revisa que MySQL esté encendido, que la base `sgos` exista y que el usuario y la contraseña de `application.properties` sean los correctos |
| Dice que el puerto 8080 ya está en uso | Cierra el programa que lo esté usando, o cambia el puerto agregando `server.port=8081` en `application.properties` |
| `mvnw` dice que no encuentra Java o `JAVA_HOME` | Revisa que el JDK esté instalado (`java -version`) y que la variable `JAVA_HOME` apunte a su carpeta |
| En Linux o Mac, `./mvnw` dice permiso denegado | Ejecuta `chmod +x mvnw` y vuelve a intentar |
| El frontend no carga las órdenes | Revisa que el backend esté corriendo en `http://localhost:8080` |
| `npm install` da error | Borra la carpeta `node_modules` y vuelve a ejecutarlo |

---

## Cosas que tener en cuenta

- Cada evidencia se entregó por separado en la plataforma. Este repositorio es el mismo para todas.
- Los artefactos de diseño (diagrama de clases, casos de uso, historias de usuario y prototipos) se hicieron en etapas anteriores del proyecto.

## Autor

Andrés Sebastián Anajar González
Análisis y Desarrollo de Software, ficha 3186597 - SENA

Repositorio: https://github.com/andresanajares-cmd/SGOS

## Autor

Andrés Sebastián Anajar González
Análisis y Desarrollo de Software, ficha 3186597 - SENA

Repositorio: https://github.com/andresanajares-cmd/SGOS
