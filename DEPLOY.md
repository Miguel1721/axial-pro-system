# Guía de Despliegue con Dokploy y Traefik

## Requisitos Previos

1. **Registro DNS**
   - Asegúrate de tener estos dos registros A apuntando a la IP de tu servidor:
     - Frontend: `centro-salud.agentesia.cloud`
     - Backend: `api.centro-salud.agentesia.cloud`

2. **Certificados SSL**
   - Traefik gestionará automáticamente los certificados de Let's Encrypt
   - Asegúrate de que el dominio esté correctamente apuntando a tu servidor

## Pasos de Despliegue

### 1. Subir el código a Git
```bash
# Subir tu repositorio a GitHub/GitLab
git add .
git commit -m "Configuración para producción con Dokploy y Traefik"
git push origin main
```

### 2. Configurar Dokploy

1. Ve a tu panel de Dokploy
2. Crea un nuevo proyecto de tipo "Compose"
3. Conecta tu repositorio de Git
4. Dokploy detectará automáticamente el `docker-compose.yml`

### 3. Variables de Entorno en Dokploy

Asegúrate de configurar estas variables en Dokploy:

#### Variables para el Backend:
```
NODE_ENV=production
DB_HOST=db
DB_PORT=5432
DB_NAME=axial_clinic_db
DB_USER=axial_admin
DB_PASSWORD=axial_password_123
JWT_SECRET=super_secret_jwt_key_for_axial_pro_clinic_2026
JWT_EXPIRES_IN=24h
PORT=3000
```

#### Variables para el Frontend:
```
VITE_API_URL=https://api.centro-salud.agentesia.cloud
VITE_SOCKET_URL=wss://api.centro-salud.agentesia.cloud
```

### 4. Configuración de Red

Verifica que en Dokploy la red global se llame `dokploy-network`. Normalmente es así por defecto, pero si no:
1. Ve a la configuración de red en Dokploy
2. Asegúrate de que el nombre sea `dokploy-network`

### 5. Desplegar

1. Dale a "Deploy" en Dokploy
2. Espera a que termine el proceso
3. Los servicios estarán disponibles en:
   - Frontend: https://centro-salud.agentesia.cloud
   - API: https://api.centro-salud.agentesia.cloud
   - PgAdmin: https://pgadmin.centro-salud.agentesia.cloud (opcional)

## Comandos Útiles

### Ver logs de los servicios:
```bash
# Ver logs del backend
docker logs axial_backend

# Ver logs del frontend
docker logs axial_frontend

# Ver logs de la base de datos
docker logs axial_postgres
```

### Reiniciar servicios:
```bash
# Reiniciar todos los servicios
docker-compose down
docker-compose up -d

# Reiniciar un servicio específico
docker-compose restart backend
```

## Estructura Final

```
axial-pro-system/
├── backend/
│   ├── Dockerfile (actualizado)
│   ├── server.js (CORS configurado)
│   ├── package.json
│   ├── config/
│   ├── middlewares/
│   ├── routes/
│   ├── utils/
│   └── database/
├── frontend/
│   ├── Dockerfile (multi-stage build)
│   ├── vite.config.js
│   ├── .env.production
│   ├── package.json
│   └── src/
├── docker-compose.yml (sin puertos expuestos)
├── .env
├── README.md
└── DEPLOY.md (este archivo)
```

## Notas Importantes

1. **Seguridad**: La base de datos no expone ningún puerto al host, solo es accesible internamente
2. **HTTPS**: Traefik se encarga de todos los certificados SSL automáticamente
3. **Zero Downtime**: El despliegue con Docker Compose y Dokploy permite actualizaciones sin downtime
4. **Escalabilidad**: Cada servicio está en su contenedor, lo que facilita escalar individualmente

## Solución de Problemas

### Si los WebSockets no funcionan:
1. Verifica que las URLs en el frontend sean HTTPS
2. Asegúrate de que el Socket.io esté configurado correctamente en el backend
3. Revisa los logs de Traefik para errores de enrutamiento

### Si el frontend no carga el API:
1. Verifica que `VITE_API_URL` sea correcto en el entorno de producción
2. Revisa los CORS en el backend
3. Confirma que Traefik esté enrutando correctamente a la API

### Si la base de datos no se conecta:
1. Verifica que el nombre de la red sea `dokploy-network`
2. Revisa que las variables de entorno estén correctamente configuradas en Dokploy
3. Chequea los logs del contenedor de PostgreSQL