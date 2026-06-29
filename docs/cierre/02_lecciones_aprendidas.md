# 🧠 SGOHA — Lecciones Aprendidas

El desarrollo del **Sistema de Generación Óptima de Horarios Académicos (SGOHA)** ha sido una experiencia técnica intensiva. Este documento presenta un análisis crítico y reflexivo de los aciertos de diseño, los fallos de implementación experimentados y las estrategias de mitigación adoptadas, sirviendo como base de conocimiento para futuros despliegues y evoluciones arquitectónicas.

---

## 1. Qué Funcionó Bien (Aciertos y Buenas Prácticas)

### A. Modularización del Algoritmo Solver de Restricciones (CSP)
El desacoplamiento del motor CSP en submódulos especializados en la carpeta `backend/src/csp` facilitó el desarrollo colaborativo y las pruebas de caja negra:
*   **Separación clara de responsabilidades:** Se separó la reducción del dominio (`ac3.js`), la estrategia de búsqueda iterativa (`solver.js`), las heurísticas de selección de variables y valores (`heuristics.js`), y el catálogo de restricciones físicas y lógicas (`constraints.js`).
*   **Facilidad de Testing (TDD):** Al no estar el motor mezclado con la lógica de negocio ni con la base de datos, se crearon pruebas unitarias con Jest para validar individualmente las reglas duras (como la superposición de docentes) antes de escribir el backtracking.
*   **Mantenibilidad:** Si se requiere agregar una nueva restricción (por ejemplo, límites de horas consecutivas para docentes), solo se modifica `constraints.js` sin alterar el flujo del backtrack.

### B. Tipado Estricto con TypeScript en el Frontend
El uso de TypeScript en la carpeta `frontend/src` evitó fallos en tiempo de ejecución:
*   **Contratos de Datos Claros:** Definir interfaces para entidades como `Teacher`, `Course`, `Classroom` y `ScheduleRun` eliminó ambigüedades sobre qué campos retornaba la API REST del backend.
*   **Refactorización Segura:** Los cambios en los esquemas de datos del backend (por ejemplo, la estructura de la disponibilidad docente en `availability`) fueron inmediatamente advertidos por el compilador de TypeScript en los componentes del cliente, reduciendo las regresiones visuales.
*   **Autocompletado y Productividad:** Facilitó la edición ágil de la interfaz visual en un equipo de desarrollo de dos integrantes.

### C. Enfoque Spec-Driven Development (SDD)
Alinear los entregables técnicos a través de una especificación formal antes de codificar (`Spec.md` y `constitution.md`) redujo drásticamente el retrabajo en la fase de integración backend-frontend. Ambas partes conocían las firmas de los endpoints de antemano.

---

## 2. Qué No Funcionó (Retos y Fallos Técnicos)

### A. Problemas de Rendimiento al Renderizar la Matriz de Horarios en React
El renderizado inicial del horario semanal (un tablero de lunes a sábado, dividido en bloques de 2 horas para múltiples aulas y docentes) experimentó problemas de latencia severos:
*   **Causa:** Se renderizaban cientos de celdas interactivas en una sola cuadrícula. Cualquier cambio de estado (como seleccionar un curso para asignación manual) desencadenaba un re-renderizado en cascada de toda la matriz.
*   **Impacto:** Lags perceptibles (>400ms) que afectaban la experiencia del usuario y causaban bloqueos momentáneos en navegadores con especificaciones de hardware modestas.
*   **Mitigación:** Se implementó la memorización de componentes con `React.memo` y hooks de optimización como `useMemo` y `useCallback` para evitar actualizaciones innecesarias del árbol de componentes visuales que no sufrieron cambios directos.

