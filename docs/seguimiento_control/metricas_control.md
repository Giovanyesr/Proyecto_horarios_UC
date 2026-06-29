# 📈 Métricas de Seguimiento y Control del Proyecto — SGOHA

Este documento consolida el plan de control de calidad, tiempo y desempeño ágil empleado en **SGOHA** para monitorear desviaciones e implementar acciones correctivas a tiempo.

---

## 1. Métricas de Desempeño Ágil (Scrum)
Se realiza el seguimiento semanal del Product Backlog mediante los siguientes indicadores de velocidad e historia:

*   **Velocidad del Equipo (Velocity):** 
    *   *Métrica:* Story Points (SP) completados por Sprint.
    *   *Objetivo:* Mantener velocidad estable en torno a **23.6 SP/sprint** (desviación estándar σ = 8.4 SP).
*   **Burnup Chart (Entrega de Valor):**
    *   *Métrica:* SP acumulados completados vs Alcance total planificado (120 SP).
    *   *Frecuencia:* Fin de cada sprint.
*   **Tiempo de Ciclo (Cycle Time):**
    *   *Métrica:* Días transcurridos desde que una historia pasa a `In Progress` hasta que se declara `Done`.
    *   *Control Estadístico:* Promedio X̄ = 7.7 días | UCL (Límite Superior) = 14.5 días | LCL (Límite Inferior) = 0.9 días.
    *   *Acción Correctiva:* Si una historia cruza el UCL (como ocurrió con la `HU-07` que tardó 14 días), se debe subdividir en tareas de menor alcance en la siguiente planificación.

---

## 2. Métricas de Calidad de Software (SonarQube Gates)
El análisis estático de código corre en cada fase de integración para asegurar la mantenibilidad del stack MERN:

*   **Cobertura de Pruebas Unitarias (Code Coverage):**
    *   *Métrica:* Porcentaje de líneas de código probadas por la suite Jest.
    *   *Umbral Mínimo:* **80.0%** (Quality Gate SonarQube).
    *   *Resultado SGOHA:* **92.08%** de cobertura en líneas.
*   **Duplicación de Código (Duplications):**
    *   *Métrica:* Porcentaje de líneas duplicadas.
    *   *Umbral Máximo:* **3.0%**.
    *   *Resultado SGOHA:* **0.8%** de duplicidad.
*   **Deuda Técnica (Maintainability Rating):**
    *   *Métrica:* Calificación A-E según tiempo estimado de remediación de Code Smells.
    *   *Meta:* **Clasificación A** (Deuda inferior a 2 horas para ~3,500 LOC).
    *   *Resultado SGOHA:* Clasificación A (12 smells, deuda estimada de 1.5 horas).

---

## 3. Control de Procesos y Git Flow
Para garantizar la integridad del código en el repositorio, se aplican los siguientes disparadores:
1.  **Peer Review Obligatorio:** Todo Pull Request en GitHub hacia `develop` o `main` requiere la revisión y firma del segundo desarrollador (Giovany / Kenedy).
2.  **DoD (Definition of Done) Estricto:** Ninguna tarea se marca completada si tiene tests Jest fallidos o advertencias de linter activas (Airbnb Style).

---
*Universidad Continental — Taller de Proyectos 2 — 2026*
