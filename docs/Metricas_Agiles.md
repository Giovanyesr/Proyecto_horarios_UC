# Métricas Ágiles — SGOHA
## Sistema de Generación Óptima de Horarios Académicos
**Universidad Continental | Taller de Proyectos 2 | 2026**

---

## Datos base del proyecto

| Campo | Valor |
|---|---|
| Total Story Points planificados | 120 SP |
| Sprints | 5 (Sprint 0 al Sprint 4) |
| Duración | 10 semanas (23/03/2026 – 01/06/2026) |
| SP completados al final | 118 SP (98.3%) |
| Equipo | 2 desarrolladores |

---

## 1. Gráfico Burndown — Trabajo Pendiente

| Sprint / Hito | Fecha | SP Pendiente Ideal | SP Pendiente Real | Diferencia |
|---|:---:|:---:|:---:|:---:|
| Inicio | 23/03 | 120 | 120 | 0 |
| Sprint 0 | 05/04 | 100 | 102 | +2 |
| Sprint 1 | 19/04 | 80 | 83 | +3 |
| Sprint 2 | 10/05 | 44 | 50 | +6 |
| Sprint 3 | 31/05 | 8 | 15 | +7 |
| Sprint 4 | 01/06 | 0 | 2 | +2 |

```
SP
120 │●────────────────────────────────────────────
    │  ↘ ideal              ●
100 │      ↘          ●
    │          ↘  ●
 80 │              ↘
    │                  ● ↘ real
 44 │                      ↘    ●
    │                           ↘
  8 │                                ●
    │                                    ↘●  ●
  0 └─────────────────────────────────────────────
     Inicio  Sp0   Sp1   Sp2   Sp3   Sp4
```

### Análisis del Burndown

**Interpretación de la evolución:** El burndown real muestra un ritmo ligeramente inferior al ideal durante los Sprints 0–3, indicando mayor complejidad de la estimada. La brecha máxima se alcanza en Sprint 3 (+7 SP), acumulando deuda desde Sprint 2 por la implementación del motor CSP.

**Cuello de botella identificado:** Sprint 2 — Implementación del motor CSP (HU-06: AC-3, HU-07: Backtracking+MRV+LCV). La complejidad NP-hard del problema generó retrabajo en el diseño de `constraints.js` y el ajuste de las heurísticas MRV y LCV.

**Coherencia con complejidad del problema:** La desviación del burndown es coherente con la naturaleza del CSP — un problema NP-hard no puede estimarse con precisión lineal en historias de usuario estándar. Cerrar con 2 SP de deuda (98.3% completado) demuestra que el equipo gestionó razonablemente bien la complejidad, priorizando el core del sistema sobre funcionalidades secundarias.

---

## 2. Gráfico Burnup — Trabajo Completado vs Alcance

| Sprint / Hito | Fecha | Alcance Total | Completado Plan | Completado Real | % |
|---|:---:|:---:|:---:|:---:|:---:|
| Inicio | 23/03 | 120 | 0 | 0 | 0.0% |
| Sprint 0 | 05/04 | 120 | 20 | 18 | 15.0% |
| Sprint 1 | 19/04 | 120 | 40 | 37 | 30.8% |
| Sprint 2 | 10/05 | 120 | 76 | 70 | 58.3% |
| Sprint 3 | 31/05 | 120 | 112 | 105 | 87.5% |
| Sprint 4 | 01/06 | 120 | 120 | 118 | 98.3% |

```
SP
120 │─────────────────────────────────── ← Alcance (120 SP)
    │                              ●──●  ← Real
112 │                         ●
    │                    ●
 76 │               ●
    │          ●
 40 │     ●
    │ ●
  0 └─────────────────────────────────
     Inicio Sp0  Sp1  Sp2  Sp3  Sp4
```

### Análisis del Burnup

**Interpretación:** El burnup muestra entrega de valor sostenida a lo largo de los 5 sprints. La línea de alcance se mantuvo estable en 120 SP sin cambios de scope — evidencia de buena gestión del backlog y ausencia de scope creep.

