# 📋 SGOHA — Registros de Gestión del Proyecto

Este documento reúne las bitácoras oficiales de control del proyecto **SGOHA**, detallando la gestión integral de riesgos, incidentes reales de desarrollo, impedimentos operativos, registro de defectos (bugs) y supuestos de ingeniería formulados y validados durante la ejecución del ciclo de vida del software.

---

## 1. Registro de Riesgos (Risk Register)
Control sistemático de los eventos de incertidumbre analizados a lo largo de los sprints, detallando la respuesta de gestión basada en PMBOK y el estado final en el cierre.

| Código | Riesgo Identificado | P × I | Nivel de Riesgo | Respuesta PMBOK Aplicada | Estado Final al Cierre |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **R-01** | **Timeout del algoritmo CSP** (Explosión combinatoria por conjuntos grandes que supera 60s). | 4 × 5 | 🔴 Crítico | **Mitigar**: Preprocesar dominios con AC-3, aplicar heurísticas MRV/LCV y limitar a 60s con estado `timeout` y solución parcial. | **Controlado**: El algoritmo resuelve problemas estándar en <2.5 segundos. |
| **R-02** | **Infeasibility por disponibilidad vacía** (Docentes sin bloques registrados bloquean el solver). | 4 × 4 | 🟠 Alto | **Mitigar**: Validaciones a nivel de base de datos/formulario para requerir al menos 1 bloque de disponibilidad activo por docente. | **Controlado**: Módulo de validación de prerrequisitos implementado con éxito. |
| **R-03** | **Solapamiento por matrículas desactualizadas** (Asignar alumnos duplicados en la misma hora). | 3 × 5 | 🟠 Alto | **Mitigar**: Forzar la recarga sincrónica y el mapeo de matrículas activas (`status: enrolled`) antes de procesar el motor CSP. | **Controlado**: Integridad de datos asegurada mediante consultas agregadas. |
| **R-04** | **Pérdida de archivos críticos en repositorio** (Merge incorrecto o eliminación involuntaria de carpetas). | 3 × 4 | 🟠 Alto | **Mitigar**: Implementar Git Flow con protección de rama `main` y revisiones de Pull Request obligatorias. | **Cerrado**: Flujo Git Flow institucionalizado tras el incidente del Sprint 4. |
| **R-05** | **Restricciones de infraestructura cloud gratuita** (Render spin-down y cuotas de BD Atlas). | 3 × 3 | 🟠 Alto | **Aceptar**: Realizar procesos de encendido previo de servidores (*warm-up*) antes de la evaluación y demos finales. | **Controlado**: Rendimiento estable sin sobrecostos para la demo. |
| **R-07** | **Capacidad de aulas insuficiente** (Todos los salones pequeños para un curso masivo). | 2 × 4 | 🟡 Medio | **Mitigar**: Validar consistencia de capacidad vs matrícula en el panel administrativo antes de iniciar el solver. | **Controlado**: Mensaje descriptivo previene la ejecución si el dominio es vacío. |

---

## 2. Registro de Incidentes y Problemas (Issue Log)
Registro histórico de incidencias reales ocurridas durante el desarrollo, los responsables asignados y las acciones correctivas aplicadas.

| Código | Incidencia Real Detectada | Responsable | Prioridad | Impacto en el Proyecto | Acción Correctiva Aplicada |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **I-01** | **Pérdida del directorio `/tests`** en el repositorio remoto por un conflicto de merge forzado. | K. Calderón | Alta | Retrabajo temporal de 4 horas para reconstrucción de las suites Jest. | Restauración de archivos vía historial local Git y habilitación de reglas de protección en la rama `main` de GitHub. |
| **I-02** | **Bloqueo del event loop de Express** (servidor no responde) ante variables CSP no viables. | G. Sánchez | Crítica | El servidor colapsaba requiriendo reinicio manual en local y Render. | Implementación de límites de backtracking con timeout de 60s en `solver.js` y retorno temprano de dominio vacío en `ac3.js`. |
| **I-03** | **Latencia en primera petición HTTP** (hasta 50s) por la suspensión de la base gratuita de Render. | G. Sánchez | Media | Percepción de caída del sistema en pruebas iniciales de integración E2E. | Programación de scripts de consulta automatizados (cron pings) para mantener el backend activo durante periodos de prueba. |

---

## 3. Registro de Impedimentos (Obstacles Log)
Obstáculos técnicos u organizacionales ajenos a la lógica del negocio que limitaron el ritmo del equipo y su resolución ágil.

