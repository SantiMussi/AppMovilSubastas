# 🔨 Sistema de Subastas - TPO DAI 1C2026

Proyecto de gestión de subastas dinámicas ascendentes con integración de catálogo, postores y sistema de carga de artículos.

---

## 📌 1. Reglas de Negocio (Core)

### Modalidad de Subasta: Dinámica Ascendente
* **Precio Base**: Punto de partida de la subasta.
* **Puja Mínima**: `Última Oferta + (1% del Valor Base)`.
* **Puja Máxima**: `Última Oferta + (20% del Valor Base)`.
* **Excepción de Límites**: Las categorías **Oro** y **Platino** no tienen restricciones de monto máximo.
* **Cierre**: Gana el último postor cuando ya nadie ofrece un valor más alto.

### Acceso y Jerarquías
* **Categorías de Usuario**: Común, Especial, Plata, Oro, Platino.
* **Restricción**: Usuario Categoría ≥ Subasta Categoría.
* **Conectividad**: No se permite estar conectado a más de una subasta a la vez.
* **Validación de Pago**: Para pujar, es obligatorio tener al menos un medio de pago verificado.

---

## 🛠 2. Módulos y Requerimientos Funcionales

### 👤 Módulo de Usuarios (Postores)
- [ ] **Registro en 2 etapas**:
    - Etapa 1: Carga de datos (Nombre, Apellido, DNI frente/dorso, Domicilio, País).
    - Etapa 2: Mail de confirmación, generación de password y login.
- [ ] **Gestión de Pagos**: Carga de Cuentas bancarias (nacionales/extranjeras), Tarjetas o Cheques certificados.
- [ ] **Perfil y Métricas**: Historial de asistencias, subastas ganadas y visualización de pujos.

### 🔨 Módulo de Subastas (Sala en Vivo)
- [ ] **Streaming**: Acceso al servicio externo para usuarios registrados.
- [ ] **Real-time**: Recepción de ofertas en tiempo real y validación local antes del envío.
- [ ] **Sincronización**: Bloqueo de nuevos pujes hasta que el sistema confirme la transacción anterior.
- [ ] **Notificaciones**: Mensaje privado al ganador con detalle de puja, comisiones y envío.

### 📦 Módulo de Vendedores (Subastar Bien Propio)
- [ ] **Solicitud**: Formulario con datos del bien, mínimo 6 fotos y antecedentes históricos.
- [ ] **Declaración Jurada**: Checkbox obligatorio de pertenencia y origen lícito.
- [ ] **Tracking del Bien**: Ver ubicación física (depósito) y póliza de seguro.
- [ ] **Gestión de Póliza**: Opción de contactar a la aseguradora para aumentar el valor del premio.

---

## 💰 3. Definiciones Económicas
| Concepto | Regla / Detalle |
| :--- | :--- |
| **Moneda** | Pesos o Dólares (definido por subasta, no bimonetaria). |
| **Multa** | 10% del valor ofertado si no se poseen los fondos al pagar. |
| **Seguro** | Contratado por la empresa según valor base; beneficiario es el dueño. |
| **Logística** | Envío a cargo del comprador. Retiro personal pierde cobertura de seguro. |
| **Garantía de Venta** | Si no hay pujas, la empresa compra el bien por el valor base. |

---

## 🚀 4. Plan de Entregas

### 🚩 Entrega 1: Diseño y API
- [ ] Wireframes (5 en alta definición) y paleta de colores.
- [ ] Icono de la app y pantalla de Splash.
- [ ] Documentación de Endpoints (Swagger) con parámetros y códigos de retorno.

### 🚩 Entrega 2: MVP (50%)
- [ ] Backend + Frontend funcionales al 50%.
- [ ] Al menos un circuito completo integrado (Front ↔ Back).
- [ ] Manejo de errores (validaciones, conexión, campos obligatorios).

### 🚩 Entrega 3: Final
- [ ] Aplicación 100% funcional.
- [ ] Backend accesible online y Frontend instalable en dispositivo.
- [ ] Trazabilidad obligatoria entre el diseño inicial y el producto final.

---

## 🗄 5. Integración Técnica
* **Sistema Local**: La app debe consumir y actualizar la base de datos existente (dueños, martilleros, ofertas).
* **Actualización de Datos**: Al vender, actualizar dueño, importes, comisiones y marcar pieza como vendida.