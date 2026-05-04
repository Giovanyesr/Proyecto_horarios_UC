# Guía de Git Flow — SGOHA
## Sistema de Generación Óptima de Horarios Académicos
**Universidad Continental | Taller de Proyectos 2 | 2026**

---

## 1. Estrategia de Ramas (Git Flow)

El proyecto adopta una variante simplificada de **Git Flow** adaptada a un equipo de 2 personas con 5 sprints. La estrategia garantiza trazabilidad entre el backlog (Jira), los commits y las funcionalidades implementadas.

### Estructura de ramas

```
main              ← Producción / Entregables finales (PROTEGIDA)
│
develop           ← Integración continua (rama base de trabajo)
│
├── feature/HU-01-autenticacion-jwt
├── feature/HU-02-crud-docentes
├── feature/HU-03-crud-cursos-aulas
├── feature/HU-04-gestion-matriculas
├── feature/HU-05-modelado-csp
├── feature/HU-06-algoritmo-ac3
├── feature/HU-07-backtracking-mrv-lcv
├── feature/HU-08-api-generacion-horarios
├── feature/HU-09-frontend-dashboard
├── feature/HU-10-frontend-docentes
├── feature/HU-11-frontend-horarios
├── feature/HU-12-portal-alumno
├── feature/HU-13-integracion-e2e
├── feature/HU-14-suite-tdd
├── feature/HU-15-documentacion-sdd
│
├── release/v1.0-sprint4      ← Preparación de entrega final
│
└── hotfix/descripcion        ← Correcciones urgentes en main
```

### Reglas de cada rama

| Rama | Propósito | Merge hacia | Merge desde | Push directo |
|---|---|---|---|---|
| `main` | Código en producción / entregables | — | `release/*`, `hotfix/*` | ❌ NUNCA |
| `develop` | Integración de features | `release/*` | `feature/*` | ⚠️ Solo merge |
| `feature/*` | Una historia de usuario | `develop` | `develop` | ✅ El autor |
| `release/*` | Preparación de versión | `main` + `develop` | `develop` | ✅ Con revisión |
| `hotfix/*` | Corrección urgente | `main` + `develop` | `main` | ✅ Con revisión |

---

## 2. Convención de Commits Semánticos

Todos los commits deben seguir la especificación **Conventional Commits**:

```
<tipo>(<ámbito>): <descripción corta>

[cuerpo opcional — detalle de qué y por qué]

[footer opcional — referencias a Jira: Refs: HU-XX]
```

### Tipos de commit permitidos

| Tipo | Uso | Ejemplo |
|---|---|---|
| `feat` | Nueva funcionalidad | `feat(csp): implementar algoritmo AC-3` |
| `fix` | Corrección de bug | `fix(auth): corregir expiración de token JWT` |
| `docs` | Documentación | `docs(spec): actualizar casos límite CL-07` |
| `test` | Agregar o modificar tests | `test(csp): agregar tests para RC-01 y RC-02` |
| `refactor` | Refactoring sin cambio funcional | `refactor(solver): extraer heurística MRV a módulo separado` |
| `chore` | Tareas de mantenimiento | `chore(deps): actualizar mongoose a v8.5` |
| `style` | Formato, espacios (sin lógica) | `style(frontend): aplicar prettier al portal alumno` |
| `perf` | Mejora de rendimiento | `perf(csp): reducir backtrackings con forward checking` |
| `ci` | Integración continua | `ci: agregar workflow de tests en GitHub Actions` |

### Ámbitos del proyecto

| Ámbito | Descripción |
|---|---|
| `auth` | Módulo de autenticación JWT |
| `csp` | Motor de generación CSP (AC-3, Backtracking, MRV, LCV) |
| `api` | Rutas y controladores Express |
| `models` | Modelos Mongoose / MongoDB |
| `frontend` | Componentes y páginas React |
| `admin` | Panel de administración |
| `student` | Portal del alumno |
| `docs` | Documentación del proyecto |
| `spec` | Artefactos SDD (constitution.md, Spec.md) |
| `tests` | Suite de pruebas TDD |
| `deps` | Dependencias (package.json) |
| `config` | Configuración del proyecto |

### Ejemplos de buenos commits

