# 📄 Acta de Constitución del Proyecto (Project Charter) — SGOHA

## 1. Información General del Proyecto
*   **Nombre del Proyecto:** Sistema de Generación Óptima de Horarios Académicos (SGOHA).
*   **Patrocinador / PO:** Mg. Daniel Gamarra Moreno (Universidad Continental).
*   **Equipo de Desarrollo:** Sanchez Ramos, Giovany (Scrum Master/Dev) y Calderon Aliaga, Kenedy (QA/Dev).
*   **Metodología:** Scrum / Spec-Driven Development (SDD).
*   **Fecha de Inicio:** 23 de marzo de 2026.
*   **Fecha de Finalización:** 14 de junio de 2026 (12 Semanas).

---

## 2. Propósito y Justificación del Proyecto
La planificación y distribución de horarios académicos en la Universidad Continental es un proceso manual complejo que consume tiempo y es susceptible a errores humanos (solapamiento de docentes, aulas saturadas o cruce de asignaturas en alumnos matriculados). 

SGOHA surge para automatizar este proceso mediante un **motor de inteligencia artificial basado en el Problema de Satisfacción de Restricciones (CSP)**, garantizando la optimización de recursos y la correctitud matemática de la distribución de horarios bajo una arquitectura web full-stack moderna (MERN).

---

## 3. Objetivos del Proyecto
*   **Objetivo General:** Desarrollar una plataforma web inteligente de generación automática de horarios académicos que elimine el 100% de los conflictos de solapamiento críticos en la Universidad Continental.
*   **Objetivos Específicos:**
    1.  Modelar formalmente el problema de horarios universitarios como un CSP (Variables, Dominios y Restricciones).
    2.  Construir un motor solver en Node.js que propague restricciones con el algoritmo AC-3 y realice búsqueda sistemática con Backtracking heurístico (MRV/LCV).
    3.  Implementar una SPA interactiva en React y TypeScript con tableros de administración y de consulta estudiantil.
    4.  Asegurar la calidad del software con pruebas unitarias automatizadas (TDD) con cobertura superior al 90%.

---

## 4. Alcance del Proyecto
### A. Alcance Incluido:
*   Módulo de seguridad y autenticación mediante JWT (Roles: Administrador y Alumno).
*   Módulos CRUD para la gestión de entidades (Docentes, Cursos, Aulas, Matrículas).
*   Gestión de disponibilidad horaria por docente y alumno.
*   Motor CSP con detección y propagación automatizada de 7 restricciones duras (RC-01 a RC-07).
*   Visualización interactiva tipo calendario de horarios semanales.

### B. Alcance Excluido:
*   Integración directa en tiempo real con el sistema académico Banner institucional.
*   Aplicaciones móviles nativas (iOS / Android).
*   Soporte multi-tenant para múltiples universidades.

---

## 5. Stakeholders Principales y Roles
*   **Administradores Académicos:** Usuarios principales encargados de parametrizar recursos y ejecutar el solver.
*   **Docentes:** Usuarios finales que registran su disponibilidad y consultan sus bloques de clases.
*   **Estudiantes:** Beneficiarios indirectos que consultan horarios e informan preferencias.
*   **Equipo de Operaciones TI:** Encargados del despliegue y soporte de infraestructura en producción.

---
*Universidad Continental — Taller de Proyectos 2 — 2026*
