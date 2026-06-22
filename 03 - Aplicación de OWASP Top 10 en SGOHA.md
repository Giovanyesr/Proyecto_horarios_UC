# Aplicación de OWASP Top 10 en SGOHA

## 1.1 Introducción
La seguridad constituye un aspecto fundamental en el desarrollo de aplicaciones web modernas. Para garantizar la protección de la información académica y administrativa gestionada por el **Sistema de Generación Óptima de Horarios Académicos (SGOHA)**, se han considerado las recomendaciones establecidas por el proyecto **OWASP** (Open Web Application Security Project), específicamente las vulnerabilidades identificadas en el **OWASP Top 10**.

Estas prácticas permiten reducir riesgos asociados al acceso no autorizado, manipulación de datos, exposición de información sensible y otras amenazas comunes en sistemas web.

## 1.2 Medidas de Seguridad Implementadas

### A01: Broken Access Control (Control de Acceso Deficiente)
Esta vulnerabilidad ocurre cuando usuarios no autorizados pueden acceder a recursos restringidos.

**Implementación en SGOHA:**
- Protección de rutas privadas mediante middleware de autenticación.
- Verificación de roles y permisos.
- Restricción de acceso a funcionalidades administrativas.
- Validación de sesiones activas.

**Resultado:** Riesgo mitigado.

### A02: Cryptographic Failures (Fallas Criptográficas)
Se refiere a la exposición de información sensible debido a mecanismos de cifrado inadecuados.

**Implementación en SGOHA:**
- Cifrado de contraseñas mediante bcrypt.
- Uso de JWT para autenticación segura.
- Protección de credenciales almacenadas.

**Resultado:** Riesgo mitigado.

### A03: Injection (Inyección)
Las inyecciones permiten ejecutar consultas maliciosas sobre bases de datos o sistemas internos.

**Implementación en SGOHA:**
- Validación de datos recibidos desde formularios.
- Uso de consultas parametrizadas.
- Sanitización de entradas del usuario.
- Restricción de caracteres no permitidos.

**Resultado:** Riesgo mitigado.

### A04: Insecure Design (Diseño Inseguro)
Se presenta cuando la arquitectura del sistema no contempla controles de seguridad desde el diseño.

**Implementación en SGOHA:**
- Arquitectura multicapa.
- Separación de responsabilidades.
- Control centralizado de autenticación.
- Gestión segura de sesiones.

**Resultado:** Riesgo mitigado.

### A05: Security Misconfiguration (Configuración Incorrecta)
Ocurre cuando servidores, bases de datos o aplicaciones presentan configuraciones inseguras.

**Implementación en SGOHA:**
- Variables sensibles almacenadas en archivos de entorno (`.env`).
- Configuración centralizada del backend.
- Ocultamiento de credenciales.
- Gestión controlada de configuraciones.

**Resultado:** Riesgo mitigado.

### A06: Vulnerable and Outdated Components (Componentes Vulnerables)
Se refiere al uso de librerías o dependencias con vulnerabilidades conocidas.

**Implementación en SGOHA:**
- Uso de dependencias mantenidas por la comunidad.
- Actualización periódica mediante npm.
- Revisión de vulnerabilidades con `npm audit`.

**Resultado:** Riesgo mitigado parcialmente.

### A07: Identification and Authentication Failures
Se produce cuando los mecanismos de autenticación son débiles.

**Implementación en SGOHA:**
- Inicio de sesión mediante credenciales validadas.
- Tokens JWT con expiración.
- Contraseñas cifradas.
- Protección de sesiones.

**Resultado:** Riesgo mitigado.

### A08: Software and Data Integrity Failures
Está relacionado con modificaciones no autorizadas de software o datos.

**Implementación en SGOHA:**
- Control de versiones mediante Git.
- Registro de cambios del proyecto.
- Integridad de dependencias verificadas.

**Resultado:** Riesgo mitigado.

### A09: Security Logging and Monitoring Failures
Se refiere a la falta de monitoreo y registro de eventos de seguridad.

**Implementación en SGOHA:**
- Registro de errores en backend.
- Seguimiento de excepciones.
- Monitoreo de eventos críticos.

**Resultado:** Riesgo mitigado parcialmente.

### A10: Server-Side Request Forgery (SSRF)
Permite que un atacante fuerce al servidor a realizar solicitudes no autorizadas.

**Implementación en SGOHA:**
- Restricción de URLs externas.
- Validación de solicitudes entrantes.
- Control de acceso a recursos internos.

**Resultado:** Riesgo mitigado.

## 1.3 Matriz de Cumplimiento OWASP Top 10

| Vulnerabilidad OWASP | Estado |
| :--- | :--- |
| **A01** Control de Acceso Deficiente | Cumple |
| **A02** Fallas Criptográficas | Cumple |
| **A03** Inyección | Cumple |
| **A04** Diseño Inseguro | Cumple |
| **A05** Configuración Incorrecta | Cumple |
| **A06** Componentes Vulnerables | Parcial |
| **A07** Fallas de Autenticación | Cumple |
| **A08** Integridad de Software y Datos | Cumple |
| **A09** Monitoreo y Registro | Parcial |
| **A10** SSRF | Cumple |

## 1.4 Conclusiones
La evaluación realizada demuestra que **SGOHA** incorpora mecanismos de seguridad alineados con las recomendaciones de **OWASP Top 10**. La utilización de autenticación basada en JWT, cifrado de contraseñas, validación de entradas, control de acceso y buenas prácticas de configuración contribuyen significativamente a reducir los riesgos de seguridad más comunes en aplicaciones web.

Asimismo, se recomienda continuar fortaleciendo los mecanismos de monitoreo, auditoría y actualización de dependencias para mantener un nivel adecuado de protección frente a nuevas amenazas y vulnerabilidades emergentes.
