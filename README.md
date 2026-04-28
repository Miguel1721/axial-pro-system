# Axial Pro Clinic - Sistema de Gestión Clínica

Un sistema integral de gestión clínica para centros de salud, desarrollado con Node.js (backend) y React (frontend), utilizando Docker para despliegue.

## Características

- 🏥 **Múltiples Roles de Usuario**: Admin, Médico, Recepción y Caja
- 📅 **Sistema de Citas y Agenda**
- 🏠 **Gestión de Cabinas y Sesiones**
- 💰 **Sistema de Pagos y Bonos**
- 📊 **Dashboard con Métricas**
- 🔐 **Autenticación JWT**
- 🔄 **Notificaciones en Tiempo Real con Socket.io**

## Estructura del Proyecto

```
axial-pro-system/
├── backend/                # Servidor Node.js
│   ├── config/            # Configuración de BD
│   ├── middlewares/       # Middlewares de autenticación
│   ├── routes/            # Rutas de la API
│   ├── utils/             # Utilidades
│   ├── database/          # Esquema SQL
│   ├── package.json
│   ├── server.js          # Servidor principal
│   └── Dockerfile
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── context/       # Contexto de autenticación
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas de la app
│   │   └── assets/       # Rec estáticos
│   ├── package.json
│   ├── Dockerfile
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── docker-compose.yml     # Orquestación de servicios
├── .env                  # Variables de entorno
└── README.md
```

## Tecnologías

### Backend
- Node.js con Express
- PostgreSQL como base de datos
- JWT para autenticación
- Socket.io para comunicaciones en tiempo real
- Helmet para seguridad

### Frontend
- React 18 con Vite
- React Router para navegación
- Tailwind CSS para estilos
- Lucide React para iconos
- Socket.io client

## Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone <repositorio>
cd axial-pro-system
```

### 2. Configurar variables de entorno
Crear un archivo `.env` con las siguientes variables:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=axial_clinic_db
DB_USER=axial_admin
DB_PASSWORD=axial_password_123

JWT_SECRET=super_secret_jwt_key_for_axial_pro_clinic_2026
JWT_EXPIRES_IN=24h

PORT=3001
NODE_ENV=development

VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### 3. Levantar los servicios con Docker Compose
```bash
docker-compose up -d
```

### 4. Acceder a la aplicación
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- PgAdmin: http://localhost:5050 (usuario: admin@axial.com, contraseña: admin)

## Credenciales de Demo

Usuario administrador:
- Email: admin@axial.com
- Contraseña: admin123

## Endpoints API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Perfil del usuario

### Pacientes
- `GET /api/pacientes` - Obtener todos los pacientes
- `POST /api/pacientes` - Crear paciente
- `GET /api/pacientes/:id` - Obtener paciente por ID
- `PUT /api/pacientes/:id` - Actualizar paciente

### Citas
- `GET /api/citas` - Obtener todas las citas
- `POST /api/citas` - Crear cita
- `PUT /api/citas/:id/estado` - Actualizar estado de cita
- `POST /api/citas/:id/abono` - Agregar abono a cita

### Sesiones
- `GET /api/sesiones` - Obtener todas las sesiones
- `POST /api/sesiones` - Crear sesión
- `PUT /api/sesiones/:id/finalizar` - Finalizar sesión
- `POST /api/sesiones/:id/adicionales` - Agregar adicionales

### Inventario
- `GET /api/inventario` - Obtener inventario
- `PUT /api/inventario/:id/actualizar` - Actualizar stock
- `GET /api/inventario/alertas` - Alertas de stock bajo

### Caja
- `GET /api/caja/cierre-caja` - Cierre de caja
- `GET /api/caja/bonos` - Obtener bonos
- `POST /api/caja/bonos` - Crear bono
- `PUT /api/caja/bonos/:id` - Actualizar bono

## Roles y Permisos

- **Admin / Médico**: Acceso total a todas las funcionalidades
- **Recepción**: Agenda, pacientes, recepción, caja
- **Caja**: Solo módulo de caja

## Despliegue en Producción

Para desplegar en producción con el dominio `centro-salud.agentesia.cloud`:

1. Actualizar las URLs en el docker-compose.yml:
```yaml
environment:
  - VITE_API_URL=https://centro-salud.agentesia.cloud:3001
  - VITE_SOCKET_URL=https://centro-salud.agentesia.cloud:3001
```

2. Configurar Traefik para el dominio:
- Añade las labels a los servicios en docker-compose.yml
- Configura los certificados SSL

3. Levantar los servicios:
```bash
docker-compose -f docker-compose.yml up -d
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -am 'Agrega nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Crea un Pull Request

## Licencia

MIT License - ver LICENSE para detalles