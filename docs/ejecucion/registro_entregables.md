# 📦 Registro de Entregables Técnicos — SGOHA

Este documento detalla el inventario oficial de los entregables de software generados durante la fase de ejecución del proyecto **SGOHA**, especificando su ubicación física en el repositorio y su estado de validación.

---

## 1. Entregables del Backend (API REST y Motor CSP)
Ubicados en la carpeta física [backend/](file:///D:/Proyecto_horarios_UC/backend).

*   **Punto de Entrada del Servidor:**
    *   [server.js](file:///D:/Proyecto_horarios_UC/backend/server.js): Inicialización del servidor Express, middlewares globales (Helmet, Cors, Rate Limiting) y escucha de puertos.
*   **Modelos de Datos Mongoose:**
    *   [backend/src/models/](file:///D:/Proyecto_horarios_UC/backend/src/models/): Definición física de colecciones de MongoDB (`User.js`, `Teacher.js`, `Course.js`, `Classroom.js`, `Enrollment.js`, `ScheduleRun.js`, `ScheduledSection.js`).
*   **Motor CSP (Algoritmo Inteligente):**
    *   [backend/src/csp/](file:///D:/Proyecto_horarios_UC/backend/src/csp/):
        *   `ac3.js`: Propagación y reducción de dominios.
        *   `solver.js`: Algoritmo de Backtracking sistemático.
        *   `heuristics.js`: Heurísticas MRV y LCV para optimizar el árbol.
        *   `constraints.js`: Reglas de validación física de solapamiento.
*   **Controladores e Hilos de Negocio:**
    *   [backend/src/controllers/](file:///D:/Proyecto_horarios_UC/backend/src/controllers/) y [backend/src/services/](file:///D:/Proyecto_horarios_UC/backend/src/services/): Mapeo de lógica CRUD y disparador de generación de horarios.

---

## 2. Entregables del Frontend (React + TypeScript SPA)
Ubicados en la carpeta física [frontend/](file:///D:/Proyecto_horarios_UC/frontend).

*   **Configuración y Core Client:**
    *   `package.json`, `tsconfig.json`, `vite.config.ts`: Parámetros de transpilación y empaquetado Vite.
*   **Servicios API Cliente:**
    *   [frontend/src/api/](file:///D:/Proyecto_horarios_UC/frontend/src/api/): Clientes HTTP Axios con interceptores JWT (`auth.ts`, `index.ts`).
*   **Vistas e Interfaz Gráfica (Pages):**
    *   [frontend/src/pages/](file:///D:/Proyecto_horarios_UC/frontend/src/pages/):
        *   `Admin/`: Gestión de usuarios y configuración administrativa.
        *   `Schedules/`: Ejecución del solver y visualización del horario.
        *   `StudentPortal/`: Módulo de estudiante para registrar disponibilidad horaria.
*   **Gestión de Estados Globales:**
    *   [frontend/src/store/](file:///D:/Proyecto_horarios_UC/frontend/src/store/): Tiendas Zustand para control de autenticación y flujos visuales.

---

## 3. Entregables de Calidad y Testing
*   **Suite de Pruebas Automatizadas (TDD):**
    *   [backend/tests/csp/](file:///D:/Proyecto_horarios_UC/backend/tests/csp/): 55 casos de pruebas unitarias Jest (`ac3.test.js`, `constraints.test.js`, `heuristics.test.js`, `solver.test.js`, `timeSlots.test.js`).
*   **Configuración de SonarQube:**
    *   [sonar-project.properties](file:///D:/Proyecto_horarios_UC/sonar-project.properties): Reglas de calidad y exclusiones para el análisis estático de código MERN.

---
*Universidad Continental — Taller de Proyectos 2 — 2026*
