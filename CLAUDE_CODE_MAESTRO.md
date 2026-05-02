# 📘 CLAUDE CODE - GUÍA MAESTRA DEL PROYECTO

## 🎯 PROPÓSITO DE ESTE DOCUMENTO

Este documento es la **GUÍA DEFINITIVA** para cualquier instancia de Claude Code que trabaje en estos proyectos. Contiene toda la información necesaria para entender el contexto, estado actual, y continuar el trabajo sin perder tiempo.

**Última actualización:** 2 de Mayo de 2026
**Estado:** Activo con 2 proyectos en producción

---

## 🗂️ ÍNDICE DE PROYECTOS

Este servidor contiene **2 proyectos principales** en desarrollo activo:

### 1️⃣ AXIAL PRO CLINIC - Sistema de Gestión Clínica
- **Ubicación:** `/home/ubuntu/axial-pro-system`
- **Producción:** https://centro-salud.agentesia.cloud
- **Estado:** FASE 2 (90% completada)
- **Stack:** React + Node.js + PostgreSQL + Docker

### 2️⃣ IGS PLATFORM - Sistema de Multiasistencia Tipo Uber
- **Ubicación:** `/home/ubuntu/igs-platform`
- **Producción:** https://igs.agentesia.cloud
- **Estado:** FASE 1-3 completadas (80% total)
- **Stack:** React + FastAPI (Python) + PostgreSQL + Docker

---

## 🏥 PROYECTO 1: AXIAL PRO CLINIC

### 📍 VISIÓN GENERAL
Sistema de gestión clínica integral para centros de salud con múltiples roles (Admin, Médico, Recepción, Caja), gestión de citas, sesiones, pagos y dashboard con métricas.

### 📂 RUTA DEL PROYECTO
```
/home/ubuntu/axial-pro-system
```

### 🌐 ACCESOS
- **Frontend Producción:** https://centro-salud.agentesia.cloud
- **API Backend:** https://centro-salud.agentesia.cloud:3001
- **Local:** http://localhost:18000 (frontend), http://localhost:18001 (backend)

### 🔐 CREDENCIALES DEMO
- **Email:** admin@axial.com
- **Password:** admin123

### 📊 ESTADO ACTUAL - ROADMAP

#### ✅ FASE 1: Fundamentos UX/UI (100% COMPLETADA)
- Rediseño responsivo mobile-first
- Bottom Navigation iOS-style
- Top Navbar con Glassmorphism
- Estructura premium con gradientes

#### ✅ FASE 2: UX/UI Avanzada (90% COMPLETADA)

**Completado:**
- ✅ Modo Oscuro (toggle con persistencia)
- ✅ Dashboard Personalizable (widgets reordenables)
- ✅ Notificaciones Real-time (polling seguro)
- ✅ Micro-interacciones (animaciones premium)
- ✅ Accesibilidad WCAG AA (contraste, zoom)
- ✅ Temas Médicos (4 temas: azul, verde, rojo, morado)
- ✅ Gráficos Animados (Chart.js con 4 tipos de gráficos)

**Pendiente (10%):**
- ⏳ Avatares de Roles
- ⏳ PWA (Progressive Web App)

#### ⏳ FASE 3-7: Pendientes
Ver archivo completo: `/home/ubuntu/axial-pro-system/ROADMAP_AXIAL_PRO_CLINIC.md`

### 📁 DOCUMENTACIÓN AXIAL PRO

**Documentos PRINCIPALES:**
1. **ROADMAP:** `axial-pro-system/ROADMAP_AXIAL_PRO_CLINIC.md` - Plan completo 7 fases
2. **README:** `axial-pro-system/README.md` - Instalación y configuración
3. **ESTADO:** Ver este documento (sección Proyecto 1)

**Documentos TÉCNICOS:**
- Estructura en `/home/ubuntu/axial-pro-system/frontend/src/pages/`
- Componentes en `/home/ubuntu/axial-pro-system/frontend/src/components/`
- Backend en `/home/ubuntu/axial-pro-system/backend/`

### 🚀 ÚLTIMOS COMMITS AXIAL PRO
```
513638a - Actualizar ROADMAP - Gráficos Animados completados
225510b - Implementar Gráficos Animados con Chart.js - FASE 2 UX/UI Avanzada
bdbeda4 - Actualizar ROADMAP - Temas Médicos completados
2b28866 - Implementar Temas Médicos Personalizados en Axial Pro Clinic
```