### B. Conflictos Recurrentes con `package-lock.json` y Desfases de Dependencias
El flujo de desarrollo colaborativo se vio afectado constantemente por conflictos de fusión en el archivo `package-lock.json`:
*   **Causa:** Cada desarrollador instalaba paquetes utilitarios locales con diferentes versiones de Node.js o NPM, lo que alteraba las dependencias transitivas en el lockfile.
*   **Impacto:** Roturas del entorno local tras realizar `git pull`, requiriendo borrar la carpeta `node_modules` y ejecutar reinstalaciones completas frecuentemente.
*   **Mitigación:** Se homologó el entorno de desarrollo fijando la versión de Node.js LTS en el bloque `engines` de `package.json`, y se definieron reglas estrictas en Git para resolver conflictos en `package-lock.json` priorizando la versión de la rama principal (`main`).

### C. Regresión y Pérdida de Código por Gestión de Repositorio (Commit `a2bbb60`)
Durante el Sprint 4 se sufrió la eliminación accidental del directorio `tests/` debido a un merge conflict resuelto incorrectamente en la rama de integración:
*   **Causa:** Falta de un flujo formal de protección de ramas y resolución desorganizada de conflictos de código en remoto.
*   **Impacto:** Rework de aproximadamente 4 horas para reconstruir y verificar las pruebas unitarias del algoritmo.
*   **Mitigación:** Se adoptó inmediatamente la guía de flujo estructurado [GitFlow_Guide.md](file:///D:/Proyecto_horarios_UC/docs/GitFlow_Guide.md) y se protegió la rama `main` requiriendo aprobación previa (Peer Review) para cualquier fusión.

---

## 3. Acciones Correctivas y Oportunidades de Mejora

Para futuras iteraciones arquitectónicas de SGOHA, se proponen las siguientes acciones correctivas e innovaciones tecnológicas:

### A. Migración a Workers Hilos de Ejecución (Worker Threads) o Microservicio CSP Aislado
*   **Problema actual:** Node.js es monohilo por diseño. Cuando el motor CSP corre un problema complejo de gran envergadura (más de 100 secciones académicas), consume el 100% de la CPU en el hilo principal del servidor Express, bloqueando temporalmente otras peticiones REST concurrentes de la aplicación.
*   **Solución propuesta:** 
    1.  *Corto plazo:* Delegar la ejecución del algoritmo `solver.js` a un subproceso usando el módulo nativo `worker_threads` de Node.js.
    2.  *Largo plazo:* Extraer el motor CSP a un microservicio aislado escrito en un lenguaje de alto rendimiento y tipado estricto adaptado para cálculos pesados (como **Python** usando PyDecoders/OR-Tools, o **Go/Rust**), comunicando el backend mediante llamadas gRPC o colas de mensajes (RabbitMQ).

### B. Implementación de Virtualización de Listas en el UI de Horarios
*   **Mejora de renderizado:** Sustituir la cuadrícula HTML estándar por técnicas de **List Virtualization** (usando librerías como `react-window` o `react-virtualized`). Esto asegura que React renderice en el DOM únicamente los bloques horarios visibles en la pantalla del navegador del usuario, reduciendo el conteo de elementos en el árbol del DOM en un 80% y garantizando un scroll fluido a 60 FPS.

### C. Automatización de Calidad (Integración Continua / CI-CD)
*   **Control preventivo:** Configurar una pipeline de GitHub Actions que corra automáticamente la suite de tests Jest (`npm test`) y el análisis estático de SonarQube definido en [sonar-project.properties](file:///D:/Proyecto_horarios_UC/sonar-project.properties) en cada Pull Request.
*   **Bloqueo automático:** Impedir que ramas de código que tengan tests rotos, cobertura inferior al 90% o vulnerabilidades en dependencias (`npm audit`) puedan mezclarse en las ramas protegidas `develop` o `main`.

### D. Estrategia del Ciclo de Vida de Dependencias
*   Establecer la política de no modificar el archivo `package.json` sin previa comunicación en los Daily Scrum. Usar la herramienta `npm ci` en lugar de `npm install` en servidores de despliegue y pipelines CI para garantizar consistencia absoluta en el build de dependencias.

---
*Universidad Continental — Taller de Proyectos 2 — 2026*