```bash
# Feature nueva
feat(csp): implementar propagación de restricciones AC-3

Aplica el algoritmo Arc Consistency 3 para reducir dominios antes del
backtracking. Esto detecta inviabilidad temprana y reduce el espacio
de búsqueda hasta un 60% en escenarios típicos.

Refs: HU-06

# Bug fix
fix(csp): corregir detección de solapamiento de alumnos en RC-03

El método checkStudentConflict no consideraba matrículas con estado
'withdrawn', generando falsos conflictos en la generación.

Refs: HU-08

# Documentación
docs(spec): agregar casos límite CL-09 y CL-10 en Spec.md

Casos límite para cursos sin docente asignado y docentes con 20 cursos
en el mismo día. Ambos derivan en estado infeasible por RC-04 y RN-05.

Refs: HU-15

# Tests
test(csp): agregar cobertura para restricciones duras RC-01 a RC-03

Se agregan 12 casos de prueba en constraints.test.js cubriendo
solapamiento de docente, aula y alumnos en distintos escenarios.

Refs: HU-14

# Chore
chore: remover node_modules del tracking de git

Los directorios backend/node_modules y frontend/node_modules fueron
rastreados accidentalmente. Se agregan al .gitignore y se eliminan
del índice sin borrar los archivos locales.
```

### Ejemplos de commits incorrectos ❌

```bash
# MAL — demasiado vago
git commit -m "fix stuff"
git commit -m "cambios"
git commit -m "update"

# MAL — mezcla varios temas
git commit -m "agregar docentes, arreglar bug login y actualizar readme"

# MAL — sin tipo semántico
git commit -m "Implementar AC-3"
git commit -m "Agregar pruebas"
```

---

## 3. Flujo de Trabajo por Historia de Usuario

### Paso a paso completo

```bash
# 1. Asegurarse de estar en develop actualizado
git checkout develop
git pull origin develop

# 2. Crear rama de feature desde develop
git checkout -b feature/HU-06-algoritmo-ac3

# 3. Trabajar en la funcionalidad
#    ... escribir código ...

# 4. Commits semánticos durante el desarrollo
git add backend/src/csp/ac3.js
git commit -m "feat(csp): implementar esqueleto del algoritmo AC-3

Define la función revise() que elimina valores inconsistentes
del dominio de una variable xi respecto a xj.

Refs: HU-06"

git add backend/tests/csp/ac3.test.js
git commit -m "test(csp): agregar tests unitarios para función revise() de AC-3

Cobertura: dominio vacío, arco consistente, reducción parcial.

Refs: HU-06"

git add backend/src/csp/ac3.js
git commit -m "feat(csp): completar implementación de AC-3 con cola de arcos

La cola inicializa con todos los arcos del grafo de restricciones.
Procesamiento en orden FIFO para garantizar convergencia.

Refs: HU-06"

# 5. Ejecutar tests antes del PR
cd backend && npm test

# 6. Push de la rama feature
git push origin feature/HU-06-algoritmo-ac3

# 7. Crear Pull Request en GitHub
#    Título: "feat(csp): implementar algoritmo AC-3 [HU-06]"
#    Descripción: ver plantilla de PR más abajo
#    Reviewer: el otro integrante del equipo

# 8. Revisión y aprobación del PR

# 9. Merge a develop (squash si hay muchos commits intermedios)
git checkout develop
git merge --no-ff feature/HU-06-algoritmo-ac3 -m "feat(csp): merge HU-06 — algoritmo AC-3 completado"
git push origin develop

# 10. Eliminar rama feature local y remota
git branch -d feature/HU-06-algoritmo-ac3
git push origin --delete feature/HU-06-algoritmo-ac3
```

---

## 4. Plantilla de Pull Request

Usar esta plantilla al crear cada PR en GitHub:

```markdown
## Descripción
Breve descripción de qué se implementó y por qué.

## Historia de Usuario
- Jira: HU-XX — [nombre de la historia]
- Sprint: Sprint N

## Cambios realizados
- [ ] Descripción del cambio 1
- [ ] Descripción del cambio 2

## Restricciones CSP relacionadas
- RC-XX: descripción (si aplica)

## Tests
- [ ] Tests unitarios ejecutados: `npm test`
- [ ] Cobertura mantiene ≥ 70%
- [ ] Sin regresiones en suite existente

## Checklist antes del merge
- [ ] Commits siguen convención semántica
- [ ] Código revisado por el otro integrante
- [ ] Documentación actualizada (si aplica)
- [ ] No se incluyen archivos node_modules
- [ ] constitution.md / Spec.md actualizados (si hubo cambio de restricciones)
```