### 🎨 IMPLEMENTACIONES RECIENTES

#### Gráficos Animados (COMPLETADO - Mayo 2026)
- **Commit:** 225510b
- **Componente:** `AnimatedCharts.jsx`
- **Características:**
  - 4 tipos de gráficos: Línea, Barra, Área, Doughnut
  - Animaciones suaves (2s, easeInOutQuart)
  - Colores adaptativos por tema médico
  - Responsive móvil/desktop
  - Tooltips interactivos

#### Temas Médicos (COMPLETADO - Abril 2026)
- **Commit:** 2b28866
- **4 Temas:**
  - Azul Clínico (defecto)
  - Verde Quirófano
  - Rojo Emergencia
  - Morado Nocturno

### 🐳 DOCKER AXIAL PRO
**Contenedores activos:**
```bash
axial-pro-system-frontend-1    (puerto 18000)
axial-pro-system-backend-1     (puerto 18001)
axial-pro-system-mock-server-1 (puerto 3002)
axial-pro-system-db-1          (PostgreSQL 15)
axial-pro-system-pgadmin-1     (gestión BD)
```

**Comandos útiles:**
```bash
cd /home/ubuntu/axial-pro-system
docker compose up -d --build frontend  # Reconstruir frontend
docker ps | grep axial-pro             # Ver contenedores
docker logs axial-pro-system-frontend-1  # Ver logs
```

### 📝 PRÓXIMOS PASOS AXIAL PRO
1. Completar Avatares de Roles (íconos distintivos por personal)
2. Implementar PWA (app instalable, offline parcial)
3. Iniciar FASE 3: Funcionalidad Médica Completa

---

## 🚗 PROYECTO 2: IGS PLATFORM - MULTIASISTENCIA

### 📍 VISIÓN GENERAL
Sistema de multiasistencia tipo Uber que conecta clientes con proveedores de servicios (médicos, veterinarios, electricistas, plomeros, etc.) con asignación inteligente basada en ubicación, disponibilidad y calificaciones.

### 📂 RUTA DEL PROYECTO
```
/home/ubuntu/igs-platform
```

### 🌐 ACCESOS
- **Frontend Producción:** https://igs.agentesia.cloud
- **API Docs:** https://api.igs.agentesia.cloud/docs
- **API Backend:** https://api.igs.agentesia.cloud

### 🔐 CREDENCIALES DEMO
| Rol | Cédula | OTP |
|-----|--------|-----|
| Cliente | 1020304050 | 0000 |
| Proveedor (Plomero) | 8888888888 | 0000 |
| Admin | 9999999999 | 0000 |

### 📊 ESTADO ACTUAL - ROADMAP

#### ✅ FASES COMPLETADAS (100%)
1. ✅ Base de Datos y Estructura
2. ✅ Sistema de Asignación Inteligente
3. ✅ Frontend Cliente
4. ✅ Dashboard Proveedor
5. ✅ Smart Polling (6 segundos)
6. ✅ Seguimiento en Tiempo Real
7. ✅ Panel Admin Básico
8. ✅ Múltiples Categorías (58 servicios)
9. ✅ Sistema de Calificación
10. ✅ Mapa Visual en Vivo (OpenStreetMap)
11. ✅ Chat con IA (GLM)
12. ✅ Reportes Exportables
13. ✅ Catálogo Ampliado (58 servicios)
20. ✅ Analytics Avanzado

#### ⏳ FASES PENDIENTES
- Fase 14: Tests E2E Automatizados (Playwright)
- Fase 15: Perfil de Usuario Editable
- Fase 16: Búsqueda Avanzada
- Fase 17: Seguimiento GPS en tiempo real
- Fase 18: Sistema de Favoritos
- Fase 19: Programación de Servicios

### 📁 DOCUMENTACIÓN IGS

**Documentos PRINCIPALES (en /home/ubuntu/):**
1. **ESTADO_ACTUAL_IGS.md** - Estado actual y roadmap
2. **PROPUESTA_IGS_COMPLETA.md** - Especificaciones técnicas completas
3. **IGS_Plataform_Resumen_Tecnico.md** - Resumen técnico validado
4. **RESUMEN_COMPLETO_IGS.md** - Resumen ejecutivo
5. **IGS_GUIA_IMPLEMENTACION.md** - Guía de implementación

