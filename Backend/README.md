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
