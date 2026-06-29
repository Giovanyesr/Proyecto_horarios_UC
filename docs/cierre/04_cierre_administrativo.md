# 📂 SGOHA — Acta de Cierre Administrativo y Validación Contractual

Este documento constituye el **Acta de Cierre Administrativo** oficial del proyecto **Sistema de Generación Óptima de Horarios Académicos (SGOHA)**. En él se realiza la evaluación final de cumplimiento de los requisitos de alto nivel definidos en el [PROJECT CHARTER.md](file:///D:/Proyecto_horarios_UC/docs/PROJECT%20CHARTER.md) y se valida la Declaración de Trabajo (SOW) y la matriz de trazabilidad frente a los entregables de software construidos en la asignatura de Taller de Proyectos 2 de la Universidad Continental (2026).

---

## 1. Evaluación de Requisitos de Alto Nivel (Project Charter)
A continuación, se detalla la verificación de cumplimiento de los objetivos y requerimientos de alto nivel que fueron formalizados en el Acta de Constitución original del proyecto:

| Requisito de Alto Nivel | Estado final | Entregable Técnico / Evidencia | Observación y Justificación de Cierre |
| :--- | :---: | :--- | :--- |
| **R-Charter-01: Registro de Docentes, Cursos y Aulas** | **Cumplido** | [backend/src/models](file:///D:/Proyecto_horarios_UC/backend/src/models), CRUDs del panel administrador en frontend. | Módulos funcionales de persistencia MongoDB y formularios React con control de validación de campos. |
| **R-Charter-02: Definición de Disponibilidades y Restricciones** | **Cumplido** | `availability` en esquema de base de datos y [constraints.js](file:///D:/Proyecto_horarios_UC/backend/src/csp/constraints.js). | Implementado en frontend mediante interfaz interactiva para alumnos y parametrización de reglas en backend. |
| **R-Charter-03: Generación Automática de Horarios** | **Cumplido** | Algoritmo AC-3 y Backtracking en [solver.js](file:///D:/Proyecto_horarios_UC/backend/src/csp/solver.js). | Motor CSP completo implementando MRV, LCV y Forward Checking. Generación de horarios válidos en <2.5 segundos. |
| **R-Charter-04: Detección de Conflictos** | **Cumplido** | Función `isConsistent` en [constraints.js](file:///D:/Proyecto_horarios_UC/backend/src/csp/constraints.js). | El motor rechaza solapamientos de docentes, aulas o estudiantes matriculados de forma determinista y reporta inviabilidad. |
| **R-Charter-05: Visualización de Horarios por Criterios** | **Cumplido** | Calendarios en frontend y vistas cruzadas. | Vistas de horario semanal estructuradas para el rol de administrador y portal específico para el alumno. |
| **R-Charter-06: Exportación de Horarios** | **Cumplido Parcial** | Intercambio y estructuración de JSON en la API REST. | Se implementó el intercambio estructurado de JSON. La exportación nativa a PDF/Excel (`HU-16`) fue postergada debido a re-priorización. |

### Justificación de Desviación en Exportación (HU-16)
De acuerdo con las métricas ágiles documentadas, la `HU-16` (2 SP) fue excluida del MVP para priorizar el correcto funcionamiento matemático del algoritmo CSP y la cobertura de pruebas de las restricciones duras. Esta decisión fue aprobada formalmente en la reunión de planificación del Sprint 4 para asegurar la correctitud del core del software sobre funciones accesorias.

---

## 2. Validación Contractual de la Declaración de Trabajo (SOW)
La Declaración de Trabajo (SOW) para el Taller de Proyectos 2 requería la entrega de un prototipo full-stack completamente funcional de nivel comercial, respaldado por documentación de especificación técnica y de calidad.

### Estado de Entregables Contractuales

1.  **Código Fuente del Sistema de Software:**
    *   **Backend REST API:** Escrito en Node.js y Express con autenticación JWT robusta, subido al repositorio [D:\Proyecto_horarios_UC\backend](file:///D:/Proyecto_horarios_UC/backend).
    *   **Frontend SPA:** Construido en React 18, TypeScript, Tailwind CSS y Zustand, ubicado en [D:\Proyecto_horarios_UC\frontend](file:///D:/Proyecto_horarios_UC/frontend).
    *   **Base de Datos:** Estructurada en esquemas relacionales MongoDB vía Mongoose ODM.
2.  **Documentación Técnica e Informes de Calidad:**
    *   **Análisis del CSP y Restricciones:** Contratado e inmutable en [constitution.md](file:///D:/Proyecto_horarios_UC/docs/3.4.a.1Constitucion.md).
    *   **Especificación de Requerimientos:** Detallada en [DOCUMENTO DE REQUERIMIENTOS.md](file:///D:/Proyecto_horarios_UC/docs/DOCUMENTO DE REQUERIMIENTOS.md) y casos de uso en `Spec.md`.
    *   **Evaluación de Calidad ISO/IEC 25010:** Evidenciada con calificación Alta en [02 - Evaluación de Calidad del Software según ISO-IEC 25010.md](file:///D:/Proyecto_horarios_UC/docs/02 - Evaluación de Calidad del Software según ISO-IEC 25010.md).
    *   **Análisis de Código Estático (SonarQube):** Reportado como **PASSED** con cobertura de 92.08% según la configuración de [sonar-project.properties](file:///D:/Proyecto_horarios_UC/sonar-project.properties).
3.  **Seguridad y Pruebas:**
    *   **OWASP Top 10:** Seguridad validada en [03 - Aplicación de OWASP Top 10 en SGOHA.md](file:///D:/Proyecto_horarios_UC/docs/03 - Aplicación de OWASP Top 10 en SGOHA.md).
    *   **Suite TDD:** 55 pruebas unitarias automatizadas ejecutándose con éxito en Jest.

*Conclusión Contractual:* El equipo de desarrollo (Sanchez Ramos, Giovany y Calderon Aliaga, Kenedy) ha cumplido con la entrega del 100% de los artefactos de software principales y la documentación estipulada en los términos del curso.

---

## 3. Matriz de Trazabilidad de Entregables Finales
La siguiente tabla asocia las funcionalidades del sistema comprometidas con los entregables de software generados en las carpetas físicas del proyecto:

| Módulo del Alcance | Caso de Uso Asociado | Especificación de Diseño | Archivos Código Fuente Relacionados | Validación y Test Automático |
| :--- | :---: | :--- | :--- | :--- |
| **Seguridad de Acceso** | CU-01: Autenticación | [Especificacion_Tecnica_SGOHA.md](file:///D:/Proyecto_horarios_UC/docs/Especificacion_Tecnica_SGOHA.md) | `backend/src/routes/auth.js`, `backend/src/middleware/auth.js` | Prueba unitaria de firma y validación de tokens JWT. |
| **Administración Académica** | CU-02 a CU-05: CRUDs | [DOCUMENTO DE REQUERIMIENTOS.md](file:///D:/Proyecto_horarios_UC/docs/DOCUMENTO DE REQUERIMIENTOS.md) | `backend/src/controllers/`, `backend/src/models/` (docentes/cursos/aulas) | Validación de operaciones CRUD Mongoose en base de datos. |
| **Motor Algorítmico CSP** | CU-06: Generación | [constitution.md](file:///D:/Proyecto_horarios_UC/docs/3.4.a.1Constitucion.md) | `backend/src/csp/ac3.js`, `backend/src/csp/solver.js` | 55 pruebas automatizadas en `backend/tests/` (cobertura 92%). |
| **Interfaz Administrador** | CU-07: Control Panel | [Evidencias del Prototipo.md](file:///D:/Proyecto_horarios_UC/docs/08 - Evidencias del Prototipo.md) | `frontend/src/pages/admin/` | Pruebas visuales funcionales y de rendimiento a 60 FPS. |
| **Portal del Estudiante** | CU-08: Portal Alumno | [Especificacion_Tecnica_SGOHA.md](file:///D:/Proyecto_horarios_UC/docs/Especificacion_Tecnica_SGOHA.md) | `frontend/src/pages/student/` | Pruebas de usabilidad para asignación de disponibilidad. |

---

## 4. Liberación de Recursos y Aceptación Final
Habiéndose completado las pruebas unitarias, el análisis estático de código SonarQube, la documentación de cierre y las revisiones por pares:
*   Se declaran cerradas las actividades de desarrollo del sistema SGOHA en su versión de entrega `v1.1`.
*   El código fuente se encuentra consolidado en la rama principal `main` del repositorio de GitHub bajo un flujo de desarrollo protegido.
*   Se autoriza la liberación de los recursos del equipo de desarrollo, quedando listos para la fase de sustentación ante el jurado evaluador.

### Firmas de Aceptación y Conformidad

```
__________________________________
Docente / Product Owner
Mg. Daniel Gamarra Moreno
Universidad Continental (2026)

__________________________________
Full-Stack Developer / Scrum Master
Sanchez Ramos, Giovany
Integrante del Equipo de Desarrollo

__________________________________
Full-Stack Developer / QA Engineer
Calderon Aliaga, Kenedy
Integrante del Equipo de Desarrollo
```

---
*Universidad Continental — Ingeniería de Sistemas e Informática — Taller de Proyectos 2 — 2026*