**Documentos TÉCNICOS (en /home/ubuntu/igs-platform/):**
1. **README.md** - Instalación y configuración
2. **PLAN_IMPLEMENTACION.md** - Plan de desarrollo
3. **GUIA_SECRETS.md** - Gestión de secrets
4. **GUIDE_INSTALACION.md** - Guía de instalación detallada

**Otros documentos importantes:**
- `ANALISIS_NEGOCIO_IGS.md` - Análisis de negocio
- `PLAN_COMPLETO_FASES.md` - Plan completo de fases
- `RESUMEN_MODULOS_NUEVOS.md` - Módulos empresariales

### 🎯 CARACTERÍSTICAS IMPLEMENTADAS

#### Servicios Disponibles (58 tipos)
- Médicos (General, Pediatría, Cardiología, etc.)
- Veterinarios
- Enfermeras
- Ambulancias
- Electricistas
- Plomeros
- Mecánicos
- Grúas
- Abogados
- Gasolina
- Y muchos más...

#### Módulos Empresariales
- Analytics Dashboard ROI
- White-Label Multi-Tenant
- Multi-Idioma (5 idiomas)
- Auditoría ISO-Compliant

Ver detalles en: `/home/ubuntu/RESUMEN_MODULOS_NUEVOS.md`

### 🐳 DOCKER IGS
**Contenedores activos:**
```bash
igs-platform-frontend-1
igs-platform-backend-1
igs-platform-db-1
```

**Comandos útiles:**
```bash
cd /home/ubuntu/igs-platform
docker compose up -d --build frontend  # Reconstruir frontend
docker ps | grep igs-platform          # Ver contenedores
docker logs igs-platform-backend-1     # Ver logs
```

### 📝 PRÓXIMOS PASOS IGS
1. Tests E2E Automatizados (Playwright)
2. Perfil de Usuario Editable
3. Seguimiento GPS en tiempo real

---

## 🔧 CONFIGURACIÓN COMÚN DEL SERVIDOR

### 🖥️ ESPECIFICACIONES
- **OS:** Linux (Ubuntu)
- **Docker:** Activo con múltiples contenedores
- **Traefik:** Reverse proxy activo
- **Git:** Configurado para ambos proyectos

### 📁 ESTRUCTURA DE DIRECTORIOS
```
/home/ubuntu/
├── axial-pro-system/          # Proyecto 1: Clínica
│   ├── frontend/
│   ├── backend/
│   ├── ROADMAP_AXIAL_PRO_CLINIC.md
│   └── README.md
├── igs-platform/              # Proyecto 2: IGS
│   ├── frontend/
│   ├── backend/
│   ├── README.md
│   └── PLAN_IMPLEMENTACION.md
├── CLAUDE_CODE_MAESTRO.md     # ESTE DOCUMENTO
├── revisa1.md                 # Estado reciente Axial Pro
└── [otros documentos de IGS]
```

### 🔄 WORKFLOW DE DESARROLLO

#### Para Axial Pro Clinic:
```bash
cd /home/ubuntu/axial-pro-system
git pull origin main           # Actualizar código
# Hacer cambios...
docker compose up -d --build frontend  # Reconstruir
git add -A && git commit -m "mensaje"  # Commitear
git push origin main           # Push a GitHub
```

#### Para IGS Platform:
```bash
cd /home/ubuntu/igs-platform
git pull origin main           # Actualizar código
# Hacer cambios...
docker compose up -d --build frontend  # Reconstruir
git add -A && git commit -m "mensaje"  # Commitear
git push origin main           # Push a GitHub
```

### 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

#### Puerto ocupado
```bash
netstat -tuln | grep PUERTO    # Ver qué está usando el puerto
docker ps                      # Ver contenedores activos
```

#### Traefik bloqueando assets
- Verificar configuración de labels en docker-compose.yml
- Revisar logs de Traefik: `docker logs traefik`

#### Build fallido
```bash
docker system prune -a         # Limpiar caché Docker
docker compose up -d --build   # Reconstruir desde cero
```

---

## 📚 TODOS LOS DOCUMENTOS DE REFERENCIA

### Documentos Axial Pro Clinic
1. `/home/ubuntu/axial-pro-system/ROADMAP_AXIAL_PRO_CLINIC.md` - **ROADMAP COMPLETO**
2. `/home/ubuntu/axial-pro-system/README.md` - Instalación básica
3. `/home/ubuntu/revisa1.md` - Estado reciente (Gráficos Animados)

