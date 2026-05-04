# Presupuesto del Proyecto — SGOHA
## Sistema de Generación Óptima de Horarios Académicos
**Universidad Continental | Taller de Proyectos 2 | 2026**

---

## 1. Información General

| Campo | Detalle |
|---|---|
| **Proyecto** | SGOHA – Generación Óptima de Horarios Académicos |
| **Equipo** | Sanchez Ramos, Giovany / Calderon Aliaga, Kenedy |
| **Metodología** | Scrum – Spec-Driven Development (SDD) |
| **Inicio** | 23/03/2026 |
| **Fin estimado** | 01/06/2026 |
| **Duración** | 10 semanas — 5 Sprints (Sprint 0 al Sprint 4) |
| **Moneda** | Soles peruanos (PEN / S/.) |

---

## 2. Resumen Ejecutivo de Costos

| Categoría | Costo Total (S/.) | % del Presupuesto |
|---|---:|:---:|
| Recursos Humanos | S/. 5,112.00 | 83.4% |
| Infraestructura Tecnológica | S/. 270.00 | 4.4% |
| Costos Indirectos | S/. 745.00 | 12.2% |
| **TOTAL PRESUPUESTO** | **S/. 6,127.00** | **100%** |

---

## 3. Recursos Humanos

**Tarifa base:** S/. 12.00/hora — Desarrollador Junior (mercado Huancayo, 2026)

| Integrante / Rol | Actividad Principal | Sp0 | Sp1 | Sp2 | Sp3 | Sp4 | Total Horas | Costo (S/.) |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|---:|
| Sanchez Ramos, Giovany (Full-Stack / Scrum Master) | Arquitectura, Backend CSP, Coordinación | 20 | 16 | 30 | 24 | 18 | 108 | S/. 1,296.00 |
| Sanchez Ramos, Giovany (Full-Stack / Scrum Master) | Documentación SDD, Especificaciones, README | 10 | 8 | 6 | 6 | 8 | 38 | S/. 456.00 |
| Calderon Aliaga, Kenedy (Full-Stack / QA) | Frontend React/TypeScript, Portal Alumno | 8 | 18 | 24 | 30 | 14 | 94 | S/. 1,128.00 |
| Calderon Aliaga, Kenedy (Full-Stack / QA) | Pruebas TDD, Integración, Revisión PR | 8 | 10 | 16 | 14 | 14 | 62 | S/. 744.00 |
| **TOTALES** | | **46** | **52** | **76** | **74** | **54** | **302 h** | **S/. 3,624.00** |

> **Nota:** El costo total de RRHH incluye la tarifa base × horas trabajadas. Los sprints 2 y 3 concentran mayor carga por ser las fases de desarrollo intensivo del backend CSP y el frontend.

### Relación entre complejidad CSP y costo de RRHH

El Sprint 2 representa el mayor costo de RRHH (S/. 912.00) debido a la implementación de los algoritmos AC-3, Backtracking con MRV y LCV — la parte más compleja del sistema. La naturaleza NP-hard del problema CSP requiere mayor tiempo de diseño, prueba y depuración en comparación con módulos CRUD estándar.

---

## 4. Infraestructura Tecnológica

| Componente | Tipo | Costo Mensual (S/.) | Meses | Costo Total (S/.) |
|---|---|:---:|:---:|---:|
| MongoDB Atlas (M0 Free Tier) | Base de datos cloud | S/. 0.00 | 3 | S/. 0.00 |
| Vercel (Frontend Deploy) | Hosting frontend | S/. 0.00 | 3 | S/. 0.00 |
| Render.com (Backend Free) | Hosting backend | S/. 0.00 | 3 | S/. 0.00 |
| GitHub (repositorio) | Control de versiones | S/. 0.00 | 3 | S/. 0.00 |
| VS Code + extensiones | IDE / Herramientas Dev | S/. 0.00 | 3 | S/. 0.00 |
| Node.js + npm ecosystem | Runtime / Dependencias | S/. 0.00 | 3 | S/. 0.00 |
| Postman (API testing) | Testing | S/. 0.00 | 3 | S/. 0.00 |
| Equipos de cómputo personales (2 laptops, depreciación) | Hardware | S/. 60.00 | 3 | S/. 180.00 |
| Conexión a Internet (2 usuarios) | Conectividad | S/. 50.00 | 3 | S/. 150.00 |* |
| Electricidad estimada (2 equipos) | Servicios básicos | S/. 20.00 | 3 | S/. 60.00 |
| Licencias Windows / herramientas (proporcional) | Licencias | S/. 10.00 | 3 | S/. 30.00 |
| **TOTAL INFRAESTRUCTURA** | | | | **S/. 420.00** |

> *Internet: S/. 75/mes plan × 2 usuarios × participación proporcional al proyecto (~33%).

**Factores de incremento de costos a futuro:** Si el sistema se lleva a producción real, los costos de infraestructura escalarían significativamente: MongoDB Atlas M10 (~S/. 220/mes), hosting dedicado (~S/. 100/mes) y dominio personalizado (~S/. 50/año).

---

## 5. Costos Indirectos

