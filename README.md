# 📅 Sistema de Generación Óptima de Horarios Académicos
### Universidad Continental — Ingeniería de Sistemas e Informática
### Taller de Investigación 2 | Docente: Daniel Gamarra Moreno

---

## 👥 Equipo de Desarrollo

| Integrante | Código |
|---|---|
| SANCHEZ RAMOS, Giovany | Integrante 1 |
| CALDERON ALIAGA, Kenedy | Integrante 2 |

---

## 📌 Descripción General

El **Sistema de Generación Óptima de Horarios Académicos** es una aplicación web full-stack desarrollada con el stack **MERN** (MongoDB, Express, React, Node.js) orientada a resolver uno de los problemas más comunes en la gestión universitaria: la planificación de horarios académicos sin conflictos.

El sistema permite a los **administradores** gestionar docentes, cursos, aulas, matrículas y generar horarios académicos de forma inteligente. Los **alumnos** pueden visualizar sus horarios asignados, gestionar su disponibilidad y consultar sus matrículas activas.

La generación de horarios se basa en algoritmos de **Satisfacción de Restricciones (CSP)** con técnicas avanzadas como:
- **Backtracking** para exploración del espacio de soluciones
- **AC-3 (Arc Consistency 3)** para propagación de restricciones
- **MRV (Minimum Remaining Values)** como heurística de selección de variables
- **LCV (Least Constraining Value)** como heurística de ordenamiento de valores

---

## 🏗️ Stack Tecnológico (MERN)

| Capa | Tecnología | Versión |
|---|---|---|
| **Base de datos** | MongoDB | 8.x |
| **Backend** | Node.js + Express | v24 / ^4.19 |
| **Frontend** | React + TypeScript | ^18.3 |
| **ORM/ODM** | Mongoose | ^8.4 |
| **Autenticación** | JWT (jsonwebtoken) | ^9.0 |
| **Estilos** | Tailwind CSS | ^3.4 |
| **Build tool** | Vite | ^6.0 |
| **Estado global** | Zustand | ^5.0 |
| **Seguridad** | bcryptjs, helmet, express-rate-limit | — |

---

## 📁 Estructura del Repositorio

```
Proyecto_horarios_UC/
├── backend/                    # Servidor Node.js + Express
│   ├── src/
│   │   ├── config/             # Configuración de base de datos
│   │   ├── csp/                # Algoritmos CSP (AC-3, Backtracking, MRV, LCV)
│   │   ├── middleware/         # Autenticación JWT y manejo de errores
│   │   ├── models/             # Modelos Mongoose (MongoDB)
│   │   ├── routes/             # Rutas de la API REST
│   │   ├── scripts/            # Scripts de inicialización (seed)
│   │   ├── services/           # Lógica de negocio
│   │   └── utils/              # Utilidades de seguridad
│   ├── .env                    # Variables de entorno (no versionado)
│   └── server.js               # Punto de entrada del servidor
│
├── frontend/                   # Aplicación React + TypeScript
│   ├── src/
│   │   ├── api/                # Clientes HTTP (axios)
│   │   ├── components/         # Componentes reutilizables
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # Páginas del sistema
│   │   │   ├── Admin/          # Panel de administración
│   │   │   ├── Login/          # Autenticación
│   │   │   ├── Schedules/      # Gestión de horarios
│   │   │   ├── Students/       # Gestión de alumnos
│   │   │   ├── Teachers/       # Gestión de docentes
│   │   │   ├── Courses/        # Gestión de cursos
│   │   │   ├── Classrooms/     # Gestión de aulas
│   │   │   └── StudentPortal/  # Portal del alumno
│   │   ├── store/              # Estado global (Zustand)
│   │   ├── types/              # Tipos TypeScript
│   │   └── utils/              # Utilidades (seguridad, colores)
│   └── index.html
│
├── docs/                       # Documentación técnica del proyecto
├── tests/                      # Pruebas automatizadas (TDD)
└── .gitignore
```

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalado lo siguiente antes de ejecutar el proyecto:

