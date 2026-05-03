# ⚡ COMANDOS RÁPIDOS - 30 SEGUNDOS PARA REINICIAR

**NUEVA SESIÓN**: Ejecutar estos comandos en orden.

---

## 🚀 **INICIO RÁPIDO (2 minutos)**

```bash
# 1. Ir al proyecto
cd /home/ubuntu/axial-pro-system/frontend

# 2. Iniciar servidor
npm run dev

# 3. Abrir navegador
# http://localhost:517X (el puerto que muestre)
```

**✅ LISTO** - Sistema optimizado corriendo

---

## 🔄 **SI HAY ERRORES (30 segundos)**

```bash
# OPCIÓN 1: Revertir un archivo
cp src/App.final-backup.jsx src/App.jsx

# OPCIÓN 2: Revertir todo
cp src/App.backup.jsx src/App.jsx
cp src/pages/DashboardAdmin.backup.jsx src/pages/DashboardAdmin.jsx

# OPCIÓN 3: Reiniciar servidor
pkill -f "vite" && npm run dev
```

---

## 📁 **ARCHIVOS CLAVE (30 segundos)**

```
LEER EN ESTE ORDEN:
1. START_HERE.md - Estado actual (LEER PRIMERO)
2. QUICK_REFERENCE.md - Resumen ejecutivo
3. SESSION_SUMMARY.md - Todo lo logrado

USAR COMPONENTES:
1. src/components/ui/USAGE_EXAMPLES.md
2. src/components/ui/index.js
```

---

## 🎯 **QUÉ PASARÁ CUANDO INICIES**

```
VERÁS EN http://localhost:517X/:
✅ Dashboard optimizado con React.memo
✅ React Query DevTools (esquina inferior derecha)
✅ Error Boundary si hay errores
✅ Toasts mejorados
✅ Layout optimizado
```

---

## 🆘 **PROBLEMAS COMUNES**

```bash
# Error: Cannot find module '@tanstack/react-query'
npm install @tanstack/react-query @tanstack/react-query-devtools --legacy-peer-deps

# Error: Servidor no inicia
pkill -f "vite" && rm -rf node_modules/.vite && npm run dev

# Error: Puerto ocupado
# Esperar 5 segundos o matar procesos con pkill -f "vite"
```

---

## ✅ **VERIFICACIÓN RÁPIDA**

```bash
# Ver archivos reemplazados
ls -la src/App.jsx src/pages/DashboardAdmin.jsx src/components/Layout.jsx

# Ver backups disponibles
ls -la *.backup.jsx

# Ver componentes UI nuevos
ls -la src/components/ui/

# Ver servidor corriendo
curl http://localhost:5179/
```

---

## 🎯 **PRÓXIMA ACCIÓN**

**Si todo funciona**: Hacer testing manual de http://localhost:517X
**Si hay errores**: Revertir archivos desde backups
**Si continuar**: Leer SESSION_SUMMARY.md para ver próximos pasos

---

**¡LISTO!** Con esto puedes continuar en 30 segundos. 🚀