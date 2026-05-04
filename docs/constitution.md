# CONSTITUTION.md — SGOHA
## Sistema de Generación Óptima de Horarios Académicos
**Universidad Continental | Taller de Proyectos 2 | 2026**

---

## 1. PROPÓSITO DE ESTE DOCUMENTO

Este documento define los principios fundamentales, reglas globales y restricciones del Sistema de Generación Óptima de Horarios Académicos (SGOHA). Siguiendo el enfoque **Spec-Driven Development (SDD)**, este artefacto actúa como **contrato inmutable** del sistema: toda decisión de diseño, implementación y prueba debe ser coherente con lo aquí establecido.

Ningún componente del sistema puede violar los principios o restricciones duras de este documento. Las restricciones blandas pueden optimizarse pero nunca ignorarse sin justificación documentada.

---

## 2. PRINCIPIOS DEL SISTEMA

### P-01 — Especificación antes que implementación
El comportamiento del sistema se define completamente en documentos de especificación antes de escribir código. No se implementa ningún módulo sin criterios de aceptación verificables previos.

### P-02 — Trazabilidad total
Cada funcionalidad implementada debe poder rastrearse hasta:
- Un caso de uso documentado en `Spec.md`
- Una restricción en este documento (`constitution.md`)
- Al menos un test automatizado en `tests/`

### P-03 — Corrección sobre rendimiento
El sistema privilegia la correctitud de las asignaciones (libre de conflictos) por encima de la velocidad de generación. Un horario incorrecto nunca es aceptable, aunque sea rápido.

### P-04 — Determinismo en restricciones duras
Las restricciones duras (Sección 4) son no negociables. El algoritmo CSP debe garantizar que ninguna solución entregada viole una restricción dura, bajo ninguna circunstancia.

### P-05 — Mínimo privilegio
Los actores del sistema acceden únicamente a los recursos y acciones que su rol autoriza. Un alumno nunca puede ejecutar acciones de administrador. Un administrador no puede suplantar identidades de otros usuarios.

### P-06 — Fallo explícito
Cuando el sistema no puede generar un horario válido, lo informa explícitamente con estado `infeasible` o `timeout`. Nunca retorna resultados parciales como si fueran completos.

### P-07 — Persistencia coherente
Los datos generados por el algoritmo CSP solo se persisten en la base de datos si la solución es completa y libre de conflictos. Soluciones parciales pueden persistirse únicamente si el estado `timeout` está explícitamente señalado.

### P-08 — Sin efectos secundarios implícitos
Ninguna operación de lectura (GET) modifica datos del sistema. Las operaciones de escritura son explícitas y auditables.

---

## 3. REGLAS GLOBALES

### RG-01 — Autenticación obligatoria
Todos los endpoints del backend, excepto `/api/auth/login`, requieren un token JWT válido. Las peticiones sin token o con token expirado deben retornar HTTP 401.

### RG-02 — Separación de roles
El sistema reconoce exactamente dos roles de usuario:
- `admin`: acceso total al panel de administración y generación de horarios.
- `student`: acceso de solo lectura a su horario y gestión de su disponibilidad.

Cualquier intento de un rol de acceder a recursos del otro debe retornar HTTP 403.

### RG-03 — Unicidad de identidades
No pueden existir dos docentes con el mismo código o email. No pueden existir dos alumnos con el mismo código o email. El sistema debe validar y rechazar duplicados antes de persistir.

### RG-04 — Periodo académico como contexto
Toda operación de generación de horarios está vinculada a un periodo académico específico. No se pueden mezclar cursos, matrículas o docentes de distintos periodos en una misma generación.

### RG-05 — Integridad referencial
No se puede eliminar un docente que tenga cursos asignados en el periodo activo. No se puede eliminar un curso con matrículas vigentes. El sistema debe rechazar estas operaciones con un mensaje claro.

### RG-06 — Tiempo máximo de generación
El algoritmo CSP tiene un límite de ejecución de **60 segundos**. Superado este límite, el sistema retorna el estado `timeout` con la asignación parcial obtenida hasta ese momento.

### RG-07 — Expiración de sesión
Las sesiones de usuario expiran automáticamente a los **30 minutos de inactividad**. El token JWT tiene vigencia de **8 horas** desde su emisión.

### RG-08 — Contraseñas irreversibles
Las contraseñas se almacenan exclusivamente como hash bcrypt con factor de coste 12. Ningún endpoint retorna contraseñas en texto plano ni en hash.

---

## 4. RESTRICCIONES DEL SISTEMA CSP

