# 📅 SGOHA — Sistema de Generación Óptima de Horarios Académicos

<div align="center">

**Universidad Continental — Ingeniería de Sistemas e Informática**
**Taller de Proyectos 2 | Docente: Daniel Gamarra Moreno | 2026**

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-66%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage->90%25-brightgreen)
![Version](https://img.shields.io/badge/Version-v1.1-blue)

</div>

---

## 👥 Equipo de Desarrollo

| Integrante | Código | Rol |
|---|---|---|
| SANCHEZ RAMOS, Giovany | U20211B994 | Full-Stack / Scrum Master |
| CALDERON ALIAGA, Kenedy | U20211C078 | Full-Stack / QA |

---

## 📌 Descripción General

El **SGOHA** es una aplicación web full-stack (stack MERN) que resuelve el problema de asignación automática de horarios universitarios en entornos de currículo flexible. El sistema modela el problema como un **Problema de Satisfacción de Restricciones (CSP)** y lo resuelve con algoritmos de inteligencia artificial.

**¿Qué hace?**
- Los **administradores** gestionan docentes, cursos, aulas y matrículas, y generan horarios académicos libres de conflictos con un solo clic.
- Los **alumnos** consultan su horario asignado y registran su disponibilidad horaria.
- El **motor CSP** garantiza matemáticamente que ninguna asignación viola las restricciones del sistema.

**Estado del proyecto:** ✅ `v1.1` — Sistema completo y funcional

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                         │
│              React 18 + TypeScript + Tailwind CSS                │
│         Zustand (estado) · Axios (HTTP) · React Router           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST  (Puerto 5173)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                    │
│                    Base URL: /api/v1  (Puerto 8000)               │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Routes  │→ │ Services │→ │ CSP Engine │  │  Middleware  │  │
│  │ /auth    │  │ course   │  │ ac3.js     │  │ JWT Auth     │  │
│  │ /teachers│  │ schedule │  │ solver.js  │  │ Rate Limiter │  │
│  │ /courses │  │ enroll.  │  │ heuristics │  │ Helmet       │  │
│  │ /schedule│  └──────────┘  │ constraints│  │ Error Handler│  │
│  └──────────┘                └────────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Mongoose ODM
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (MongoDB 8.x)                    │
│  Users · Teachers · Courses · Classrooms · Enrollments           │
│  ScheduleRun · ScheduledSection · TeacherAvailability            │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo de generación de horarios

```
Admin solicita generación
        │
        ▼
buildProblem() ──→ Carga cursos, docentes, aulas, matrículas de MongoDB
        │
        ▼
ac3(problem) ──────→ Propaga restricciones, reduce dominios
        │               Si dominio vacío → status: "infeasible"
        ▼
backtrack() ────────→ Búsqueda con MRV + LCV + Forward Checking
        │               Si timeout (60s) → status: "timeout"
        ▼
persist() ──────────→ Guarda solución válida en MongoDB
        │               status: "completed"
        ▼
API responde con horarios generados
```

---

## 🧠 Modelado del Problema CSP

El núcleo del sistema es un **CSP = (X, D, C)**:

```
X = {x₁, x₂, ..., xₙ}      Variables: cursos con matrículas activas
D = {D₁, D₂, ..., Dₙ}      Dominios: combinaciones (docente, aula, franja) válidas
C = {RC-01, ..., RC-07}     Restricciones definidas en constitution.md
```

### Restricciones Duras (RC) — ninguna solución puede violarlas

| ID | Restricción | Módulo |
|---|---|---|
| RC-01 | Un docente no puede impartir dos cursos en el mismo horario | `constraints.js` |
| RC-02 | Un aula no puede albergar dos cursos simultáneos | `constraints.js` |
| RC-03 | Un alumno matriculado en dos cursos no puede tener ambos al mismo tiempo | `constraints.js` |
| RC-04 | El horario asignado debe estar dentro de la disponibilidad del docente | `problem.js` |
| RC-05 | La capacidad del aula debe ser ≥ alumnos matriculados | `problem.js` |
| RC-06 | Solo se genera horario para cursos con docente asignado | `problem.js` |
| RC-07 | El tipo de aula debe ser compatible con el tipo de curso | `problem.js` |

### Restricciones Blandas (RB) — preferencias de optimización

| ID | Preferencia |
|---|---|
| RB-01 | Respetar disponibilidad declarada por los alumnos |
| RB-02 | Distribuir equitativamente la carga horaria de los docentes |
| RB-03 | Preferir franjas de alta asistencia (8-12h, 14-18h) |
| RB-04 | Minimizar cambios de aula para grupos consecutivos |

### Algoritmos implementados

| Módulo | Archivo | Función |
|---|---|---|
| **AC-3** | `src/csp/ac3.js` | Propagación de restricciones — reduce dominios antes del backtracking |
| **Backtracking** | `src/csp/solver.js` | Búsqueda sistemática con retroceso |
| **MRV** | `src/csp/heuristics.js` | Selecciona la variable con menor dominio restante |
| **LCV** | `src/csp/heuristics.js` | Ordena valores que menos restringen a variables vecinas |
| **Forward Checking** | `src/csp/solver.js` | Detecta dominios vacíos anticipadamente |
| **Restricciones** | `src/csp/constraints.js` | Valida RC-01, RC-02, RC-03 |
| **Franjas horarias** | `src/csp/timeSlots.js` | Genera y valida bloques de tiempo |

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Base de datos** | MongoDB | 8.x |
| **Backend** | Node.js + Express | v18+ / ^4.19 |
| **Frontend** | React + TypeScript | ^18.3 / 5.x |
| **ODM** | Mongoose | ^8.4 |
| **Autenticación** | JWT (jsonwebtoken) | ^9.0 |
| **Validación** | Zod + React Hook Form | — |
| **Estilos** | Tailwind CSS | ^3.4 |
| **Build tool** | Vite | ^6.0 |
| **Estado global** | Zustand | ^5.0 |
| **HTTP Client** | Axios | — |
| **Routing** | React Router DOM | — |
| **Seguridad** | bcryptjs, helmet, express-rate-limit | — |
| **Testing** | Jest | ^30 |

---

## 📁 Estructura del Repositorio

```
Proyecto_horarios_UC/
├── backend/                        # Servidor Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Conexión a MongoDB
│   │   ├── csp/                    # 🧠 Motor CSP
│   │   │   ├── ac3.js              # Algoritmo AC-3
│   │   │   ├── solver.js           # Backtracking + Forward Checking
│   │   │   ├── heuristics.js       # MRV y LCV
│   │   │   ├── constraints.js      # RC-01, RC-02, RC-03
│   │   │   ├── problem.js          # Construcción del problema CSP
│   │   │   └── timeSlots.js        # Generación de franjas horarias
│   │   ├── middleware/
│   │   │   ├── auth.js             # Verificación JWT + roles
│   │   │   └── errorHandler.js     # Manejo centralizado de errores
│   │   ├── models/                 # Modelos Mongoose
│   │   │   ├── User.js
│   │   │   ├── Teacher.js
│   │   │   ├── Course.js
│   │   │   ├── Classroom.js
│   │   │   ├── Enrollment.js
│   │   │   ├── ScheduleRun.js
│   │   │   └── ScheduledSection.js
│   │   ├── routes/                 # Endpoints de la API REST
│   │   │   ├── auth.js
│   │   │   ├── teachers.js
│   │   │   ├── courses.js
│   │   │   ├── classrooms.js
│   │   │   ├── students.js
│   │   │   ├── enrollments.js
│   │   │   └── schedules.js
│   │   ├── services/               # Lógica de negocio
│   │   │   ├── courseService.js
│   │   │   ├── enrollmentService.js
│   │   │   └── scheduleService.js
│   │   ├── scripts/
│   │   │   └── seedData.js         # Datos iniciales de prueba
│   │   └── utils/
│   │       └── security.js
│   ├── tests/
│   │   └── csp/                    # 🧪 Suite TDD del motor CSP
│   │       ├── ac3.test.js         # 13 tests — AC-3
│   │       ├── constraints.test.js # Tests — RC-01, RC-02, RC-03
│   │       ├── heuristics.test.js  # Tests — MRV y LCV
│   │       ├── solver.test.js      # Tests — Backtracking
│   │       └── timeSlots.test.js   # Tests — franjas horarias
│   ├── server.js                   # Punto de entrada del servidor
│   └── package.json
│
├── frontend/                       # Aplicación React + TypeScript
│   ├── src/
│   │   ├── api/                    # Clientes HTTP (axios)
│   │   ├── components/             # Componentes reutilizables
│   │   │   ├── common/             # Badge, Modal, Spinner, Toast
│   │   │   ├── layout/             # AppShell, Sidebar, StudentShell
│   │   │   └── schedule/           # WeeklyCalendar
│   │   ├── hooks/                  # Custom hooks
│   │   ├── pages/
│   │   │   ├── Admin/              # Panel de administración
│   │   │   ├── Login/              # Autenticación
│   │   │   ├── Dashboard/          # Dashboard principal
│   │   │   ├── Schedules/          # Generación y visualización de horarios
│   │   │   ├── Teachers/           # Gestión de docentes
│   │   │   ├── Courses/            # Gestión de cursos
│   │   │   ├── Classrooms/         # Gestión de aulas
│   │   │   ├── Students/           # Gestión de alumnos
│   │   │   ├── Enrollments/        # Gestión de matrículas
│   │   │   └── StudentPortal/      # Portal del alumno
│   │   ├── store/                  # Estado global (Zustand)
│   │   ├── types/                  # Tipos TypeScript
│   │   └── utils/                  # Utilidades
│   └── index.html
│
├── docs/                           # 📄 Documentación del proyecto
│   ├── 3.1Planificacion_del_proyecto(jira).md
│   ├── 3.2Presupuesto_Proyecto.md
│   ├── 3.3Gestion_Riesgos_Oportunidades.md
│   ├── 3.4.a.1Constitucion.md      # constitution.md — contrato SDD
│   ├── 3.4.a.2Spec.md              # Especificación formal del sistema
│   ├── GitFlow_Guide.md            # Guía de ramas y commits semánticos
│   ├── Metricas_Agiles.md          # Burndown, Burnup, Velocidad, Control
│   ├── Metricas_Agiles_SGOHA.xlsx  # Métricas en Excel
│   ├── Presupuesto_SGOHA.xlsx      # Presupuesto en Excel
│   └── Riesgos_Oportunidades_SGOHA.xlsx
│
└── .gitignore
```

---

## ⚙️ Requisitos Previos

| Herramienta | Versión mínima | Enlace |
|---|---|---|
| Node.js | v18.x | [nodejs.org](https://nodejs.org/) |
| MongoDB | v6.x | [mongodb.com](https://www.mongodb.com/) |
| npm | v9.x (incluido con Node.js) | — |
| Git | cualquier | [git-scm.com](https://git-scm.com/) |

---

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/Giovanyesr/Proyecto_horarios_UC.git
cd Proyecto_horarios_UC
```

### 2. Configurar variables de entorno

Crea el archivo `.env` dentro de `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/horarios_uc
JWT_SECRET=h0r4r10-AI-s3cur3-k3y-2025!#$
JWT_EXPIRES_IN=8h
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Inicializar la base de datos (solo la primera vez)

```bash
cd backend
node src/scripts/seedData.js
```

Este script crea automáticamente: usuarios de prueba (admin + alumno), aulas, docentes, cursos, alumnos y matrículas de ejemplo.

### 5. Ejecutar el proyecto

Abre **dos terminales**:

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```
```
[Server] Running on http://localhost:8000
[Server] Environment: development
[MongoDB] Connected: localhost
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
```
VITE ready in ...ms
➜  Local: http://localhost:5173/
```

### 6. Abrir en el navegador

```
http://localhost:5173
```

---

## 🔐 Credenciales de Prueba

| Rol | Usuario | Contraseña | Acceso |
|---|---|---|---|
| Administrador | `admin` | `admin123` | Panel completo + generación de horarios |
| Alumno | `alumno01` | `alumno123` | Portal de consulta y disponibilidad |

---

## 🔌 API REST

**Base URL:** `http://localhost:8000/api/v1`

| Método | Endpoint | Rol | Descripción |
|---|---|---|---|
| POST | `/auth/login` | Público | Autenticación y emisión de JWT |
| POST | `/auth/register` | Público | Registro de alumno |
| GET | `/auth/me` | JWT | Datos del usuario actual |
| GET | `/teachers` | Admin | Listar docentes |
| POST | `/teachers` | Admin | Crear docente |
| PUT | `/teachers/:id` | Admin | Actualizar docente |
| DELETE | `/teachers/:id` | Admin | Eliminar docente |
| GET | `/courses` | Admin | Listar cursos |
| POST | `/courses` | Admin | Crear curso |
| GET | `/classrooms` | Admin | Listar aulas |
| POST | `/classrooms` | Admin | Crear aula |
| GET | `/enrollments` | Admin | Listar matrículas |
| **POST** | **`/schedules/generate`** | **Admin** | **🧠 Ejecutar generación CSP** |
| GET | `/schedules/runs` | Admin | Historial de generaciones |
| GET | `/schedules/runs/:id/sections` | Admin | Horarios de una generación |
| GET | `/students/:id/availability` | JWT | Disponibilidad del alumno |
| PUT | `/students/:id/availability` | Student | Actualizar disponibilidad |

### Respuesta de generación CSP

```json
{
  "status": "completed | infeasible | timeout",
  "stats": {
    "totalCourses": 10,
    "assignedCourses": 10,
    "executionTimeMs": 1234,
    "backtrackCount": 57
  },
  "schedules": [...]
}
```

---

## 🧪 Pruebas (TDD)

El módulo CSP cuenta con una suite completa de pruebas unitarias siguiendo el ciclo **Red → Green → Refactor**:

| Suite | Archivo | Tests | Cobertura |
|---|---|:---:|---|
| Algoritmo AC-3 | `ac3.test.js` | 13 | 100% líneas |
| Restricciones CSP | `constraints.test.js` | 18 | 100% líneas |
| Heurísticas MRV/LCV | `heuristics.test.js` | 12 | 100% funciones |
| Solver Backtracking | `solver.test.js` | 15 | 80% líneas |
| Franjas Horarias | `timeSlots.test.js` | 8 | 100% líneas |
| **TOTAL** | | **66** | **>90% global** |

```bash
cd backend
npm test          # Ejecutar todos los tests
npm test --coverage  # Ver reporte de cobertura detallado
```

**Resultado esperado:**
```
Test Suites: 5 passed, 5 total
Tests:       66 passed, 66 total
Coverage:    >90% statements, 100% functions
```

---

## 📋 Requisitos No Funcionales

| Requisito | Métrica | Implementación | Estado |
|---|---|---|---|
| **Rendimiento** | API ≤ 2s de respuesta | Express + Mongoose optimizado | ✅ |
| **Seguridad** | Contraseñas hasheadas | bcrypt (cost factor 12) | ✅ |
| **Seguridad** | Autenticación stateless | JWT (8h) + refresh | ✅ |
| **Seguridad** | Rate limiting | 20 req/15min en login | ✅ |
| **Seguridad** | Headers HTTP seguros | Helmet.js | ✅ |
| **Escalabilidad** | Frontend/Backend desacoplados | MERN separado | ✅ |
| **Usabilidad** | Interfaz responsive | Tailwind CSS | ✅ |
| **Mantenibilidad** | Cobertura de tests >90% | Jest + TDD | ✅ |
| **Disponibilidad** | Sesión con expiración | JWT 8h + inactividad 30min | ✅ |
| **Compatibilidad** | Navegadores modernos | Chrome, Firefox, Edge | ✅ |

---

## 🌿 Gestión del Repositorio (Git Flow)

El proyecto sigue una variante de **Git Flow** adaptada a un equipo de 2 personas:

```
main          ← Producción / Entregables (PROTEGIDA) — tag v1.1
  ↑
release/*     ← Preparación de versión
  ↑
develop       ← Integración continua
  ↑
feature/*     ← Una historia de usuario por rama
```

**Convención de commits** (Conventional Commits):
```
feat(csp): implementar algoritmo AC-3
fix(auth): corregir expiración de token JWT
docs(spec): actualizar casos límite CL-07
test(csp): agregar tests para RC-01 y RC-02
```

Ver [`docs/GitFlow_Guide.md`](docs/GitFlow_Guide.md) para la guía completa.

---

## 📄 Documentación del Proyecto

| Documento | Descripción |
|---|---|
| [`3.1Planificacion_del_proyecto(jira).md`](docs/3.1Planificacion_del_proyecto(jira).md) | Backlog (HU-01..HU-15), sprints, cronograma, métricas ágiles |
| [`3.2Presupuesto_Proyecto.md`](docs/3.2Presupuesto_Proyecto.md) | Análisis económico — S/. 4,978.40 total |
| [`3.3Gestion_Riesgos_Oportunidades.md`](docs/3.3Gestion_Riesgos_Oportunidades.md) | 10 riesgos + 8 oportunidades con relación a restricciones CSP |
| [`3.4.a.1Constitucion.md`](docs/3.4.a.1Constitucion.md) | Constitution.md — principios, reglas globales, restricciones duras/blandas |
| [`3.4.a.2Spec.md`](docs/3.4.a.2Spec.md) | Spec.md — entradas, salidas, reglas de negocio, casos límite (CL-01..CL-20) |
| [`Metricas_Agiles.md`](docs/Metricas_Agiles.md) | Burndown, Burnup, Velocidad, Gráfico de Control |
| [`GitFlow_Guide.md`](docs/GitFlow_Guide.md) | Estrategia de ramas y commits semánticos |

---

## 🌐 Despliegue en Producción

| Capa | Plataforma recomendada | Notas |
|---|---|---|
| Frontend | Vercel / Netlify | `npm run build` → deploy de `dist/` |
| Backend | Render / Railway | Variable de entorno `NODE_ENV=production` |
| Base de datos | MongoDB Atlas (M0 Free) | Cambiar `MONGO_URI` al string de Atlas |

---

## 📄 Licencia

Proyecto académico desarrollado para **Taller de Proyectos 2** — Universidad Continental, 2026.

---

<div align="center">
<sub>SGOHA v1.1 · Universidad Continental · Ingeniería de Sistemas e Informática · 2026</sub>
</div>