### Documentos IGS Platform
1. `/home/ubuntu/ESTADO_ACTUAL_IGS.md` - **ESTADO ACTUAL**
2. `/home/ubuntu/PROPUESTA_IGS_COMPLETA.md` - **ESPECIFICACIONES COMPLETAS**
3. `/home/ubuntu/IGS_Plataform_Resumen_Tecnico.md` - Resumen técnico
4. `/home/ubuntu/RESUMEN_COMPLETO_IGS.md` - Resumen ejecutivo
5. `/home/ubuntu/IGS_GUIA_IMPLEMENTACION.md` - Guía de implementación
6. `/home/ubuntu/RESUMEN_MODULOS_NUEVOS.md` - Módulos empresariales
7. `/home/ubuntu/ANALISIS_NEGOCIO_IGS.md` - Análisis de negocio
8. `/home/ubuntu/PLAN_COMPLETO_FASES.md` - Plan de fases
9. `/home/ubuntu/igs-platform/README.md` - Instalación IGS
10. `/home/ubuntu/igs-platform/PLAN_IMPLEMENTACION.md` - Plan desarrollo IGS

### Documentos Técnicos Varios
- `/home/ubuntu/PLAN_48_HORAS.md` - Plan 48 horas
- `/home/ubuntu/GUIA_IMPLEMENTACION_MATRIZ.md` - Matriz de riesgos
- `/home/ubuntu/IMPLEMENTACION_COMPLETA.md` - Implementación completa
- `/home/ubuntu/RESUMEN_PRUEBAS_COMPLETO.md` - Pruebas completas

---

## 🎯 CÓMO USAR ESTE DOCUMENTO

### Cuando inicies una NUEVA sesión de Claude Code:

1. **LEER ESTE DOCUMENTO PRIMERO** - Entender qué hay en el servidor
2. **LEER EL ESTADO ACTUAL** del proyecto correspondiente:
   - Axial Pro: `revisa1.md` + `ROADMAP_AXIAL_PRO_CLINIC.md`
   - IGS: `ESTADO_ACTUAL_IGS.md` + `PROPUESTA_IGS_COMPLETA.md`
3. **VER ÚLTIMOS COMMITS** - Entender qué se hizo recientemente
4. **CONTINUAR DESDE DONDE SE QUEDÓ** - No adivinar, leer el contexto

### Preguntas CLAVE a responder:
- ¿Qué proyecto estoy trabajando? (Axial Pro o IGS)
- ¿En qué fase está? (Ver ROADMAP)
- ¿Qué se hizo en el último commit?
- ¿Qué es lo próximo en el plan?
- ¿Hay issues o bugs conocidos?

---

## 📞 CONTACTO Y SOPORTE

### Repositorios GitHub:
- **Axial Pro Clinic:** https://github.com/Miguel1721/axial-pro-system.git
- **IGS Platform:** https://github.com/Miguel1721/igs.git

### Sitios en Producción:
- **Axial Pro:** https://centro-salud.agentesia.cloud
- **IGS Platform:** https://igs.agentesia.cloud

---

## 🔄 ACTUALIZAR ESTE DOCUMENTO

Este documento debe actualizarse cada vez que:
- Se complete una fase del roadmap
- Se agregue una nueva funcionalidad importante
- Cambie la arquitectura o estructura
- Se añadan nuevos proyectos al servidor

**Formato de fecha:** 2 de Mayo de 2026 (formato largo español)
**Commits de referencia:** Siempre mencionar los últimos commits

---

## ✅ CHECKLIST PARA NUEVA SESIÓN

Antes de empezar a trabajar:
- [ ] Leí CLAUDE_CODE_MAESTRO.md (este documento)
- [ ] Leí el estado actual del proyecto correspondiente
- [ ] Verifiqué qué commits se hicieron recientemente
- [ ] Entiendo en qué fase del roadmap estamos
- [ ] Sé qué es lo próximo que hay que hacer
- [ ] Verifiqué que los contenedores Docker están corriendo
- [ ] Sé cómo hacer deploy de los cambios

**¡SOLO DESPUÉS de completar este checklist, empezar a trabajar!**

---

**FIN DEL DOCUMENTO MAESTRO**

*Este documento es la fuente única de verdad para cualquier Claude Code que trabaje en estos proyectos. Mantenerlo actualizado es CRÍTICO para la continuidad del desarrollo.*
