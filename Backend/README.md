# 🔨 Sistema de Subastas - Backend

Proyecto de backend para el TPO de Aplicaciones Móviles.

## 🚀 Instalación y Configuración Local

Para que el proyecto funcione en tu entorno local sin afectar a los demás, seguí estos pasos:

1.  **Configuración de Propiedades**:
    *   Andá a `src/main/resources/`.
    *   Copiá el archivo `application-local.properties.example` y renombralo como `application-local.properties`.
    *   Editá `application-local.properties` con tus credenciales de MySQL (usuario, contraseña y puerto).
    *   **Importante**: Este archivo está en el `.gitignore`, así que tus datos personales no se subirán al repositorio.

2.  **Base de Datos**:
    *   Asegurate de tener MySQL corriendo.
    *   El sistema está configurado para crear la base de datos `db_subastas` automáticamente si no existe.

3.  **Ejecución**:
    *   Podés correr el proyecto desde tu IDE o usando el comando:
        ```bash
        ./mvnw spring-boot:run
        ```

## 📚 Documentación API (Swagger)

Una vez que el servidor esté corriendo, podés acceder a la documentación interactiva en:
[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## 📂 Estructura del Proyecto

El backend está organizado siguiendo una arquitectura en capas para facilitar el mantenimiento y la escalabilidad:

```text
com.subastas.backend
├── config             # Seguridad (JWT/CORS), Swagger, Configuración de BD
├── controller         # Endpoints REST (Reciben peticiones HTTP)
├── dto                # Objetos de transferencia de datos (Request/Response)
├── entity             # Clases JPA (Mapeo de tablas de SQL Server)
├── exception          # Manejo global de errores y excepciones personalizadas
├── mapper             # Lógica de conversión entre Entity y DTO
├── repository         # Interfaces de acceso a datos (Spring Data JPA)
└── service            # Lógica de negocio (Interfaces e Implementaciones)
```

### Dominios Principales:
- **Usuarios:** Persona, Empleado, Cliente, Dueño, Subastador.
- **Subastas:** Subasta, Catalogo, ItemCatalogo, Pujo, Asistente.
- **Productos:** Producto, Foto, Seguro.
- **Geografía:** Pais, Sector.

