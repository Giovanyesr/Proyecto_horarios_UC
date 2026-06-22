# Evidencias del Prototipo — SGOHA

**UNIVERSIDAD CONTINENTAL**  
**Ingeniería de Sistemas e Informática**  
**Taller de Investigación 2**

**EVIDENCIAS DEL PROTOTIPO**  
**Sistema de Generación Óptima de Horarios Académicos (SGOHA)**

**Autores:** SANCHEZ RAMOS, Giovany | CALDERON ALIAGA, Kenedy  
**Docente:** Mg. Daniel Gamarra Moreno  
**Ubicación:** Huancayo, Perú — 2025

---

## 1. RESUMEN DE EVIDENCIAS
El presente documento reúne las evidencias completas del prototipo funcional del Sistema de Generación Óptima de Horarios Académicos (SGOHA). Incluye capturas de pantalla de todas las funcionalidades implementadas, logs de pruebas automatizadas y métricas de cobertura.

| Criterio Rúbrica | Evidencia | Estado |
| :--- | :--- | :---: |
| **Organización del entorno** | README técnico + repositorio GitHub estructurado | ✓ 3/3 |
| **Modelado del problema** | Algoritmo CSP con restricciones formalizadas | ✓ 3/3 |
| **Especificación técnica (SDD + Antigravity)** | Documento con 8 casos de uso trazables | ✓ 3/3 |
| **Implementación TDD** | 55 tests automatizados — cobertura 92% líneas | ✓ 3/3 |
| **Desarrollo del algoritmo** | Backtracking + AC-3 + MRV + LCV funcional | ✓ 3/3 |
| **Requisitos no funcionales** | 22 RNF documentados con métricas medibles | ✓ 3/3 |
| **Entregable final** | Prototipo funcional + capturas + logs de tests | ✓ 3/3 |

---

## 2. EVIDENCIAS DEL PROTOTIPO FUNCIONAL

### 2.1 Pantalla de Inicio — Selección de Rol
El sistema presenta una pantalla de bienvenida con indicador de estado del servidor en tiempo real ("Sistema en línea") y opciones de acceso diferenciadas por rol.

*(Figura 1. Pantalla de inicio con indicador "Sistema en línea" — localhost:5173/login)*

### 2.2 Autenticación — Portal de Alumno y Administrador
El sistema implementa autenticación con JWT diferenciada por rol, con validación en tiempo real y visibilidad de contraseña.

*(Figura 2. Login — Portal del Alumno)*  
*(Figura 3. Login — Administración)*

### 2.3 Portal del Alumno
El portal estudiantil permite consultar horario semanal, matrículas, disponibilidad y perfil, con soporte de tema oscuro.

*(Figura 4. Dashboard principal del Portal del Alumno)*  
*(Figura 5. Cursos matriculados del alumno)*  
*(Figura 6. Gestión de disponibilidad horaria del alumno)*  
*(Figura 7. Perfil del alumno)*

### 2.4 Panel de Administración
El panel centraliza la gestión completa: horarios, estudiantes, docentes, cursos, aulas y matrículas.

*(Figura 8. Dashboard del Panel de Administración)*  
*(Figura 9. Módulo de generación de horarios con algoritmo CSP)*  
*(Figura 10. Gestión de estudiantes)*  
*(Figura 11. Gestión de docentes)*  
*(Figura 12. Gestión de cursos)*  
*(Figura 13. Gestión de aulas)*  
*(Figura 14. Gestión de matrículas)*

---

## 3. EVIDENCIAS DE PRUEBAS AUTOMATIZADAS (TDD)

### 3.1 Ejecución de Tests con Jest
Las pruebas automatizadas cubren los módulos críticos del algoritmo CSP con el enfoque TDD. Se ejecutan con `npm test` desde la carpeta `backend/`.

*(Figura 15. Resultado de npm test — 55 tests pasando, cobertura 92.08% en líneas)*

### 3.2 Resumen de Cobertura

| Módulo | % Statements | % Branch | % Functions | % Lines |
| :--- | :---: | :---: | :---: | :---: |
| `timeSlots.js` | 100% | 63.63% | 100% | 100% |
| `constraints.js` | 91.66% | 77.77% | 100% | 94.11% |
| `heuristics.js` | 96.87% | 69.23% | 100% | 100% |
| `solver.js` | 79.66% | 72.91% | 100% | 80.76% |
| `ac3.js` | 96.87% | 66.66% | 100% | 100% |
| **TOTAL** | **90.3%** ✓ | **71.07%** ✓ | **100%** ✓ | **92.08%** ✓|

### 3.3 Ciclo TDD Aplicado

| Fase | Descripción | Ejemplo |
| :--- | :--- | :--- |
| 🔴 **RED** | Se escribe la prueba antes del código. La prueba falla. | `test("mismo docente en el mismo horario genera conflicto")` → **FAIL** |
| 🟢 **GREEN** | Se implementa el mínimo código para que pase. | Implementar `teacherNoOverlap()` → **PASS** |
| 🔵 **REFACTOR** | Se mejora el código sin romper las pruebas. | Optimizar `isConsistent()` → **55 PASS** |

---

## 4. REPOSITORIO Y DOCUMENTACIÓN

| Campo | Detalle |
| :--- | :--- |
| **URL del Repositorio** | https://github.com/Giovanyesr/Proyecto_horarios_UC |
| **Rama principal** | `main` |
| **Stack tecnológico** | MERN (MongoDB + Express + React + Node.js) |
| **Lenguajes** | JavaScript (Backend) + TypeScript (Frontend) |

### Documentos en carpeta `/docs`

| Documento | Contenido | Criterio |
| :--- | :--- | :---: |
| `README.md` | Documentación técnica completa con instrucciones de instalación | Criterio 1 |
| `Especificacion_Tecnica_SGOHA.docx` | 8 casos de uso con SDD y Google Antigravity | Criterio 3 |
| `Requisitos_No_Funcionales_SGOHA.docx`| 22 RNF con métricas medibles en 7 categorías | Criterio 5 |
| `Evidencias_Prototipo_SGOHA.html` | Capturas del sistema + logs de tests | Criterio 6 |

---
*Universidad Continental — Taller de Investigación 2 — 2025*
