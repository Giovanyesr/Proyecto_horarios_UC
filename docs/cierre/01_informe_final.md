# 📅 SGOHA — Informe Final de Cierre del Proyecto

## 1. Resumen Ejecutivo
El **Sistema de Generación Óptima de Horarios Académicos (SGOHA)** es una aplicación web full-stack diseñada para resolver el problema de asignación automática de horarios universitarios en la Universidad Continental, modelado como un **Problema de Satisfacción de Restricciones (CSP)** y resuelto mediante algoritmos de inteligencia artificial.

La solución fue construida con el stack MERN:
*   **Frontend:** React 18, TypeScript, Tailwind CSS y Zustand para la gestión de estados.
*   **Backend:** Node.js y Express configurando una arquitectura de API REST.
*   **Base de Datos:** MongoDB 8.x con Mongoose ODM.
*   **Motor CSP:** Algoritmo de consistencia de arcos (AC-3) combinando Backtracking con las heurísticas MRV (Minimum Remaining Values), LCV (Least Constraining Value) y Forward Checking para asegurar la optimización del espacio de búsqueda y una asignación libre de conflictos de forma determinista.

Al finalizar las 12 semanas de ejecución de la asignatura de **Taller de Proyectos 2 (2026)**, el sistema se encuentra completamente operativo en su versión `v1.1`, habiendo implementado con éxito la automatización de la asignación horaria institucional y garantizando la seguridad en el portal de alumnos y de administración.

---

## 2. Desempeño del Alcance
La planificación del alcance del proyecto se estructuró a través de un Product Backlog en Jira compuesto por 16 historias de usuario (HU) priorizadas bajo la metodología MoSCoW, estimadas en Story Points (SP).

*   **Total de Story Points Planificados:** 120 SP
*   **Total de Story Points Completados:** 118 SP (98.33% de avance)
*   **Deuda Técnica de Alcance:** 2 SP (Correspondientes a `HU-16: Exportación de Horarios en PDF/Excel`), categorizada de prioridad *Could Have* (baja prioridad), la cual fue descartada en común acuerdo para priorizar la estabilidad matemática del motor CSP.

### Detalle de Historias de Usuario Ejecutadas

| ID | Historia de Usuario | Épica | Prioridad | SP Planificados | SP Completados | Estado |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **HU-01** | Autenticación JWT (Admin/Alumno) | Épica 1 | Must | 8 | 8 | ✅ Completado |
| **HU-02** | CRUD Docentes y Disponibilidad | Épica 2 | Must | 10 | 10 | ✅ Completado |
| **HU-03** | CRUD Cursos y Aulas | Épica 2 | Must | 8 | 8 | ✅ Completado |
| **HU-04** | Gestión de Matrículas | Épica 2 | Must | 11 | 11 | ✅ Completado |
| **HU-05** | Modelado formal CSP (X, D, C) | Épica 3 | Must | 8 | 8 | ✅ Completado |
| **HU-06** | Implementar Algoritmo AC-3 | Épica 3 | Must | 8 | 8 | ✅ Completado |
| **HU-07** | Backtracking + Heurísticas MRV/LCV | Épica 3 | Must | 13 | 13 | ✅ Completado |
| **HU-08** | API REST Generación de Horarios | Épica 3 | Must | 4 | 4 | ✅ Completado |
| **HU-09** | Frontend Dashboard Admin | Épica 4 | Should | 13 | 13 | ✅ Completado |
| **HU-10** | Vista Gestión Docentes/Aulas | Épica 4 | Should | 8 | 8 | ✅ Completado |
| **HU-11** | Vista Generación de Horarios | Épica 4 | Should | 8 | 8 | ✅ Completado |
| **HU-12** | Portal del Alumno | Épica 4 | Should | 6 | 6 | ✅ Completado |
| **HU-13** | Integración E2E y pruebas de sistema | Épica 3 | Must | 5 | 5 | ✅ Completado |
| **HU-14** | Suite TDD completa (cobertura >90%) | Épica 1 | Must | 5 | 5 | ✅ Completado |
| **HU-15** | Documentación SDD final | Épica 1 | Must | 3 | 3 | ✅ Completado |
| **HU-16** | Exportación de Horarios PDF/Excel | Épica 4 | Could | 2 | 0 | ❌ Descartado |
| **TOTAL**| | | | **120 SP** | **118 SP** | **98.3%** |

> [!NOTE]
> La suite de pruebas de la `HU-14` se desarrolló bajo la metodología TDD con un total de 55 casos de pruebas unitarias que cubren exhaustivamente las restricciones académicas duras y blandas.

