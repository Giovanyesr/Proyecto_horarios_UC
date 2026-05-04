# Gestión de Riesgos y Oportunidades — SGOHA
## Sistema de Generación Óptima de Horarios Académicos
**Universidad Continental | Taller de Proyectos 2 | 2026**

---

## 1. Introducción

El presente documento identifica, analiza y define estrategias de respuesta ante los riesgos y oportunidades del proyecto SGOHA. Los riesgos se relacionan explícitamente con las restricciones del problema CSP (definidas en `constitution.md`), las limitaciones técnicas del stack MERN y las dependencias externas del proyecto.

**Escala de clasificación:**

| Nivel | P × I | Color |
|---|---|---|
| CRÍTICO | ≥ 16 | 🔴 |
| ALTO | 9 – 15 | 🟠 |
| MEDIO | 4 – 8 | 🟡 |
| BAJO | 1 – 3 | 🟢 |

---

## 2. Registro de Riesgos

### Matriz de Probabilidad × Impacto

```
          I=1    I=2    I=3    I=4    I=5
P=5  [  5🟢] [ 10🟠] [ 15🟠] [ 20🔴] [ 25🔴]
P=4  [  4🟡] [  8🟡] [ 12🟠] [ 16🔴] [ 20🔴]
               R-05           R-02    R-01
               R-06
P=3  [  3🟢] [  6🟡] [  9🟠] [ 12🟠] [ 15🟠]
                      R-08   R-04    R-03
                      R-09           R-10
P=2  [  2🟢] [  4🟡] [  6🟡] [  8🟡] [ 10🟠]
                              R-07
P=1  [  1🟢] [  2🟢] [  3🟢] [  4🟡] [  5🟡]
```

---

### Detalle de Riesgos

#### 🔴 R-01 — Timeout del algoritmo CSP (CRÍTICO | P=4, I=5, Score=20)
**Descripción:** El algoritmo CSP no encuentra solución en el tiempo límite de 60 segundos para conjuntos grandes de cursos con restricciones densas.

**Relación con restricciones del problema (CSP):**
Directa — RC-01 a RC-07. La complejidad NP-hard del CSP implica explosión combinatoria si los dominios no se reducen adecuadamente con AC-3 antes del backtracking.

**Limitaciones técnicas:** Node.js es single-threaded; el backtracking intensivo puede bloquear el event loop.

**Dependencias externas:** Ninguna directa. Depende del hardware del servidor (Render.com Free Tier tiene recursos limitados).

**Estrategia de mitigación:**
- Implementar límite de 60s con retorno de estado `timeout` y asignación parcial marcada como `"partial": true`
- Ejecutar AC-3 siempre antes del backtracking para reducir dominios y detectar inviabilidad temprana
- Aplicar heurísticas MRV y LCV para minimizar el árbol de búsqueda
- Considerar ejecutar el CSP en un worker thread separado para no bloquear el servidor

---

#### 🟠 R-02 — Datos de disponibilidad incompletos generan infeasibility (ALTO | P=4, I=4, Score=16)
**Descripción:** Si los docentes tienen bloques de disponibilidad incompletos o incorrectos, el algoritmo retorna `infeasible` sin que exista un problema real de restricciones.

**Relación con CSP:** RC-04 (Disponibilidad del docente). Dominios vacíos por datos incorrectos hacen que AC-3 retorne infeasible sin explorar el árbol de búsqueda.

**Estrategia de mitigación:**
- Validar disponibilidad mínima (al menos 1 bloque por docente) al crear/editar
- Mostrar advertencia en el panel admin si algún docente asignado a cursos activos tiene disponibilidad vacía
- Permitir ejecución del CSP solo si todos los docentes tienen al menos 1 bloque disponible

---

#### 🟠 R-03 — Solapamiento de alumnos por matrículas desactualizadas (ALTO | P=3, I=5, Score=15)
**Descripción:** Si las matrículas no están actualizadas al momento de generar horarios, el sistema puede omitir restricciones de alumnos compartidos entre cursos.

**Relación con CSP:** RC-03 (No solapamiento de alumnos). Una matrícula retirada pero no marcada como `withdrawn` sigue generando restricciones innecesarias.

**Estrategia de mitigación:**
- Forzar recarga de matrículas activas (`status: enrolled`) antes de cada generación
- Mostrar resumen de matrículas activas cargadas antes de ejecutar el CSP
- Registrar en log qué matrículas se consideraron en cada generación

---

#### 🟠 R-04 — Eliminación accidental de archivos críticos del repositorio (ALTO | P=3, I=4, Score=12)
**Descripción:** Pérdida de archivos importantes por push directo a `main` sin revisión (como ocurrió con el directorio `tests/` — commit `a2bbb60`).

**Relación con restricciones:** Indirecta — sin tests, no se pueden verificar RC-01 a RC-07 automáticamente. Rompe la trazabilidad SDD entre especificación e implementación.

**Estrategia de mitigación:**
- Implementar Git Flow: ramas `develop`, `feature/*`, `release/*`
- Proteger la rama `main` con Pull Request obligatorio y revisión de al menos 1 integrante
- Nunca hacer push directo a `main`
- Restaurar el directorio `tests/csp/` eliminado

---

#### 🟠 R-05 — Límites de servicios gratuitos (ALTO | P=3, I=3, Score=9) / R-06 — Cuello de botella de equipo pequeño (ALTO | P=4, I=3, Score=12)

