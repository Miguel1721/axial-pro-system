#!/usr/bin/env node
/**
 * AUDITORÍA REAL DE ENDPOINTS - Verificación exacta de qué existe
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
const serverFile = path.join(__dirname, 'server.js');

// Leer server.js para ver qué rutas están registradas
const serverContent = fs.readFileSync(serverFile, 'utf8');

// Encontrar todas las rutas importadas
const importedRoutes = serverContent.match(/require\(['"`].*routes\/(.*?)['"`]\)/g) || [];

console.log('📋 RUTAS IMPORTADAS EN SERVER.JS:');
console.log('='.repeat(60));
importedRoutes.forEach(imp => {
  const match = imp.match(/routes\/(.*?)['"`]/);
  if (match) {
    console.log(`  ✅ ${match[1]}`);
  }
});

// Ahora verificar qué archivos de rutas existen
console.log('\n📂 ARCHIVOS DE RUTAS QUE EXISTEN:');
console.log('='.repeat(60));

const routeFiles = fs.readdirSync(routesDir)
  .filter(file => file.endsWith('.routes.js'))
  .sort();

routeFiles.forEach(file => {
  const fullPath = path.join(routesDir, file);
  const stats = fs.statSync(fullPath);
  console.log(`  📄 ${file} (${Math.round(stats.size / 1024)}KB)`);
});

// Verificar diferencias
console.log('\n❌ RUTAS QUE EXISTEN PERO NO ESTÁN IMPORTADAS:');
console.log('='.repeat(60));

const importedRouteNames = importedRoutes
  .map(imp => imp.match(/routes\/(.*?)['"`]/)[1])
  .filter(name => !name.startsWith('payment-gateway/'));

routeFiles.forEach(file => {
  const routeName = file.replace('.routes.js', '');
  if (!importedRouteNames.includes(routeName)) {
    console.log(`  ❌ ${file} - NO IMPORTADA EN SERVER.JS`);

    // Mostrar endpoints que tendría esta ruta
    const fullPath = path.join(routesDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Buscar definiciones de rutas
    const routerGets = (content.match(/router\.get\(['"`](.*?)['"`]/g) || []).map(s => s.match(/['"`](.*?)['"`]/)[1]);
    const routerPosts = (content.match(/router\.post\(['"`](.*?)['"`]/g) || []).map(s => s.match(/['"`](.*?)['"`]/)[1]);

    if (routerGets.length > 0 || routerPosts.length > 0) {
      console.log(`     Endpoints perdidos:`);
      routerGets.forEach(endpoint => {
        console.log(`       GET /api/${routeName}${endpoint}`);
      });
      routerPosts.forEach(endpoint => {
        console.log(`       POST /api/${routeName}${endpoint}`);
      });
    }
  }
});

console.log('\n✅ RUTAS CRÍTICAS FALTANTES EN SERVER.JS:');
console.log('='.repeat(60));

const criticalRoutes = [
  'recordatorios',
  'sentimientoPaciente',
  'sugerenciasCitas',
  'alertasStock'
];

criticalRoutes.forEach(route => {
  const routeFile = path.join(routesDir, `${route}.routes.js`);
  if (fs.existsSync(routeFile)) {
    const isImported = serverContent.includes(route);
    if (!isImported) {
      console.log(`  ❌ ${route}.routes.js - FALTA IMPORTAR`);
      console.log(`     Agregar: const ${route}Routes = require('./routes/${route}.routes');`);
      console.log(`     Agregar: app.use('/api/${route}', ${route}Routes);`);
    }
  }
});

// Generar código para agregar las rutas faltantes
console.log('\n🔧 CÓDIGO PARA AGREGAR RUTAS FALTANTES:');
console.log('='.repeat(60));

const missingRoutes = criticalRoutes.filter(route => {
  return fs.existsSync(path.join(routesDir, `${route}.routes.js`)) &&
         !serverContent.includes(route);
});

if (missingRoutes.length > 0) {
  console.log('// Agregar estas líneas después de las otras imports en server.js\n');

  missingRoutes.forEach(route => {
    const routeName = route.charAt(0).toLowerCase() + route.slice(1);
    console.log(`const ${routeName}Routes = require('./routes/${route}.routes');`);
  });

  console.log('\n// Agregar estas líneas en la sección de middleware de rutas\n');

  missingRoutes.forEach(route => {
    const routeName = route.charAt(0).toLowerCase() + route.slice(1);
    console.log(`app.use('/api/${routeName}', ${routeName}Routes);`);
  });
} else {
  console.log('✅ Todas las rutas críticas están importadas');
}

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN:');
console.log('='.repeat(60));
console.log(`Total rutas importadas: ${importedRouteNames.length}`);
console.log(`Total archivos de rutas: ${routeFiles.length}`);
console.log(`Rutas críticas faltantes: ${missingRoutes.length}`);
console.log('='.repeat(60));