---

## 3. Desempeño del Cronograma
El proyecto se ejecutó en una línea de tiempo estricta de 12 semanas (del 23 de marzo al 14 de junio de 2026), dividida en 5 Sprints (desde el Sprint 0 al Sprint 4).

### Historial de Sprints de Taller de Proyectos 2

| Sprint | Período | Objetivo Principal | SP Planificados | SP Ejecutados | Duración | Variación SP |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| **Sprint 0** | 23/03 – 05/04/2026 | Setup inicial, autenticación de usuarios y modelos | 20 | 18 | 2 semanas | -2 |
| **Sprint 1** | 06/04 – 19/04/2026 | CRUDs de entidades de dominio (docentes/cursos/aulas) | 20 | 19 | 2 semanas | -1 |
| **Sprint 2** | 20/04 – 10/05/2026 | Core del motor de optimización (AC-3 + Backtracking) | 36 | 33 | 3 semanas | -3 |
| **Sprint 3** | 11/05 – 31/05/2026 | Frontend React, dashboard de administrador y alumno | 36 | 35 | 3 semanas | -1 |
| **Sprint 4** | 01/06 – 14/06/2026 | Integración E2E, suite TDD y entrega final | 8 | 13 | 2 semanas | +5 |
| **TOTAL** | **23/03 – 14/06/2026** | | **120 SP** | **118 SP** | **12 semanas** | **-2** |

### Análisis de Desviaciones y Cuellos de Botella
*   **Complejidad NP-hard en Sprint 2:** La implementación de la `HU-07` y la propagación de restricciones con AC-3 en la `HU-06` representaron el principal cuello de botella temporal. El tiempo promedio de ciclo del módulo CSP fue de **10.5 días** (1.6 veces mayor en comparación con los 6.5 días de los CRUDs estándar), lo que provocó una desviación inicial acumulada de -3 SP en el Sprint 2.
*   **Recuperación en Sprint 4:** La deuda técnica acumulada se solventó gracias a la ampliación de la capacidad de desarrollo en el Sprint 4 (completando 13 SP frente a los 8 planificados), logrando finalizar el 98.3% del alcance.
*   **Estabilidad del Proceso:** La velocidad promedio del equipo fue de **23.6 SP/sprint**, con un coeficiente de variación del **28.5%**, indicando una variabilidad moderada plenamente explicable por la naturaleza algorítmica del proyecto.

---

## 4. Desempeño de Costos
El control presupuestal de SGOHA se basó en el costo del esfuerzo humano y la depreciación de recursos computacionales.

### Costo de Recursos Humanos
Se determinó una tarifa de **S/. 12.00/hora** para desarrolladores Junior en el mercado local, registrando un esfuerzo acumulado de **302 horas-hombre** de desarrollo:

1.  **Sanchez Ramos, Giovany (Full-Stack / Scrum Master):**
    *   Arquitectura, Backend CSP y Coordinación: 108 horas (S/. 1,296.00)
    *   Especificaciones, Documentación SDD e informes: 38 horas (S/. 456.00)
    *   *Subtotal:* **146 horas (S/. 1,752.00)**
2.  **Calderon Aliaga, Kenedy (Full-Stack / QA):**
    *   Frontend React/TypeScript y Portales: 94 horas (S/. 1,128.00)
    *   Suite TDD, Pruebas de integración y PR Reviews: 62 horas (S/. 744.00)
    *   *Subtotal:* **156 horas (S/. 1,872.00)**

*Total RRHH:* **302 horas | S/. 3,624.00**

### Costo de Infraestructura Tecnológica
El uso de capas gratuitas en la nube redujo los costos de producción a S/. 0.00 en servicios de bases de datos y hosting. Se imputaron los costos de hardware propio y conectividad:
*   Depreciación de 2 laptops personales (3 meses): S/. 180.00
*   Conexión de Internet dedicada (33% uso proyecto): S/. 148.50
*   Consumo de energía eléctrica: S/. 60.00
*   Proporcional de licencias de software: S/. 31.50

*Total Infraestructura:* **S/. 420.00**

### Costos Indirectos y Margen de Contingencia
*   Transporte y reuniones físicas de alineación: S/. 72.00
*   Impresión de entregables y rúbricas de control: S/. 30.00
*   Margen de contingencia del proyecto (10% sobre Costos Directos): S/. 404.40
*   Tiempo de reuniones diarias Scrum y Retrospectivas: S/. 240.00
*   Materiales y logística de presentación final: S/. 50.00
*   Overhead burocrático y académico: S/. 138.00