| Concepto | Descripción | Base de Cálculo | Costo (S/.) |
|---|---|---|---:|
| Transporte y reuniones de equipo | Movilidad para coordinación presencial | 2 veces/sem × 10 sem × S/. 3 | S/. 60.00 |
| Impresión de documentación | Entregables, rúbricas, especificaciones | Estimado global | S/. 30.00 |
| Capacitación / cursos en línea | Tutoriales CSP, documentación técnica | Recursos gratuitos | S/. 0.00 |
| Margen de contingencia (10%) | Reserva para imprevistos de alcance | 10% sobre RRHH + Infra | S/. 404.40 |
| Tiempo de coordinación Scrum | Dailys, retrospectivas, planificación | S/. 12/h × 20h estimadas | S/. 240.00 |
| Costo de presentación final | Materiales para exposición y demo | Estimado global | S/. 50.00 |
| Overhead académico | Documentación universitaria obligatoria | S/. 10/h × 15h estimadas | S/. 150.00 |
| **TOTAL INDIRECTOS** | | | **S/. 934.40** |

---

## 6. Evolución de Costos por Sprint

| Sprint | Período | RRHH (S/.) | Infra (S/.) | Indirecto (S/.) | **Total Sprint** | **Acumulado** |
|---|---|---:|---:|---:|---:|---:|
| Sprint 0 | 23/03 – 05/04/2026 | S/. 552.00 | S/. 42.00 | S/. 100.00 | S/. 694.00 | S/. 694.00 |
| Sprint 1 | 06/04 – 19/04/2026 | S/. 624.00 | S/. 42.00 | S/. 150.00 | S/. 816.00 | S/. 1,510.00 |
| Sprint 2 | 20/04 – 10/05/2026 | S/. 912.00 | S/. 63.00 | S/. 200.00 | S/. 1,175.00 | S/. 2,685.00 |
| Sprint 3 | 11/05 – 31/05/2026 | S/. 888.00 | S/. 63.00 | S/. 250.00 | S/. 1,201.00 | S/. 3,886.00 |
| Sprint 4 | 01/06/2026 | S/. 648.00 | S/. 60.00 | S/. 150.00 | S/. 858.00 | S/. 4,744.00 |
| **TOTAL** | | **S/. 3,624.00** | **S/. 270.00** | **S/. 850.00** | **S/. 4,744.00** | |

> **Interpretación:** El costo se concentra en los Sprints 2 y 3 (~50% del total), correspondientes al desarrollo intensivo del motor CSP y el frontend. El Sprint 0 es el de menor costo al ser principalmente análisis y planificación.

---

## 7. Análisis de Sostenibilidad — Green Software

El SGOHA adopta los principios del **Green Software Foundation** en su desarrollo:

| Principio | Estrategia Aplicada | Estado |
|---|---|:---:|
| **Eficiencia energética** | MongoDB Atlas Free Tier y Vercel/Render gratuitos: servidores compartidos optimizan consumo vs. servidor físico propio | ✅ |
| **Hardware eficiente** | AC-3 reduce el espacio de búsqueda hasta un 60% antes del backtracking, minimizando ciclos de CPU | ✅ |
| **Demanda ajustable** | Generación de horarios solo bajo demanda explícita del administrador, sin procesos en background | ✅ |
| **Medición de rendimiento** | El sistema reporta `executionTimeMs` y `backtrackCount` por generación, permitiendo optimizar | ✅ |
| **Eficiencia de red** | API REST retorna solo campos necesarios; Zustand cachea estado en frontend evitando peticiones redundantes | ✅ |
| **Escalabilidad sostenible** | Arquitectura MERN escala horizontalmente solo cuando la demanda lo requiera | 🔄 Planificado |
| **Calidad del software** | TDD con cobertura >70% reduce bugs, evitando ciclos de depuración energéticamente costosos | ✅ |

**Conclusión:** El costo ambiental del SGOHA en su etapa académica es mínimo. El uso de infraestructura gratuita de bajo consumo compartido, algoritmos computacionalmente eficientes (AC-3 + MRV + LCV) y ejecución bajo demanda representan decisiones técnicas alineadas con el desarrollo de software sostenible. Una migración a producción real requeriría una evaluación de huella de carbono de la infraestructura seleccionada.

---

## 8. Factores de Incremento de Costos

Los principales drivers de costo identificados en el proyecto son:

1. **Complejidad del algoritmo CSP:** La naturaleza NP-hard del problema de horarios implica que el tiempo de diseño, implementación y prueba del motor CSP (AC-3 + Backtracking + MRV + LCV) representa aproximadamente el 35% del total de horas de RRHH.

2. **Currículo flexible:** Las restricciones dinámicas propias de un currículo flexible (alumnos con distintas combinaciones de cursos) incrementan el espacio de restricciones del CSP, requiriendo mayor tiempo de modelado y pruebas.

3. **Stack full-stack con dos integrantes:** Un equipo pequeño de 2 personas cubre todos los roles (backend, frontend, QA, documentación, Scrum), lo que genera riesgo de cuello de botella y potencial incremento de horas por cambio de contexto.

4. **Deuda técnica inicial:** La eliminación accidental del directorio de tests en el repositorio implicó retrabajo no planificado, ilustrando cómo la gestión deficiente del repositorio puede incrementar costos operativos.

---

*Universidad Continental — Ingeniería de Sistemas e Informática — Taller de Proyectos 2 — 2026*