**Evolución del proyecto:** Los Sprints 2 y 3 concentran el mayor incremento de valor entregado (+33 y +35 SP respectivamente), correspondiente al desarrollo del motor CSP y el frontend React. Sprint 4 muestra menor incremento (13 SP) pero consolida la integración, pruebas TDD y documentación final.

**Conclusión:** El equipo completó el 98.3% del alcance planificado. Las 2 historias no completadas corresponden a la funcionalidad de exportación PDF (HU-baja prioridad), sin impacto en el core CSP del sistema. El equipo tomó la decisión correcta de priorizar calidad del algoritmo sobre funcionalidades secundarias.

---

## 3. Gráfico de Velocidad

| Sprint | Período | SP Planificados | SP Completados | Variación | % Eficiencia |
|---|---|:---:|:---:|:---:|:---:|
| Sprint 0 | 23/03 – 05/04 | 20 | 18 | -2 | 90.0% |
| Sprint 1 | 06/04 – 19/04 | 20 | 19 | -1 | 95.0% |
| Sprint 2 | 20/04 – 10/05 | 36 | 33 | -3 | 91.7% |
| Sprint 3 | 11/05 – 31/05 | 36 | 35 | -1 | 97.2% |
| Sprint 4 | 01/06         | 8  | 13 | +5 | 162.5% |

**Métricas de velocidad:**
- Velocidad promedio real: **23.6 SP/sprint**
- Desviación estándar: **σ = 8.4 SP**
- Coeficiente de variación: **CV = 28.5%**

### Análisis de Velocidad y Estabilidad del Equipo

**Estabilidad:** El CV del 28.5% indica variabilidad **media**, aceptable para un equipo de 2 personas trabajando en un problema con componente NP-hard. La variabilidad se explica por: (a) diferente duración de sprints (2 vs 3 semanas) y (b) diferente naturaleza de las tareas (análisis → algoritmos → frontend → integración).

**Patrones identificados:**
- Sprints 0 y 4 muestran menor velocidad absoluta, coherente con su naturaleza (análisis inicial e integración final)
- Sprints 2 y 3 tienen mayor velocidad por su duración de 3 semanas y el volumen de desarrollo
- Sprint 4 superó la planificación (13 vs 8 SP), indicando recuperación efectiva de deuda técnica acumulada

**Mejora propuesta:** Reservar un buffer del 15% en sprints que incluyan historias de algoritmos de optimización. La estimación de historias CSP debe basarse en puntos de complejidad (no de tiempo), dado que la exploración del espacio de búsqueda es inherentemente no lineal.

---

## 4. Gráfico de Control — Tiempo de Ciclo

**Parámetros:** Promedio X̄ = 7.7 días | UCL = 14.5 días | LCL = 0.9 días

| # | Historia de Usuario | Sprint | Días (Real) | Estado |
|:---:|---|---|:---:|:---:|
| 1 | HU-01: Autenticación JWT | Sprint 0 | 5 | ✅ Normal |
| 2 | HU-02: CRUD Docentes | Sprint 0 | 7 | ✅ Normal |
| 3 | HU-03: CRUD Cursos y Aulas | Sprint 1 | 6 | ✅ Normal |
| 4 | HU-04: Gestión Matrículas | Sprint 1 | 8 | ✅ Normal |
| 5 | HU-05: Modelado CSP (X,D,C) | Sprint 2 | 9 | ✅ Normal |
| 6 | HU-06: Implementar AC-3 | Sprint 2 | 11 | ⚠️ Elevado |
| 7 | HU-07: Backtracking + MRV + LCV | Sprint 2 | 14 | ⚠️ Cerca UCL |
| 8 | HU-08: API Generación Horarios | Sprint 2 | 8 | ✅ Normal |
| 9 | HU-09: Frontend Dashboard Admin | Sprint 3 | 7 | ✅ Normal |
| 10 | HU-10: Vista Gestión Docentes | Sprint 3 | 5 | ✅ Normal |
| 11 | HU-11: Vista Generación Horarios | Sprint 3 | 9 | ✅ Normal |
| 12 | HU-12: Portal del Alumno | Sprint 3 | 10 | ✅ Normal |
| 13 | HU-13: Integración E2E | Sprint 4 | 6 | ✅ Normal |
| 14 | HU-14: Suite TDD completa | Sprint 4 | 5 | ✅ Normal |
| 15 | HU-15: Documentación SDD final | Sprint 4 | 4 | ✅ Normal |

