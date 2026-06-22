# Análisis de Soluciones Similares

## 1.1 Introducción
Antes de desarrollar el **Sistema de Generación Óptima de Horarios Académicos (SGOHA)**, se realizó un análisis de diversas soluciones existentes utilizadas para la planificación automática de horarios académicos. Este análisis permitió identificar funcionalidades relevantes, ventajas, limitaciones y oportunidades de mejora que sirvieron como referencia para el diseño de la propuesta. 

La generación de horarios académicos constituye un problema complejo de optimización debido a la gran cantidad de restricciones involucradas, tales como disponibilidad docente, capacidad de aulas, distribución de cursos y conflictos horarios. Por ello, múltiples instituciones educativas utilizan sistemas especializados para automatizar este proceso.

## 1.2 FET Timetabling
**FET** es una herramienta de código abierto ampliamente utilizada para la generación automática de horarios en instituciones educativas. Emplea algoritmos basados en técnicas de satisfacción de restricciones (*Constraint Satisfaction Problem - CSP*), permitiendo definir una gran variedad de reglas y condiciones para la construcción de horarios.

**Ventajas:**
- Gratuito y de código abierto.
- Permite gestionar múltiples restricciones.
- Compatible con diversos niveles educativos.
- Amplia comunidad de usuarios.

**Desventajas:**
- Interfaz gráfica limitada.
- Curva de aprendizaje elevada.
- Escasa personalización visual.
- No está orientado específicamente a universidades peruanas.

## 1.3 aSc Timetables
**aSc Timetables** es una solución comercial utilizada en colegios y universidades para automatizar la programación académica. Permite gestionar docentes, aulas, cursos y restricciones complejas mediante asistentes gráficos.

**Ventajas:**
- Interfaz intuitiva.
- Generación rápida de horarios.
- Reportes automáticos.
- Soporte técnico especializado.

**Desventajas:**
- Requiere licencia de pago.
- Dependencia del proveedor.
- Limitaciones para personalizaciones avanzadas.

## 1.4 Untis
**Untis** es una plataforma internacional orientada a la gestión integral de horarios académicos, control de asistencia y planificación institucional.

**Ventajas:**
- Solución robusta y consolidada.
- Integración con múltiples módulos.
- Gestión eficiente de recursos académicos.
- Escalabilidad institucional.

**Desventajas:**
- Alto costo de implementación.
- Complejidad de configuración.
- Requiere capacitación especializada.

## 1.5 Horarios UC (Situación Actual)
Actualmente, en muchas instituciones educativas, la elaboración de horarios continúa realizándose mediante hojas de cálculo, documentos compartidos o procesos manuales desarrollados por personal administrativo.

**Ventajas:**
- Bajo costo inicial.
- Fácil acceso mediante herramientas comunes.

**Desventajas:**
- Mayor probabilidad de errores.
- Duplicidad de horarios.
- Conflictos entre docentes y aulas.
- Elevado tiempo de planificación.
- Dificultad para realizar modificaciones.

## 1.6 Comparación de Soluciones

| Característica | FET | aSc Timetables | Untis | SGOHA |
| :--- | :--- | :--- | :--- | :--- |
| **Generación automática** | Sí | Sí | Sí | **Sí** |
| **Basado en restricciones** | Sí | Sí | Sí | **Sí** |
| **Código abierto** | Sí | No | No | **Sí** |
| **Personalización universitaria** | Limitada | Media | Media | **Alta** |
| **Adaptado a la Universidad Continental** | No | No | No | **Sí** |
| **Arquitectura Web Moderna** | Parcial | Sí | Sí | **Sí** |
| **Backend API REST** | No | Limitado | Sí | **Sí** |
| **Integración futura con IA** | No | Limitada | Limitada | **Sí** |

## 1.7 Aporte Diferenciador de SGOHA
A diferencia de las soluciones analizadas, **SGOHA** ha sido diseñado específicamente para atender las necesidades de programación académica universitaria, considerando la realidad operativa de la Universidad Continental.

La propuesta incorpora una arquitectura web moderna basada en **React, Node.js, Express y MongoDB**, permitiendo escalabilidad, mantenibilidad y facilidad de integración con futuras tecnologías. Asimismo, utiliza algoritmos CSP para optimizar la asignación de horarios minimizando conflictos entre docentes, cursos y ambientes académicos.

El principal valor agregado de **SGOHA** radica en su capacidad de adaptación a requerimientos institucionales específicos, ofreciendo una solución flexible, escalable y económicamente viable para la automatización de la gestión horaria académica.