### 4.1 Restricciones Duras (Hard Constraints)

Las restricciones duras son **absolutas e innegociables**. Toda asignación que las viole es inválida y debe ser descartada por el algoritmo.

| ID     | Nombre                        | Descripción                                                                                       | Verificado en       |
|--------|-------------------------------|---------------------------------------------------------------------------------------------------|---------------------|
| RC-01  | No solapamiento de docente    | Un docente no puede impartir dos cursos distintos en el mismo día y franja horaria.               | `constraints.js`    |
| RC-02  | No solapamiento de aula       | Un aula no puede albergar dos cursos distintos en el mismo día y franja horaria.                  | `constraints.js`    |
| RC-03  | No solapamiento de alumnos    | Un alumno matriculado en dos cursos no puede tener ambos asignados en el mismo horario.           | `constraints.js`    |
| RC-04  | Disponibilidad del docente    | El horario asignado a un curso debe estar dentro de los bloques declarados disponibles del docente. | `problem.js`       |
| RC-05  | Capacidad del aula            | La capacidad del aula asignada debe ser mayor o igual al número de alumnos matriculados en el curso. | `problem.js`      |
| RC-06  | Docente asignado al curso     | Solo se puede generar horario para un curso que tenga un docente explícitamente asignado.         | `problem.js`        |
| RC-07  | Tipo de aula compatible       | El tipo de aula (lecture, lab, computer_lab, seminar) debe ser compatible con el tipo de curso.   | `problem.js`        |

**Invariante global:** Una solución `S` es válida si y solo si `∀ asignación a ∈ S`, se cumplen **todas** las restricciones RC-01 a RC-07 simultáneamente.

### 4.2 Restricciones Blandas (Soft Constraints)

Las restricciones blandas son **preferencias deseables** que el algoritmo debe intentar satisfacer. Su incumplimiento no invalida una solución, pero reduce su calidad.

| ID     | Nombre                            | Descripción                                                                                         | Impacto en solución   |
|--------|-----------------------------------|-----------------------------------------------------------------------------------------------------|-----------------------|
| RB-01  | Disponibilidad preferida alumno   | Se prefiere asignar horarios dentro de la disponibilidad declarada por los alumnos matriculados.    | Reduce conflictos estudiantiles |
| RB-02  | Distribución horaria equilibrada  | Se prefiere que los cursos de un docente no se concentren todos en un único día.                    | Mejora carga docente  |
| RB-03  | Franjas de alta asistencia        | Se prefiere asignar cursos en franjas de alta asistencia histórica (mañana: 8-12h, tarde: 14-18h). | Mejora asistencia     |
| RB-04  | Minimización de cambios de aula   | Para un mismo grupo de alumnos, se prefiere que las clases consecutivas sean en aulas cercanas.     | Mejora experiencia    |

---

## 5. ACTORES Y PERMISOS

| Actor          | Puede hacer                                                                 | No puede hacer                                      |
|----------------|-----------------------------------------------------------------------------|-----------------------------------------------------|
| Administrador  | CRUD de docentes, cursos, aulas, alumnos, matrículas. Generar horarios.    | Acceder al portal estudiantil de otros usuarios.    |
| Alumno         | Ver su propio horario. Registrar y modificar su disponibilidad horaria.    | Modificar datos de otros alumnos. Generar horarios. |
| Sistema CSP    | Leer datos del problema. Persistir soluciones válidas.                      | Modificar directamente usuarios, roles o permisos.  |

---

## 6. INVARIANTES DE DATOS

- **INV-01:** Todo horario persistido en la base de datos cumple RC-01, RC-02 y RC-03.
- **INV-02:** Todo token JWT activo pertenece a exactamente un usuario con un único rol.
- **INV-03:** No existen matrículas huérfanas: toda matrícula referencia un alumno y un curso existentes.
- **INV-04:** No existen cursos sin docente asignado en el conjunto de variables del CSP.
- **INV-05:** El estado de una generación de horarios es siempre uno de: `pending`, `completed`, `infeasible`, `timeout`.

---

## 7. HISTORIAL DE VERSIONES

| Versión | Fecha      | Cambio                              | Autor                        |
|---------|------------|-------------------------------------|------------------------------|
| 1.0     | 2026-04-01 | Versión inicial del documento       | Sanchez Ramos / Calderon Aliaga |
| 1.1     | 2026-04-27 | Adición de invariantes de datos y RB-04 | Sanchez Ramos           |

---

*Universidad Continental — Ingeniería de Sistemas e Informática — Taller de Proyectos 2 — 2026*