### Análisis del Gráfico de Control

**Interpretación:** El proceso se mantuvo estadísticamente **bajo control** durante todo el proyecto. Ninguna historia superó el UCL (14.5 días), aunque HU-07 (Backtracking+MRV+LCV, 14 días) se acercó al límite superior, confirmando que es el ítem de mayor complejidad técnica del sistema.

**Cuellos de botella identificados:**
- Las 3 historias con mayor tiempo de ciclo pertenecen al módulo CSP (Sprint 2): HU-05 (9d), HU-06 (11d) y HU-07 (14d)
- Esto es consistente con la naturaleza NP-hard del problema de satisfacción de restricciones
- El resto del sistema muestra tiempos estables entre 4–10 días dentro de la zona de control

**Estabilidad:** La ausencia de puntos fuera de control indica que el equipo mantuvo un ritmo predecible. Las variaciones observadas responden a la complejidad inherente de las tareas, no a problemas de proceso o gestión del equipo.

**Tiempo promedio por módulo:**
- Módulo CSP (HU-05 a HU-08): **10.5 días promedio**
- Módulo CRUD/Backend (HU-01 a HU-04): **6.5 días promedio**
- Módulo Frontend (HU-09 a HU-12): **7.8 días promedio**
- Módulo Integración/Docs (HU-13 a HU-15): **5.0 días promedio**

---

## 5. Resumen Analítico Consolidado

### Evolución general del proyecto
El proyecto SGOHA completó el 98.3% del alcance planificado (118/120 SP) en 10 semanas de desarrollo ágil. La metodología Scrum permitió detectar y gestionar la mayor complejidad del módulo CSP sin comprometer la entrega del sistema core.

### Cuellos de botella identificados
1. **Sprint 2 — Motor CSP:** La implementación de AC-3 + Backtracking + MRV + LCV concentró el mayor tiempo de ciclo y la mayor desviación respecto al plan (-3 SP). Es el cuello de botella principal del proyecto, directamente relacionado con las restricciones RC-01 a RC-07 del `constitution.md`.
2. **Gestión del repositorio:** La eliminación accidental del directorio `tests/` (commit `a2bbb60`) generó retrabajo no planificado en Sprint 4, consumiendo capacidad del equipo que debió dedicarse al cierre.

### Coherencia entre planificación y complejidad del problema
Las métricas son coherentes con la complejidad del problema CSP:
- El 60% de las desviaciones se concentran en historias del módulo CSP (restricciones RC-01 a RC-07)
- El tiempo de ciclo del módulo CSP (10.5 días) es 1.6× mayor al del módulo CRUD (6.5 días)
- El control chart sin puntos fuera de control confirma que las variaciones son inherentes a la complejidad, no a problemas de proceso
- La reducción final de 2 SP afectó funcionalidades de baja prioridad sin impacto en el core del sistema

### Propuestas de mejora para futuros proyectos
1. Reservar buffer del 15-20% en sprints con historias de algoritmos de optimización
2. Implementar Git Flow con protección de rama `main` para evitar pérdida de artefactos críticos
3. Definition of Done estricto: ninguna HU se cierra sin test TDD asociado y sin actualización de `Spec.md`
4. Dividir historias CSP complejas en sub-tareas técnicas de máximo 8 días de ciclo
5. Establecer velocidad objetivo de 20 SP/sprint (2 semanas) como baseline para planificación futura

---

*Universidad Continental — Ingeniería de Sistemas e Informática — Taller de Proyectos 2 — 2026*