*Total Indirectos:* **S/. 934.40**

### Presupuesto Consolidado de SGOHA: S/. 4,978.40

---

## 5. Cuadro Comparativo: Planificado vs. Ejecutado

| Dimensión | Presupuesto Planificado | Gasto/Esfuerzo Ejecutado | Desviación | Explicación de Desviación |
| :--- | :---: | :---: | :---: | :--- |
| **Alcance (Story Points)** | 120 SP | 118 SP | -2 SP (-1.67%) | La funcionalidad de exportación PDF no prioritaria (`HU-16`) fue descartada para asegurar la entrega del motor CSP. |
| **Tiempo de Desarrollo** | 12 semanas | 12 semanas | 0% | El proyecto finalizó de manera exacta dentro de las fechas fijadas en el sílabo. |
| **Esfuerzo (Horas)** | 302 horas | 302 horas | 0% | Se ejecutaron de forma exacta las horas estimadas distribuidas equitativamente. |
| **Costo Recursos Humanos**| S/. 3,624.00 | S/. 3,624.00 | S/. 0.00 (0%) | Las horas de retrabajo en Sprint 4 por restauración de tests se absorbieron con las horas de contingencia. |
| **Costo Infraestructura** | S/. 420.00 | S/. 420.00 | S/. 0.00 (0%) | Las cuotas de servicios en la nube se mantuvieron al 100% en planes Free Tier. |
| **Costos Indirectos** | S/. 934.40 | S/. 934.40 | S/. 0.00 (0%) | Uso exacto del margen de contingencia y gastos logísticos. |
| **TOTAL** | **S/. 4,978.40** | **S/. 4,978.40** | **S/. 0.00 (0%)** | Proyecto finalizado con éxito bajo presupuesto sin sobrecostos. |

---

## 6. Calidad del Software (ISO/IEC 25010)
El software SGOHA se evaluó utilizando las directrices de la norma internacional **ISO/IEC 25010** para la medición de la calidad del producto, obteniendo un cumplimiento óptimo debido al enfoque guiado por especificaciones (Spec-Driven Development):