---

## 5. Flujo de Release (fin de sprint)

```bash
# Al finalizar Sprint N, crear rama release
git checkout develop
git pull origin develop
git checkout -b release/v1.0-sprintN

# Ajustes finales (versión, changelog, documentación)
# NO agregar nuevas funcionalidades aquí

git commit -m "chore(release): preparar versión v1.0-sprintN

- Actualizar versión en package.json
- Actualizar CHANGELOG con HUs completadas en SprintN"

# Merge a main
git checkout main
git merge --no-ff release/v1.0-sprintN -m "release: v1.0-sprintN"
git tag -a v1.0-sprintN -m "Release Sprint N — [descripción]"
git push origin main --tags

# Merge de vuelta a develop (para incluir ajustes del release)
git checkout develop
git merge --no-ff release/v1.0-sprintN
git push origin develop

# Eliminar rama release
git branch -d release/v1.0-sprintN
git push origin --delete release/v1.0-sprintN
```

---

## 6. Flujo de Hotfix (corrección urgente)

```bash
# Si se detecta un bug crítico en main
git checkout main
git pull origin main
git checkout -b hotfix/fix-csp-timeout

# Corregir el bug
git commit -m "fix(csp): corregir condición de timeout que ignoraba asignaciones parciales

El algoritmo retornaba estado 'infeasible' en lugar de 'timeout'
cuando superaba el límite de 60 segundos, perdiendo la asignación
parcial calculada."

# Merge a main y develop
git checkout main
git merge --no-ff hotfix/fix-csp-timeout
git tag -a v1.0.1 -m "Hotfix: timeout CSP"
git push origin main --tags

git checkout develop
git merge --no-ff hotfix/fix-csp-timeout
git push origin develop

git branch -d hotfix/fix-csp-timeout
git push origin --delete hotfix/fix-csp-timeout
```

---

## 7. Configuración Inicial del Repositorio

### Ejecutar una sola vez para configurar Git Flow en el repositorio local

```bash
# Configurar identidad global (si no está configurada)
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Crear rama develop desde main
git checkout main
git pull origin main
git checkout -b develop
git push origin develop

# Configurar rama main como protegida en GitHub:
# Settings → Branches → Add rule → main
# ✅ Require pull request before merging
# ✅ Require approvals: 1
# ✅ Do not allow bypassing the above settings
```

### Configurar mensaje de commit por defecto

Crear archivo `.gitmessage` en la raíz del proyecto:

```
# <tipo>(<ámbito>): <descripción corta (máx 72 caracteres)>
#
# Tipos: feat | fix | docs | test | refactor | chore | style | perf | ci
# Ámbitos: auth | csp | api | models | frontend | admin | student | docs | spec | tests
#
# [Cuerpo opcional: qué y por qué, no cómo]
#
# Refs: HU-XX
```

Activarlo:
```bash
git config commit.template .gitmessage
```

---

## 8. Trazabilidad Jira ↔ GitHub

Para garantizar trazabilidad completa entre el backlog y los commits:

| En Jira | En GitHub |
|---|---|
| Historia `HU-06` en estado *In Progress* | Rama `feature/HU-06-algoritmo-ac3` abierta |
| Historia `HU-06` en estado *In Review* | PR abierto hacia `develop` |
| Historia `HU-06` en estado *Done* | PR mergeado, rama eliminada |
| Sprint cerrado | Rama `release/v1.0-sprintN` mergeada a `main` |

**Formato de referencia en commits:** `Refs: HU-06` (al final del mensaje)

---

## 9. Comandos de Verificación Rápida

```bash
# Ver el árbol de ramas con historia
git log --oneline --graph --all

# Ver todos los commits de una rama feature
git log --oneline feature/HU-06-algoritmo-ac3

# Verificar que no hay archivos sensibles en el índice
git status

# Verificar que node_modules no está rastreado
git ls-files | grep node_modules

# Ver diff antes de commitear
git diff --staged

# Deshacer último commit (sin perder cambios)
git reset --soft HEAD~1
```

---

*Universidad Continental — Ingeniería de Sistemas e Informática — Taller de Proyectos 2 — 2026*
