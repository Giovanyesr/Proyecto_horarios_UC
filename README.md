# 📅 SGOHA — Sistema de Gestión y Optimización de Horarios Académicos

<div align="center">

**Universidad Continental — Facultad de Ingeniería**  
*Ingeniería de Sistemas e Informática — Taller de Proyectos 2*

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB%20Atlas-8.x-47A248?logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-1.2x-009639?logo=nginx&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-5.x-2B037A?logo=pm2&logoColor=white)

</div>

---

## 📋 Tabla de Contenido
1. [Integrantes del Equipo](#1-integrantes-del-equipo)
2. [Problemática Abordada](#2-problemática-abordada)
3. [Justificación del Producto Mínimo Viable (PMV)](#3-justificación-del-producto-mínimo-viable-pmv)
4. [Tecnologías Utilizadas](#4-tecnologías-utilizadas)
5. [Arquitectura del Sistema](#5-arquitectura-del-sistema)
6. [Instrucciones de Instalación, Build y Despliegue](#6-instrucciones-de-instalación-build-y-despliegue)
7. [Navegación de Documentación del Proyecto (PMBOK)](#7-navegación-de-documentación-del-proyecto-pmbok)
8. [Demostración y Video Explicativo](#8-demostración-y-video-explicativo)

---

## 1. Integrantes del Equipo
El proyecto ha sido desarrollado colaborativamente por el siguiente equipo técnico:

| Integrante | Código de Estudiante | Rol de Desarrollo | Correo Institucional | Perfil GitHub |
|---|:---:|---|---|---|
| **SANCHEZ RAMOS, Giovany** | `U20211B994` | Full-Stack Developer / Scrum Master | `U20211B994@continental.edu.pe` | [@Giovanyesr](https://github.com/Giovanyesr) |
| **CALDERON ALIAGA, Kenedy** | `U20211C078` | Full-Stack Developer / QA Engineer | `U20211C078@continental.edu.pe` | [@KenedyCalderon](https://github.com/KenedyCalderon) |

---

## 2. Problemática Abordada
La distribución y planificación de horarios académicos semestrales en la Universidad Continental presenta dos desafíos principales:

1.  **Complejidad Curricular y Choques de Horarios:** El currículo flexible de la universidad permite a los estudiantes matricularse en cursos de ciclos dispares. Esto produce constantes "cruces de asignaturas" (solapamiento de estudiantes), choques de docentes dictando en el mismo bloque en dos aulas, o asignaciones de cursos masivos a salones pequeños.
2.  **Complejidad Algorítmica (NP-hard):** Mapear $N$ asignaturas, $M$ docentes, $K$ aulas y cientos de franjas horarias semanales genera un espacio de búsqueda que crece exponencialmente. Este problema se clasifica matemáticamente como un **Problema de Satisfacción de Restricciones (CSP)**. Tradicionalmente, este proceso toma días de labor manual administrativa y está sujeto a errores.

SGOHA automatiza esta planificación matemática resolviendo el CSP en segundos, aplicando el **Algoritmo de Consistencia de Arcos (AC-3)** para recortar los dominios horarias y un motor de **Backtracking recursivo con heurísticas MRV (Minimum Remaining Values)** y **LCV (Least Constraining Value)** para generar horarios garantizados libres de conflictos.

---

## 3. Justificación del Producto Mínimo Viable (PMV)
El Producto Mínimo Viable (PMV) de SGOHA prioriza la resolución de los dolores críticos del negocio:

*   **Lógica Core vs Funciones Accesorias:** Se priorizó el desarrollo y validación matemática del algoritmo CSP, logrando garantizar un 100% de cumplimiento en las 7 restricciones duras (RC-01 a RC-07). Funcionalidades no críticas, como la exportación nativa a PDF/Excel, se mantuvieron en el Product Backlog.
*   **Valor Inmediato:** Permite a la administración ingresar la información académica básica y obtener una matriz horaria libre de choques con un solo clic en menos de 2.5 segundos, optimizando sustancialmente el esfuerzo operativo.

---

## 4. Tecnologías Utilizadas
El ecosistema técnico de la solución está configurado por herramientas modernas y robustas:

*   **Frontend Client:** React 18, TypeScript, Tailwind CSS (estilos modernos y responsivos), Zustand (gestor de estados ultraligero) y Vite (herramienta de compilación rápida).
*   **Backend Server:** Node.js y Express (API REST modular).
*   **Base de Datos:** MongoDB Atlas (base de datos documental en la nube) con Mongoose ODM.
*   **Monitoreo y Despliegue:** PM2 (gestor de procesos backend de Node.js) y Nginx (servidor web proxy inverso para seguridad y archivos estáticos).
*   **Pruebas unitarias:** Jest para desarrollo TDD.

---

## 5. Arquitectura del Sistema
SGOHA implementa una **Arquitectura de Software por Capas** completamente desacoplada bajo un modelo Cliente-Servidor:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN (SPA)                   │
│          React 18 + TypeScript + Tailwind CSS · Zustand         │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Peticiones HTTP REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE APLICACIÓN (API REST)                │
│         Express Router · Middlewares JWT · Rate Limiting        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE NEGOCIO Y MOTOR CSP                  │
│       Servicios de Negocio · AC-3 · Backtracking (solver.js)     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Mongoose ODM
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE ACCESO A DATOS                       │
│                   MongoDB Atlas (Nube Cloud)                    │
└─────────────────────────────────────────────────────────────────┘
```

*   **Desacoplamiento Frontend/Backend:** La SPA en React es 100% autónoma y se comunica de forma asíncrona con el backend mediante peticiones seguras firmadas por tokens JSON Web Token (JWT).
*   **Desacoplamiento del Solver:** El motor matemático CSP se encuentra aislado de la lógica de negocio y controladores de base de datos en [backend/src/csp](file:///D:/Proyecto_horarios_UC/backend/src/csp/), facilitando pruebas automatizadas aisladas.

---

## 6. Instrucciones de Instalación, Build y Despliegue
Siga estos pasos para configurar el entorno de ejecución local y producción:

### A. Clonación e Instalación Local
```bash
git clone https://github.com/Giovanyesr/Proyecto_horarios_UC.git
cd Proyecto_horarios_UC

# Instalar dependencias en backend y frontend
cd backend && npm install
cd ../frontend && npm install
```

### B. Configuración de Variables de Entorno (.env)
Cree un archivo `.env` en la carpeta `backend/` local con la siguiente estructura (no comparta estas llaves en Git):
```env
PORT=8000
NODE_ENV=production
MONGO_URI=mongodb://127.0.0.1:27017/horarios_uc   # Reemplazar con Atlas URI en prod
JWT_SECRET=Llave-Secreta-Super-Segura-2026
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

Cargue la semilla inicial de datos de prueba:
```bash
node src/scripts/seedData.js
```

### C. Build y Despliegue en Producción
1.  **Backend (PM2):** Mantenga viva la API Node.js mediante PM2:
    ```bash
    cd backend
    pm2 start server.js --name "sgoha-backend"
    ```
2.  **Frontend (React Build & Nginx):** compile los recursos estáticos del cliente:
    ```bash
    cd frontend
    npm run build
    ```
    Copie la carpeta `/dist` generada al directorio público de Nginx (ej. `/var/www/html`) y configure Nginx para redirigir peticiones indexadas hacia `index.html` (SPA routing).

---

## 7. Navegación de Documentación del Proyecto (PMBOK)
Toda la documentación y actas de gestión del ciclo de vida del proyecto bajo el estándar PMBOK se encuentran estructuradas y enlazadas a continuación:

*   📂 **[Carpeta 01: Inicio](file:///D:/Proyecto_horarios_UC/docs/inicio/)**
    *   [Acta de Constitución del Proyecto (acta_constitucion.md)](file:///D:/Proyecto_horarios_UC/docs/inicio/acta_constitucion.md)
*   📂 **[Carpeta 02: Planificación](file:///D:/Proyecto_horarios_UC/docs/planificacion/)**
    *   [Plan de Líneas Base del Proyecto (plan_linea_base.md)](file:///D:/Proyecto_horarios_UC/docs/planificacion/plan_linea_base.md)
*   📂 **[Carpeta 03: Ejecución](file:///D:/Proyecto_horarios_UC/docs/ejecucion/)**
    *   [Registro de Entregables Técnicos (registro_entregables.md)](file:///D:/Proyecto_horarios_UC/docs/ejecucion/registro_entregables.md)
*   📂 **[Carpeta 04: Seguimiento y Control](file:///D:/Proyecto_horarios_UC/docs/seguimiento_control/)**
    *   [Métricas de Seguimiento y Control (metricas_control.md)](file:///D:/Proyecto_horarios_UC/docs/seguimiento_control/metricas_control.md)
*   📂 **[Carpeta 05: Cierre](file:///D:/Proyecto_horarios_UC/docs/cierre/)**
    *   [Informe de Cierre del Proyecto (01_informe_final.md)](file:///D:/Proyecto_horarios_UC/docs/cierre/01_informe_final.md)
    *   [Bitácora de Lecciones Aprendidas (02_lecciones_aprendidas.md)](file:///D:/Proyecto_horarios_UC/docs/cierre/02_lecciones_aprendidas.md)
    *   [Registros y Bitácoras de Gestión (03_registros_gestion.md)](file:///D:/Proyecto_horarios_UC/docs/cierre/03_registros_gestion.md)
    *   [Acta de Cierre Administrativo (04_cierre_administrativo.md)](file:///D:/Proyecto_horarios_UC/docs/cierre/04_cierre_administrativo.md)
    *   [Manual de Capacitación y Operaciones (05_manual_capacitacion.md)](file:///D:/Proyecto_horarios_UC/docs/cierre/05_manual_capacitacion.md)

---

## 8. Demostración y Video Explicativo
Para visualizar la puesta en marcha, el flujo de usuario y la ejecución en tiempo real del motor de satisfacción de restricciones (CSP), acceda al video demostrativo de **máximo 5 minutos** a través del siguiente enlace:

🎥 **[Ver Demostración del Sistema SGOHA (YouTube)](hhttps://drive.google.com/file/d/12Cw9TnnHWNazW6Fzi4-glWPFLMWfS0pS/view?usp=sharing)**

---
*Universidad Continental — Ingeniería de Sistemas e Informática — Taller de Proyectos 2 — 2026*
