# Sistema de Subastas - Backend

Este proyecto corresponde al backend para el Trabajo Práctico Obligatorio de Aplicaciones Móviles.

## Instalación y Configuración Local

Para ejecutar el proyecto en un entorno local sin interferir con otros desarrolladores, siga estos pasos:

1. **Configuración de Propiedades**:
   - Diríjase a la carpeta `src/main/resources/`.
   - Copie el archivo `application-local.properties.example` y renómbrelo como `application-local.properties`.
   - Edite el archivo `application-local.properties` con sus credenciales de MySQL (usuario, contraseña y puerto).
   - Nota importante: Este archivo se encuentra en el `.gitignore`, por lo que sus datos personales no serán subidos al repositorio.

2. **Base de Datos**:
   - Asegúrese de que MySQL esté ejecutándose.
   - El sistema está configurado para crear automáticamente la base de datos `db_subastas` si no existe.

3. **Ejecución**:
   - Puede ejecutar el proyecto desde su IDE o mediante el comando:
     ```bash 
     ./mvnw spring-boot:run
     ```

## Documentación API (Swagger)

Una vez que el servidor esté en funcionamiento, acceda a la documentación interactiva en:
[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## Estructura del Proyecto

El backend se organiza siguiendo una arquitectura en capas para facilitar el mantenimiento y la escalabilidad:

```
com.subastas.backend
├── config             # Configuraciones de seguridad (JWT/CORS), Swagger y base de datos
├── controller         # Endpoints REST para recibir peticiones HTTP
├── dto                # Objetos de transferencia de datos (Request/Response)
├── entity             # Clases JPA para el mapeo de tablas de la base de datos
├── exception          # Manejo global de errores y excepciones personalizadas
├── mapper             # Lógica de conversión entre Entity y DTO
├── repository         # Interfaces de acceso a datos (Spring Data JPA)
└── service            # Lógica de negocio (interfaces e implementaciones)
```

### Dominios Principales:
- **Usuarios:** Persona, Empleado, Cliente, Dueño, Subastador.
- **Subastas:** Subasta, Catalogo, ItemCatalogo, Pujo, Asistente.
- **Productos:** Producto, Foto, Seguro.
- **Geografía:** Pais, Sector.