- [Node.js](https://nodejs.org/) v18 o superior
- [MongoDB](https://www.mongodb.com/) v6 o superior (como servicio local)
- [Git](https://git-scm.com/)
- npm (incluido con Node.js)

---

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/Giovanyesr/Proyecto_horarios_UC.git
cd Proyecto_horarios_UC
```

### 2. Configurar variables de entorno

Crea el archivo `.env` dentro de la carpeta `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/horarios_uc
JWT_SECRET=h0r4r10-AI-s3cur3-k3y-2025!#$
JWT_EXPIRES_IN=8h
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 4. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

### 5. Inicializar la base de datos (solo la primera vez)

```bash
cd ../backend
node src/scripts/seedData.js
```

Este script crea automáticamente: usuarios de prueba, aulas, docentes, cursos, alumnos y matrículas de ejemplo.

### 6. Ejecutar el proyecto

Abre **dos terminales** y ejecuta:

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```
Deberías ver:
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
Deberías ver:
```
VITE ready in ...ms
➜  Local: http://localhost:5173/
```

### 7. Abrir en el navegador

Ingresa a: **http://localhost:5173**

---

## 🔐 Credenciales de Acceso

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Alumno | `alumno01` | `alumno123` |

---

## 🧠 Modelado del Problema (CSP)

El núcleo del sistema es un **Problema de Satisfacción de Restricciones (CSP)** que resuelve la asignación óptima de horarios académicos considerando las siguientes restricciones:

### Restricciones Duras (obligatorias)
- Un docente no puede estar en dos cursos al mismo tiempo
- Un aula no puede tener dos cursos simultáneos
- La capacidad del aula debe ser suficiente para los alumnos matriculados
- Los horarios deben respetar la disponibilidad declarada por los docentes

### Restricciones Blandas (optimización)
- Minimizar los tiempos muertos entre clases para los alumnos
- Distribuir equitativamente la carga horaria de los docentes
- Agrupar clases del mismo curso en días consecutivos cuando sea posible

### Algoritmos Implementados

| Módulo | Archivo | Descripción |
|---|---|---|
| AC-3 | `src/csp/ac3.js` | Propagación de restricciones para reducir el dominio de variables |
| Backtracking | `src/csp/solver.js` | Búsqueda sistemática con retroceso |
| MRV | `src/csp/heuristics.js` | Selecciona primero la variable con menos valores posibles |
| LCV | `src/csp/heuristics.js` | Ordena valores que menos restringen a otras variables |
| Restricciones | `src/csp/constraints.js` | Define y valida todas las restricciones del sistema |
| Franjas horarias | `src/csp/timeSlots.js` | Gestión de los bloques de tiempo disponibles |

---

## 🔌 API REST — Endpoints Principales

**Base URL:** `http://localhost:8000/api/v1`

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/login` | Inicio de sesión | ❌ |
| POST | `/auth/register` | Registro de alumno | ❌ |
| GET | `/auth/me` | Datos del usuario actual | ✅ |
| GET | `/students` | Listar alumnos | ✅ Admin |
| POST | `/students` | Crear alumno | ✅ Admin |
| GET | `/teachers` | Listar docentes | ✅ Admin |
| POST | `/teachers` | Crear docente | ✅ Admin |
| GET | `/courses` | Listar cursos | ✅ |
| GET | `/classrooms` | Listar aulas | ✅ Admin |
| GET | `/enrollments` | Listar matrículas | ✅ |
| POST | `/schedules/generate` | Generar horarios con CSP | ✅ Admin |
| GET | `/schedules` | Consultar horarios generados | ✅ |

---

## 📋 Requisitos No Funcionales

| Requisito | Métrica | Estado |
|---|---|---|
| **Rendimiento** | Tiempo de respuesta de la API ≤ 2 segundos | ✅ Implementado |
| **Seguridad** | Autenticación JWT + bcrypt para contraseñas | ✅ Implementado |
| **Seguridad** | Rate limiting y headers HTTP seguros (helmet) | ✅ Implementado |
| **Escalabilidad** | Arquitectura desacoplada frontend/backend | ✅ Implementado |
| **Usabilidad** | Interfaz responsive con soporte dark/light mode | ✅ Implementado |
| **Mantenibilidad** | Código modular con separación de responsabilidades | ✅ Implementado |
| **Disponibilidad** | Sesión con expiración automática por inactividad (30 min) | ✅ Implementado |
| **Compatibilidad** | Soporte en navegadores modernos (Chrome, Firefox, Edge) | ✅ Implementado |

---

## 🧪 Pruebas (TDD)

Las pruebas del sistema se encuentran en la carpeta `tests/` y siguen el enfoque **Test-Driven Development (TDD)** con el ciclo:

1. 🔴 **Red** — Escribir una prueba que falla
2. 🟢 **Green** — Implementar el código mínimo para que pase
3. 🔵 **Refactor** — Mejorar el código sin romper las pruebas

Para ejecutar las pruebas:

```bash
cd backend
npm test
```

---

## 🌐 Despliegue

El sistema está diseñado para ser desplegado de forma independiente:

- **Backend:** Compatible con Railway, Render o cualquier servidor Node.js
- **Frontend:** Compatible con Vercel, Netlify o servidor estático
- **Base de datos:** Compatible con MongoDB Atlas (nube)

---

## 📄 Licencia

Proyecto académico desarrollado para el curso **Taller de Investigación 2** — Universidad Continental, 2025.