**R-05:** MongoDB Atlas Free Tier (512MB), Render.com (spin-down tras 15min inactividad) y Vercel tienen límites que pueden afectar el desempeño en demo.
- *Mitigación:* Monitorear uso mensual. Tener plan de migración. Hacer warm-up del servidor antes de la demo final.

**R-06:** Equipo de 2 personas cubre backend, frontend, QA, documentación y Scrum Master simultáneamente.
- *Mitigación:* Distribuir tareas con asignación explícita por sprint. Revisión cruzada de código. Documentar para reducir dependencia de conocimiento individual.

---

#### 🟡 R-07 — Capacidad de aulas insuficiente (MEDIO | P=2, I=4, Score=8)
**Relación con CSP:** RC-05. Si todas las aulas tienen capacidad menor al número de matriculados en algún curso, el dominio de esa variable queda vacío y AC-3 detecta infeasibility.
- *Mitigación:* Validar coherencia capacidad-matrículas al registrar. Alertar si ningún aula es suficiente para algún curso.

#### 🟡 R-08 — Incompatibilidad tipo aula/curso (MEDIO | P=2, I=3, Score=6)
**Relación con CSP:** RC-07. Reduce dominios de variables específicas; si no hay aulas del tipo correcto disponibles, genera backtracking intensivo o infeasibility.
- *Mitigación:* Filtrar aulas por tipo compatible al construir el dominio del CSP.

#### 🟡 R-09 — Pérdida de trazabilidad Jira ↔ Commits (MEDIO | P=3, I=3, Score=9)
- *Mitigación:* Convención de commits: `feat(HU-06): implementar generación CSP`. Revisar trazabilidad en cada sprint review.

#### 🟠 R-10 — Regresión en CSP por ausencia de tests (ALTO | P=3, I=5, Score=15)
**Relación con CSP:** Directa — `constraints.test.js`, `solver.test.js` y `heuristics.test.js` son la única verificación automática de RC-01 a RC-07.
- *Mitigación:* Restaurar directorio `tests/csp/`. Ejecutar suite completa antes de todo merge a `main`.

---

## 3. Registro de Oportunidades

| ID | Descripción | Categoría | Probabilidad | Impacto Positivo |
|---|---|---|:---:|---|
| O-01 | SDD detecta conflictos de restricciones antes de implementar | Proceso | Alta | Reducción ~30% en bugs por ambigüedad |
| O-02 | Algoritmo CSP escalable a producción real | Técnico | Media | Sistema usable por la Universidad Continental |
| O-03 | Cobertura TDD >70% facilita agregar restricciones blandas | Técnico | Alta | Extensibilidad sin romper restricciones duras |
| O-04 | React + TypeScript permite visualización interactiva de horarios | UX | Alta | Mayor adopción vs. soluciones en Excel |
| O-05 | Scrum permite ajustar alcance ante complejidad del CSP | Gestión | Alta | Reducción de riesgo de no-entrega |
| O-06 | Infraestructura 100% gratuita libera presupuesto | Costo | Alta | S/. 0.00 en hosting durante desarrollo |
| O-07 | Trazabilidad completa como evidencia de madurez profesional | Carrera | Media | Portafolio técnico demostrable |
| O-08 | Módulo CSP reutilizable para otros problemas de planificación | Reusabilidad | Media | Impacto más allá del alcance inicial |

### Estrategias de aprovechamiento clave

**O-01 — Mantener SDD activo en todo el proyecto:**
Actualizar `constitution.md` y `Spec.md` ante cualquier cambio de restricciones. Revisar coherencia en cada sprint review. Esta práctica es la que más diferencia el proyecto de un desarrollo ad-hoc.

**O-03 — Restaurar y ampliar la suite de tests:**
Los tests eliminados representan una oportunidad perdida de evidenciar calidad. Restaurarlos y agregar tests para restricciones blandas (RB-01 a RB-04) eleva la cobertura y la credibilidad del sistema.

**O-05 — Usar el backlog como herramienta real:**
Re-priorizar el backlog al inicio de cada sprint en función de los riesgos activos. Si R-01 (timeout CSP) se materializa, escalar la optimización del algoritmo sobre la exportación de PDF.

---

## 4. Relación Consolidada: Riesgos ↔ Restricciones CSP ↔ Dependencias

| Riesgo | Restricción CSP | Limitación Técnica | Dependencia Externa |
|---|---|---|---|
| R-01 (Timeout) | RC-01 a RC-07 | Node.js single-threaded | Render.com Free Tier |
| R-02 (Datos vacíos) | RC-04 | Validación de frontend | Datos del administrador |
| R-03 (Matrículas) | RC-03 | Sincronización DB | MongoDB Atlas |
| R-04 (Repositorio) | Todos (vía tests) | Git workflow | GitHub |
| R-05 (Servicios) | INV-01 constitution.md | Infraestructura gratuita | MongoDB / Vercel / Render |
| R-07 (Capacidad) | RC-05 | Validación de datos | Datos del administrador |
| R-08 (Tipo aula) | RC-07 | Construcción del dominio CSP | Datos del administrador |
| R-10 (Regresión) | RC-01 a RC-07 | Suite de tests eliminada | — |

---

*Universidad Continental — Ingeniería de Sistemas e Informática — Taller de Proyectos 2 — 2026*
