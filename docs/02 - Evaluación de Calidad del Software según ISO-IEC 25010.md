# Evaluación de Calidad del Software según ISO/IEC 25010

## 1.1 Introducción
La norma internacional **ISO/IEC 25010** establece un modelo de calidad para productos de software, permitiendo evaluar características relacionadas con el funcionamiento, eficiencia, seguridad, mantenibilidad y experiencia de usuario.

Con la finalidad de garantizar la calidad del **Sistema de Generación Óptima de Horarios Académicos (SGOHA)**, se realizó una evaluación basada en las ocho características principales definidas por la norma ISO/IEC 25010.

## 1.2 Evaluación de Características de Calidad

### 1.2.1 Adecuación Funcional
Esta característica evalúa el grado en que el sistema proporciona funciones que satisfacen los requisitos especificados.

**Cumplimiento en SGOHA:**
- Registro de docentes.
- Registro de cursos.
- Gestión de aulas.
- Configuración de restricciones.
- Generación automática de horarios.
- Consulta y visualización de horarios.

### 1.2.2 Eficiencia del Desempeño
Evalúa la capacidad del sistema para utilizar eficientemente los recursos disponibles.

**Cumplimiento en SGOHA:**
- Uso de algoritmos CSP para optimizar la generación de horarios.
- Consultas optimizadas mediante MongoDB.
- Arquitectura cliente-servidor basada en API REST.
- Procesamiento eficiente de restricciones académicas.

### 1.2.3 Compatibilidad
Determina la capacidad del sistema para interactuar con otros componentes o plataformas.

**Cumplimiento en SGOHA:**
- Compatibilidad con navegadores modernos.
- API REST para futuras integraciones.
- Intercambio de información mediante JSON.
- Arquitectura preparada para interoperabilidad.

### 1.2.4 Usabilidad
Evalúa la facilidad de aprendizaje y utilización del sistema por parte de los usuarios.

**Cumplimiento en SGOHA:**
- Interfaz gráfica desarrollada con React.
- Navegación intuitiva.
- Formularios estructurados.
- Organización clara de módulos administrativos.

### 1.2.5 Fiabilidad
Mide la capacidad del sistema para mantener un funcionamiento correcto bajo condiciones definidas.

**Cumplimiento en SGOHA:**
- Validación de datos ingresados.
- Control de errores en backend.
- Gestión adecuada de excepciones.
- Protección frente a inconsistencias de horarios.

### 1.2.6 Seguridad
Evalúa la protección de la información y de los recursos del sistema.

**Cumplimiento en SGOHA:**
- Autenticación mediante JWT.
- Gestión de sesiones seguras.
- Protección de rutas privadas.
- Validación de permisos de acceso.
- Cifrado de contraseñas mediante bcrypt.

### 1.2.7 Mantenibilidad
Determina la facilidad para modificar, corregir o ampliar el sistema.

**Cumplimiento en SGOHA:**
- Arquitectura modular.
- Separación entre frontend y backend.
- Uso de control de versiones mediante Git.
- Organización por componentes y servicios.

### 1.2.8 Portabilidad
Evalúa la facilidad para transferir el sistema entre distintos entornos.

**Cumplimiento en SGOHA:**
- Implementación basada en tecnologías web.
- Compatibilidad con sistemas operativos modernos.
- Posibilidad de despliegue en servidores Linux o Windows.
- Uso de contenedores Docker para futuras implementaciones.

## 1.3 Matriz de Evaluación ISO/IEC 25010

| Característica | Nivel de Cumplimiento | Evidencia |
| :--- | :---: | :--- |
| **Adecuación Funcional** | Alto | Gestión académica completa |
| **Eficiencia del Desempeño** | Alto | Algoritmo CSP y MongoDB |
| **Compatibilidad** | Alto | API REST y JSON |
| **Usabilidad** | Alto | Interfaz React |
| **Fiabilidad** | Alto | Validaciones y manejo de errores |
| **Seguridad** | Alto | JWT y bcrypt |
| **Mantenibilidad** | Alto | Arquitectura modular |
| **Portabilidad** | Alto | Aplicación web multiplataforma |

## 1.4 Conclusiones de la Evaluación
La evaluación realizada bajo los criterios de la norma ISO/IEC 25010 demuestra que SGOHA presenta un alto nivel de calidad en las principales características definidas para productos de software. La arquitectura implementada, el uso de tecnologías modernas y la aplicación de buenas prácticas de desarrollo permiten garantizar un sistema confiable, seguro, eficiente y preparado para futuras ampliaciones.

Asimismo, la solución contribuye a optimizar el proceso de generación de horarios académicos, reduciendo errores operativos y mejorando la gestión institucional mediante herramientas tecnológicas escalables y sostenibles.
