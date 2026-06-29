# 📘 SGOHA — Manual de Capacitación y Guía de Operaciones

Este documento ha sido diseñado como la **guía técnica de entrega** del sistema **SGOHA** para el equipo de operaciones de TI o el cliente final que heredará la administración y mantenimiento del software. Abarca los requisitos del entorno, pasos detallados para el despliegue en producción de la API REST y el cliente React, configuración de la base de datos de horarios en MongoDB y recomendaciones críticas para dar soporte al solver de restricciones.

---

## 1. Requisitos Previos del Sistema (Entorno de Producción)
Antes de proceder con el despliegue de SGOHA, asegúrese de que el servidor de hosting (local o cloud) cumpla con las siguientes dependencias mínimas:

*   **Runtime:** Node.js v18.x o v20.x (versiones LTS).
*   **Gestor de paquetes:** npm v9.x o superior.
*   **Base de datos:** MongoDB Server v6.0 o v8.0 (recomendado MongoDB Atlas para gestión cloud).
*   **Servidor HTTP / Reverse Proxy:** Nginx (para redirigir tráfico y servir archivos estáticos) o Apache.
*   **Administrador de Procesos:** PM2 (`npm install -g pm2`) para mantener viva la API de Node.js en producción.

---

## 2. Configuración y Despliegue de la Base de Datos (MongoDB)
SGOHA utiliza esquemas referenciales estructurados mediante Mongoose. Siga estos pasos para la puesta en marcha de la base de datos:

### A. Obtención de URI de Conexión
1.  Si utiliza **MongoDB Atlas (Recomendado):** Cree un clúster gratuito o de pago, configure las reglas de red para permitir el acceso por IP y obtenga la cadena de conexión:
    `mongodb+srv://<usuario>:<password>@cluster0.xxxx.mongodb.net/horarios_uc?retryWrites=true&w=majority`
2.  Si utiliza **MongoDB Local:** La URI de conexión por defecto es:
    `mongodb://127.0.0.1:27017/horarios_uc`

### B. Inicialización y Carga de Semilla (Seed)
Para poblar la base de datos con las entidades iniciales (roles por defecto, aulas preconfiguradas y variables de entorno), ejecute el script de inicialización desde la raíz del backend:

```bash
cd backend
# Asegure tener configurado el archivo .env primero (ver sección 3)
node src/scripts/seedData.js
```

> [!IMPORTANT]
> Este script creará el usuario administrador con las credenciales `admin` / `admin123` y el alumno de prueba `alumno01` / `alumno123`, además de poblar aulas, cursos y docentes de ejemplo necesarios para probar el motor CSP.

---

## 3. Despliegue del Backend (Node.js + Express)
El backend actúa como servidor API REST y aloja el motor matemático CSP.

