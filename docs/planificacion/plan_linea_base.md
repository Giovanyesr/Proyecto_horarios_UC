# 📅 Plan de Línea Base del Proyecto — SGOHA

Este documento define la **triple restricción integrada** (Línea Base del Alcance, Cronograma y Costo) del proyecto **SGOHA**, sirviendo como el punto de comparación autorizado para medir desviaciones durante el ciclo de vida del software.

---

## 1. Línea Base del Alcance (Estructura de Desglose del Trabajo - EDT)
El alcance del proyecto se divide en 5 entregables principales de la EDT:

*   **EDT 1: Gestión de Proyecto e Inicio**
    *   1.1. Project Charter y Visión de Negocio.
    *   1.2. Especificación de Requerimientos y Spec SDD.
*   **EDT 2: Infraestructura y Base de Datos**
    *   2.1. Configuración de entornos local y cloud (Atlas).
    *   2.2. Diseño físico de esquemas Mongoose (User, Teacher, Course, Classroom, Enrollment).
*   **EDT 3: Motor Solver CSP (Inteligencia)**
    *   3.1. Modelado matemático de variables y dominios.
    *   3.2. Implementación de consistencia de arcos (AC-3).
    *   3.3. Algoritmo Backtracking recursivo con heurísticas MRV, LCV y Forward Checking.
    *   3.4. Suite de pruebas unitarias con Jest (TDD).
*   **EDT 4: Desarrollo Frontend y UI**
    *   4.1. Configuración de SPA React con Tailwind CSS.
    *   4.2. Panel de administración académica y módulo de control CSP.
    *   4.3. Portal del estudiante (disponibilidad y calendario).
*   **EDT 5: Integración y Cierre**
    *   5.1. Pruebas de integración E2E.
    *   5.2. Cierre administrativo y actas de lecciones aprendidas.

---

## 2. Línea Base del Cronograma (Cronograma de Hitos)
El cronograma comprende 12 semanas dividido en 5 iteraciones (Sprints) bajo metodología Scrum:

1.  **Hito 0 (Semana 2 — 05/04/2026):** Setup inicial del proyecto, arquitectura base, autenticación de usuarios por roles y modelos iniciales creados (Sprint 0).
2.  **Hito 1 (Semana 4 — 19/04/2026):** Módulos CRUD de docentes, cursos, aulas y matrículas operativos con validaciones en backend (Sprint 1).
3.  **Hito 2 (Semana 7 — 10/05/2026):** Motor algorítmico CSP (AC-3 + Backtracking) completamente funcional y suite de pruebasJest implementada (Sprint 2).
4.  **Hito 3 (Semana 10 — 31/05/2026):** Dashboard administrativo y portal web estudiantil React integrados con la API (Sprint 3).
5.  **Hito 4 (Semana 12 — 14/06/2026):** Pruebas de integración E2E, documentación de cierre y código desplegado en producción (Sprint 4).

---

## 3. Línea Base de Costos (Presupuesto Aprobado)
El presupuesto aprobado total del proyecto asciende a **S/. 4,978.40 (Soles peruanos)**, estructurado de la siguiente manera:

### A. Recursos Humanos (Tarifa S/. 12.00/hora):
*   Sánchez Ramos, Giovany (Full-Stack / SM): 146 horas -> S/. 1,752.00
*   Calderón Aliaga, Kenedy (Full-Stack / QA): 156 horas -> S/. 1,872.00
*   *Subtotal RRHH:* **S/. 3,624.00 (72.8%)**

### B. Infraestructura y Operación:
*   Depreciación de hardware (2 laptops): S/. 180.00
*   Acceso a Internet (proporcional): S/. 148.50
*   Servicios básicos (electricidad): S/. 60.00
*   Licencias proporcionales: S/. 31.50
*   *Subtotal Infraestructura:* **S/. 420.00 (8.4%)**

### C. Costos Indirectos y Contingencia:
*   Margen de contingencia (10% sobre costos directos): S/. 404.40
*   Coordinación de Daily Scrum y Retrospectivas: S/. 240.00
*   Logística, transporte y presentación de entregables: S/. 290.00
*   *Subtotal Indirectos:* **S/. 934.40 (18.8%)**

---
*Universidad Continental — Taller de Proyectos 2 — 2026*