| Código | Impedimento Técnico / Organizativo | Sprint | Impacto en el Ritmo de Trabajo | Estrategia de Resolución Aplicada |
| :---: | :--- | :---: | :--- | :--- |
| **IMP-01**| **Conflictos de fusión en `package-lock.json`** por versiones dispares de Node.js en las máquinas locales. | Sprint 1 | Detención del desarrollo local y roturas de dependencias al compilar frontend. | Fijar la versión LTS de Node (v18.16.0) en el archivo `package.json` y obligar al uso exclusivo del comando `npm ci` para instalar. |
| **IMP-02**| **Limitación de hardware local** para pruebas de estrés de gran escala (>150 secciones con restricciones). | Sprint 2 | El navegador y Node.js se colgaban por consumo de RAM en simulación. | Dividir las pruebas de estrés en conjuntos acotados y simular generación con sub-bloques horarios controlados. |
| **IMP-03**| **Curva de aprendizaje empinada** con el algoritmo matemático AC-3 y optimización de heurísticas MRV/LCV. | Sprint 2 | Desviación de -3 SP en el plan del Sprint debido al tiempo invertido en investigación. | Sesiones diarias intensivas de Pair Programming y documentación paso a paso en pizarra de la propagación del CSP. |

---

## 4. Registro de Defectos (Bug Tracker)
Bitácora de errores de software detectados en fase de pruebas internas de frontend/backend, indicando la severidad y validación.

| Código | Defecto Detectado | Componente | Severidad | Acción de Corrección Aplicada | Validación de Solución |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **BUG-01**| **Solapamiento docente permitido** por evaluación incorrecta de disponibilidad parcial en bloques. | Backend | Alta | Corrección del operador lógico en la función `teacherNoOverlap` dentro de `constraints.js`. | Suite de prueba unitaria Jest ejecutada con resultado exitoso. |
| **BUG-02**| **Flickering y lag severo** en la matriz de visualización al alternar vistas del panel administrativo. | Frontend | Media | Implementación de `React.memo` para evitar re-renderizados de celdas estáticas de la matriz. | Inspección de FPS con Chrome DevTools (desempeño estable a 60 FPS). |
| **BUG-03**| **Cierre de sesión silencioso** que generaba errores 401 en consola al expirar el JWT sin avisar al usuario. | Frontend | Media | Adición de un interceptor de respuestas en Axios para redirigir al `/login` al recibir estado HTTP 401. | Prueba de simulación de expiración de token en navegador web. |
| **BUG-04**| **Inconsistencia de base de datos** al guardar matrículas vinculadas a IDs inexistentes de alumnos. | BaseDatos | Alta | Adición de esquemas de validación Mongoose tipo `pre-save` para verificar la integridad referencial de los IDs. | Pruebas de integración E2E forzando inserción de datos corruptos (bloqueadas con éxito). |

---

## 5. Registro de Supuestos (Assumptions Log)
Listado de factores que se consideraron verdaderos durante la fase de inicio y planificación, y el resultado de su validación real en la ejecución.

| Código | Supuesto Formulado en la Planificación | Área / Categoría | Validación Real en la Ejecución | Lección o Ajuste Realizado |
| :---: | :--- | :---: | :--- | :--- |
| **S-01** | Los planes gratuitos en la nube (Atlas/Render/Vercel) soportarían la carga de datos del prototipo funcional. | Infraestructura | **Validado**: Los datos reales ocuparon <5MB de almacenamiento y el tráfico en Render no sobrepasó el límite mensual. | Mantener las cuotas gratuitas optimiza los costos operativos al 100%. |
| **S-02** | Las variables y formatos de datos del horario institucional suministrados eran inmutables. | Datos | **Parcialmente Validado**: Se encontraron inconsistencias en estructuras de alumnos, obligando a flexibilizar modelos. | Se debe construir esquemas tolerantes a datos opcionales o formatos variables. |
| **S-03** | El navegador del cliente ejecutaría React sin transpilación especial o pérdida de compatibilidad visual. | Frontend | **Validado**: Se validó compatibilidad en navegadores basados en Chromium, Firefox y WebKit modernos sin fallos. | El estándar ES6+ es universal en navegadores de uso masivo institucional. |
| **S-04** | El límite de 60 segundos de ejecución sería suficiente para problemas complejos de distribución horaria. | Algoritmo | **Validado**: Gracias al filtrado AC-3, el algoritmo encuentra solución o determina inviabilidad en <2.5 segundos. | El preprocesamiento matemático es crucial; reduce el backtracking a niveles triviales. |

---
*Universidad Continental — Taller de Proyectos 2 — 2026*