### Paso 1: Configurar Variables de Entorno
Cree un archivo `.env` en la carpeta [backend](file:///D:/Proyecto_horarios_UC/backend) con la configuración de producción:

```env
# Configuración del Servidor
PORT=8000
NODE_ENV=production
CORS_ORIGIN=https://mi-dominio-sgoha.edu.pe   # URL pública del frontend React

# Base de Datos y Seguridad
MONGO_URI=mongodb+srv://admin_sgoha:SeguraKey2026@cluster.mongodb.net/sgoha_prod?retryWrites=true&w=majority
JWT_SECRET=C0nt1n3nt4l-2026-Super-Secret-Token-Key-!#$
JWT_EXPIRES_IN=8h
```

### Paso 2: Instalación de Dependencias de Producción
Instale únicamente los paquetes de ejecución, omitiendo las dependencias de desarrollo (como linters o Jest):

```bash
cd backend
npm install --omit=dev
```

### Paso 3: Iniciar y Monitorear con PM2
Use PM2 para lanzar la aplicación backend en segundo plano y asegurar su reinicio automático ante caídas del sistema o reinicios del servidor:

```bash
# Lanzar el servidor backend
pm2 start server.js --name "sgoha-backend" --node-args="--max-old-space-size=2048"

# Guardar la lista de procesos para arranques del sistema operativo
pm2 save
pm2 startup
```

> [!TIP]
> El argumento `--max-old-space-size=2048` incrementa la memoria máxima de Node.js a 2GB, permitiendo al CSP manejar grandes volúmenes de backtracking sin colapsar por falta de memoria.

---

## 4. Despliegue del Frontend (React + Vite)
El frontend de React se compila a archivos estáticos (HTML, CSS, JS) para ser servidos de forma óptima.

### Paso 1: Configurar Endpoint del API
En la carpeta [frontend](file:///D:/Proyecto_horarios_UC/frontend), asegúrese de configurar las variables de entorno de compilación en `.env.production` apuntando al backend real:

```env
VITE_API_URL=https://api.mi-dominio-sgoha.edu.pe/api/v1
```

### Paso 2: Construir el Build de Producción
Corra el script de compilación para optimizar y empaquetar el cliente web:

```bash
cd frontend
npm install
npm run build
```

Este comando creará la carpeta `frontend/dist/`.

### Paso 3: Configurar Nginx para Servir el Frontend
Copie los archivos generados en `dist/` al directorio de publicación del servidor web y configure Nginx para redirigir las peticiones del Single Page Application (SPA) hacia `index.html`:

```nginx
server {
    listen 80;
    server_name mi-dominio-sgoha.edu.pe;

    root /var/www/sgoha/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Redireccionar peticiones API al backend de Express si están en el mismo dominio
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 5. Recomendaciones de Mantenimiento para el Solver CSP

El motor matemático CSP (`backend/src/csp`) es la parte más sensible del sistema. Para evitar degradaciones de servicio, siga estas directrices de mantenimiento:

### A. Gestión de Restricciones y Evolución de Reglas
*   **Trazabilidad de Cambios:** Si la universidad decide añadir una nueva restricción dura (por ejemplo, "Un docente no puede dictar más de 6 horas al día"), agréguela en [constraints.js](file:///D:/Proyecto_horarios_UC/backend/src/csp/constraints.js).
*   **Pruebas obligatorias (TDD):** Antes de subir el cambio a producción, ejecute siempre la suite de pruebas unitarias desde la carpeta backend:
    `npm test`
    La cobertura del motor CSP debe mantenerse por encima del **90%** para garantizar que la nueva regla no genere regresiones que invaliden las restricciones previas.

### B. Prevención de Timeouts y Problemas de Inviabilidad (*Infeasibility*)
*   **Monitoreo de Estadísticas:** Analice el historial de ejecuciones en el dashboard administrativo. Si el parámetro `backtrackCount` excede los 10,000 pasos o `executionTimeMs` se acerca a 60 segundos (60,000ms), es indicativo de un espacio de búsqueda excesivamente saturado.
*   **Densidad de Restricciones:** El estado de inviabilidad (`status: infeasible`) ocurre cuando los dominios se vacían debido a falta de aulas o de docentes disponibles. Si esto sucede frecuentemente:
    1.  Aumente la disponibilidad horaria declarada por los docentes.
    2.  Registre más aulas compatibles de tipos comunes.
    3.  Ajuste las restricciones blandas de preferencias horarias de alumnos.

### C. Escalabilidad del Servidor Express
Debido a la naturaleza síncrona y monohilo de Node.js, ejecuciones concurrentes de generación de horarios pesados bloquearán temporalmente las respuestas de otros usuarios. Se recomienda encarecidamente calendarizar las ejecuciones masivas de horarios en horarios de baja demanda académica, o migrar el backend a una arquitectura basada en Workers en segundo plano (ver [02_lecciones_aprendidas.md](file:///D:/Proyecto_horarios_UC/docs/cierre/02_lecciones_aprendidas.md)).

---
*Universidad Continental — Taller de Proyectos 2 — 2026*