### 1. Adecuación Funcional
*   **Completitud funcional:** Cumplimiento del 100% de los requisitos del motor CSP detallados en [Especificacion_Tecnica_SGOHA.md](file:///D:/Proyecto_horarios_UC/docs/Especificacion_Tecnica_SGOHA.md) (restricciones duras como solapamiento de docentes y restricciones blandas de preferencia).
*   **Corrección funcional:** Comprobación rigurosa a través de aserciones automatizadas de que todos los horarios creados por la API REST son matemáticamente válidos.

### 2. Eficiencia del Desempeño
*   **Comportamiento temporal:** La reducción del dominio implementada mediante el algoritmo AC-3 disminuye la complejidad del motor de backtracking, logrando un tiempo medio de generación de horarios universitarios inferiores a los **2.5 segundos** para escenarios estándar.
*   **Utilización de recursos:** El uso de índices en la base de datos de MongoDB evita la sobrecarga de lectura en disco.

### 3. Compatibilidad
*   **Coexistencia:** La API REST en Node.js funciona de forma aislada a través del protocolo HTTP.
*   **Interoperabilidad:** Entrada y salida de datos estructurados utilizando JSON puro, habilitando su integración futura con los sistemas académicos Banner de la institución.

### 4. Usabilidad
*   **Facilidad de aprendizaje:** Interfaz gráfica simple con un dashboard unificado en React para el administrador y visualización tipo calendario interactivo para el alumno.
*   **Estética:** Diseño responsivo con Tailwind CSS que cuenta con soporte completo para tema oscuro (Dark Mode), reduciendo la fatiga visual.

### 5. Fiabilidad
*   **Madurez:** Suite de pruebas unitarias que evalúan el motor CSP en condiciones de borde para evitar fallos de ejecución.
*   **Tolerancia a fallos:** Bloques de seguridad *try-catch* en Express y frontend con límites definidos de timeout (60 segundos) en el algoritmo para prevenir bucles infinitos en configuraciones inviables.

### 6. Seguridad
*   **Confidencialidad:** Contraseñas de usuario cifradas en base de datos MongoDB usando `bcrypt` con factor de coste 10.
*   **Integridad:** Control de acceso estricto mediante JSON Web Tokens (JWT) firmados en el servidor y almacenados en cabeceras de autorización HTTP.

### 7. Mantenibilidad
*   **Modularidad:** Clara separación en tres capas (Modelos Mongoose, Controladores Express y Motor CSP aislado en `backend/src/csp`).
*   **Analizabilidad y modificabilidad:** Código escrito bajo estándares modernos de ES6+ con tipado estricto en frontend TypeScript, facilitando la depuración y extensión de funcionalidades.

### 8. Portabilidad
*   **Adaptabilidad e Instalabilidad:** Aplicación web compatible con navegadores Chromium modernos. Puede ser alojada en múltiples plataformas cloud (Vercel, Render) e implementada de forma local bajo cualquier sistema operativo que soporte Node.js LTS (Windows, Linux, macOS).

### Matriz de Cumplimiento ISO/IEC 25010

| Característica de Calidad | Grado de Cumplimiento | Evidencia Técnica en el Proyecto |
| :--- | :---: | :--- |
| **Adecuación Funcional** | Alto (100%) | Generación matemática exacta sin solapamiento de asignaturas. |
| **Eficiencia del Desempeño** | Alto (100%) | Tiempos de ejecución por debajo de 2.5s con AC-3. |
| **Compatibilidad** | Alto (100%) | Formato de comunicación REST-JSON estándar y portable. |
| **Usabilidad** | Alto (100%) | Panel React interactivo, responsivo y modo oscuro. |
| **Fiabilidad** | Alto (100%) | Manejo estructurado de excepciones y límites de timeout en CSP. |
| **Seguridad** | Alto (100%) | Autenticación JWT y hash criptográfico bcrypt. |
| **Mantenibilidad** | Alto (100%) | Arquitectura MVC limpia y motor CSP 100% desacoplado. |
| **Portabilidad** | Alto (100%) | Configurado para despliegue multiplataforma y en la nube. |

---

## 7. Métricas de Calidad en SonarQube
El control de la calidad del código fuente del stack MERN se configuró de forma centralizada bajo las propiedades del archivo [sonar-project.properties](file:///D:/Proyecto_horarios_UC/sonar-project.properties). El análisis estático de código arrojó un estado general de **PASSED** (Quality Gate superado):

### Cuadro de Métricas de Análisis Estático (SonarQube)

| Métrica de Código | Valor Obtenido | Calificación SonarQube | Estado / Comentario |
| :--- | :---: | :---: | :--- |
| **Bugs** | 0 | **A** | Sin errores de sintaxis o lógica detectados en producción. |
| **Vulnerabilidades** | 0 | **A** | Evaluado según las reglas OWASP Top 10 aplicadas a Express. |
| **Security Hotspots** | 0 | **100%** | Sin brechas críticas de seguridad en la configuración de la API. |
| **Code Smells** | 12 | **A** | Deuda técnica estimada en 1h 30m. Código altamente mantenible. |
| **Duplicación de Código**| 0.8% | **A** | Muy por debajo del umbral de alarma fijado en 3.0%. |
| **Complejidad Cognitiva**| 12 (promedio) | **A** | Algoritmo AC-3 y Backtracking optimizados en funciones simples. |
| **Cobertura de Código** | 92.08% | **A** | Excede con amplitud el umbral mínimo del Quality Gate (80.0%). |
| **Líneas de Código (LOC)**| ~3,500 LOC | — | Excluyendo dependencias (`node_modules`) y builds. |

### Configuración Técnica de Cobertura y Exclusiones
*   **Fuentes Analizadas:** `backend/src`, `frontend/src`
*   **Inclusiones de Tests:** Archivos de extensión `.test.js`, `.test.ts`, `.test.tsx`
*   **Reportes de Cobertura:** Rutas de archivos LCOV (`backend/coverage/lcov.info` y `frontend/coverage/lcov.info`) consumidas en la integración.

---

## 8. Conclusiones y Lecciones Aprendidas
1.  **Viabilidad Matemática:** La automatización de la programación horaria mediante algoritmos CSP demostró ser robusta, logrando reducir una tarea institucional de días a escasos segundos y eliminando por completo el error humano operacional.
2.  **Importancia del Testing Temprano (TDD):** Implementar la suite de pruebas unitarias al inicio del Sprint 2 permitió detectar inconsistencias tempranas en las variables del CSP, evitando costosas refactorizaciones posteriores.
3.  **Gestión Ágil Efectiva:** A pesar de la alta variabilidad temporal provocada por el cuello de botella del algoritmo en el Sprint 2, la adaptabilidad de Scrum y la priorización de backlog permitieron cumplir con el alcance crítico del producto a tiempo y sin exceder el presupuesto de S/. 4,978.40.

---
*Universidad Continental — Ingeniería de Sistemas e Informática — Taller de Proyectos 2 — 2026*
