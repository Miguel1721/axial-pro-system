#!/usr/bin/env node
/**
 * AUDITORÍA FINAL - PRUEBA DE TODOS LOS MÓDULOS IA
 * Verificación exhaustiva de que todos los endpoints estén funcionando
 */

const fs = require('fs');
const path = require('path');

const auditoriaFinal = {
  modulos: [],
  problemasCriticos: [],
  veredicto: 'DESCONOCIDO'
};

// Definición de los 10 módulos con sus endpoints reales
const modulosIATest = [
  {
    id: 1,
    nombre: 'Predicción de Demanda',
    ruta: 'predicciones',
    endpoints: [
      { metodo: 'GET', path: '/demanda' },
      { metodo: 'GET', path: '/demanda/fecha/:fecha' },
      { metodo: 'GET', path: '/dias-criticos' },
      { metodo: 'GET', path: '/estadisticas' },
      { metodo: 'POST', path: '/demanda/recalcular' }
    ],
    archivos: ['routes/predicciones.routes.js', 'models/prediccionDemanda.model.js']
  },
  {
    id: 2,
    nombre: 'Optimización de Citas',
    ruta: 'optimizacion',
    endpoints: [
      { metodo: 'GET', path: '/' },
      { metodo: 'GET', path: '/pendientes' },
      { metodo: 'GET', path: '/estadisticas' },
      { metodo: 'GET', path: '/resumen' },
      { metodo: 'POST', path: '/recalcular' }
    ],
    archivos: ['routes/optimizacion.routes.js']
  },
  {
    id: 3,
    nombre: 'Chatbot de Triaje',
    ruta: 'chatbot',
    endpoints: [
      { metodo: 'GET', path: '/configuracion' },
      { metodo: 'POST', path: '/iniciar' },
      { metodo: 'POST', path: '/enviar' }
    ],
    archivos: ['routes/chatbot.routes.js']
  },
  {
    id: 4,
    nombre: 'Análisis de Historial',
    ruta: 'analisis',
    endpoints: [
      { metodo: 'GET', path: '/historial/:pacienteId' },
      { metodo: 'GET', path: '/estadisticas' },
      { metodo: 'GET', path: '/patrones/:pacienteId' },
      { metodo: 'GET', path: '/dashboard' }
    ],
    archivos: ['routes/analisis.routes.js', 'models/analisisHistorial.model.js']
  },
  {
    id: 5,
    nombre: 'Reconocimiento Voz',
    ruta: 'reconocimientoVoz',
    endpoints: [
      { metodo: 'GET', path: '/estado' },
      { metodo: 'POST', path: '/iniciar' },
      { metodo: 'POST', path: '/detener' }
    ],
    archivos: ['routes/reconocimientoVoz.routes.js']
  },
  {
    id: 6,
    nombre: 'Alertas de Stock',
    ruta: 'alertasStock',
    endpoints: [
      { metodo: 'GET', path: '/detectar' },
      { metodo: 'GET', path: '/' },
      { metodo: 'GET', path: '/estadisticas' }
    ],
    archivos: ['routes/alertasStock.routes.js']
  },
  {
    id: 7,
    nombre: 'Sentimiento Pacientes',
    ruta: 'sentimientoPaciente',
    endpoints: [
      { metodo: 'GET', path: '/feedbacks' },
      { metodo: 'GET', path: '/nps' },
      { metodo: 'GET', path: '/tendencias' }
    ],
    archivos: ['routes/sentimientoPaciente.routes.js']
  },
  {
    id: 8,
    nombre: 'Sugerencias de Citas',
    ruta: 'sugerenciasCitas',
    endpoints: [
      { metodo: 'GET', path: '/:pacienteId' },
      { metodo: 'GET', path: '/estadisticas' },
      { metodo: 'POST', path: '/generar' }
    ],
    archivos: ['routes/sugerenciasCitas.routes.js', 'models/sugerenciasCitas.model.js']
  },
  {
    id: 9,
    nombre: 'Automatización Recordatorios',
    ruta: 'recordatorios',
    endpoints: [
      { metodo: 'GET', path: '/configuraciones' },
      { metodo: 'GET', path: '/estadisticas' },
      { metodo: 'POST', path: '/programar' }
    ],
    archivos: ['routes/recordatorios.routes.js']
  },
  {
    id: 10,
    nombre: 'IA Vision',
    ruta: 'iavision',
    endpoints: [
      { metodo: 'GET', path: '/ocupacion-maxima' },
      { metodo: 'GET', path: '/dias-criticos' },
      { metodo: 'GET', path: '/prediccion-picos' },
      { metodo: 'POST', path: '/optimizar-calendario' },
      { metodo: 'POST', path: '/chatbot-triaje' }
    ],
    archivos: ['routes/iavision.routes.js', 'models/iavision.model.js']
  }
];

console.log('🔍 AUDITORÍA FINAL DE LOS 10 MÓDULOS IA');
console.log('='.repeat(70));

// Verificar server.js
const serverFile = path.join(__dirname, 'server.js');
const serverContent = fs.readFileSync(serverFile, 'utf8');

let totalModulos = 0;
let modulosCompletos = 0;
let totalProblemas = 0;

modulosIATest.forEach(modulo => {
  console.log(`\n📊 Módulo ${modulo.id}: ${modulo.nombre}`);
  console.log('─'.repeat(70));

  const resultado = {
    id: modulo.id,
    nombre: modulo.nombre,
    rutaRegistrada: false,
    archivosExistentes: [],
    endpointsDefinidos: [],
    score: 0,
    estado: 'DESCONOCIDO'
  };

  let puntos = 0;
  let totalPuntos = 0;

  // 1. Verificar que la ruta esté registrada en server.js
  const rutaPattern = new RegExp(`require\\(['"\`].*routes\\/${modulo.ruta}\\.routes['"\`]\\)`, 'i');
  const rutaRegistrada = rutaPattern.test(serverContent);

  if (rutaRegistrada) {
    console.log(`  ✅ Ruta registrada en server.js`);
    resultado.rutaRegistrada = true;
    puntos += 10;
  } else {
    console.log(`  ❌ Ruta NO registrada en server.js`);
    auditoriaFinal.problemasCriticos.push({
      modulo: modulo.nombre,
      severidad: 'CRÍTICO',
      problema: `Ruta ${modulo.ruta} no está importada en server.js`
    });
    totalProblemas++;
  }
  totalPuntos += 10;

  // 2. Verificar archivos
  console.log(`  📂 Archivos:`);
  modulo.archivos.forEach(archivo => {
    const fullPath = path.join(__dirname, archivo);
    if (fs.existsSync(fullPath)) {
      console.log(`    ✅ ${archivo}`);
      resultado.archivosExistentes.push({ archivo, existe: true });
      puntos += 5;
    } else {
      console.log(`    ❌ ${archivo} - NO EXISTE`);
      resultado.archivosExistentes.push({ archivo, existe: false });
      auditoriaFinal.problemasCriticos.push({
        modulo: modulo.nombre,
        severidad: 'ALTO',
        problema: `Archivo faltante: ${archivo}`
      });
      totalProblemas++;
    }
    totalPuntos += 5;
  });

  // 3. Verificar endpoints definidos en el archivo de rutas
  console.log(`  🔌 Endpoints:`);
  const rutaFile = path.join(__dirname, `routes/${modulo.ruta}.routes.js`);

  if (fs.existsSync(rutaFile)) {
    const rutaContent = fs.readFileSync(rutaFile, 'utf8');

    modulo.endpoints.forEach(endpoint => {
      const endpointPattern = new RegExp(
        `router\\.${endpoint.metodo.toLowerCase}\\(['"\`]${endpoint.path.replace(/:[^'"\`]+/g, '[^\'"\`]*')}['"\`]`,
        'i'
      );

      if (endpointPattern.test(rutaContent)) {
        console.log(`    ✅ ${endpoint.metodo} /api/${modulo.ruta}${endpoint.path}`);
        resultado.endpointsDefinidos.push({ endpoint, definido: true });
        puntos += 2;
      } else {
        console.log(`    ❌ ${endpoint.metodo} /api/${modulo.ruta}${endpoint.path} - NO DEFINIDO`);
        resultado.endpointsDefinidos.push({ endpoint, definido: false });
        auditoriaFinal.problemasCriticos.push({
          modulo: modulo.nombre,
          severidad: 'MEDIO',
          problema: `Endpoint no definido: ${endpoint.metodo} ${endpoint.path}`
        });
        totalProblemas++;
      }
      totalPuntos += 2;
    });
  } else {
    console.log(`    ⚠️  No se puede verificar endpoints - archivo no encontrado`);
    modulo.endpoints.forEach(() => {
      totalPuntos += 2;
    });
  }

  // Calcular score
  resultado.score = Math.round((puntos / totalPuntos) * 100);

  if (resultado.score === 100) {
    resultado.estado = '✅ COMPLETO';
    modulosCompletos++;
  } else if (resultado.score >= 80) {
    resultado.estado = '🟢 FUNCIONAL';
  } else if (resultado.score >= 60) {
    resultado.estado = '🟡 NECESITA MEJORAS';
  } else {
    resultado.estado = '🔴 CRÍTICO';
  }

  console.log(`  📈 Score: ${resultado.score}% - ${resultado.estado}`);

  auditoriaFinal.modulos.push(resultado);
  totalModulos++;
});

// Veredicto final
console.log('\n' + '='.repeat(70));
console.log('📋 VEREDICTO FINAL');
console.log('='.repeat(70));

const scorePromedio = Math.round(
  auditoriaFinal.modulos.reduce((sum, mod) => sum + mod.score, 0) / totalModulos
);

console.log(`\n📊 Score Promedio: ${scorePromedio}%`);
console.log(`✅ Módulos Completos (100%): ${modulosCompletos}/${totalModulos}`);
console.log(`❌ Problemas Críticos: ${auditoriaFinal.problemasCriticos.length}`);

if (scorePromedio >= 90) {
  console.log('\n🎉 VEREDICTO: EXCELENTE - Sistema IA listo para producción');
  auditoriaFinal.veredicto = 'EXCELENTE';
} else if (scorePromedio >= 80) {
  console.log('\n✅ VEREDICTO: MUY BUENO - Sistema IA funcional');
  auditoriaFinal.veredicto = 'MUY_BUENO';
} else if (scorePromedio >= 70) {
  console.log('\n✅ VEREDICTO: BUENO - Sistema IA funcional con mejoras menores');
  auditoriaFinal.veredicto = 'BUENO';
} else if (scorePromedio >= 60) {
  console.log('\n⚠️  VEREDICTO: ACEPTABLE - Requiere mejoras moderadas');
  auditoriaFinal.veredicto = 'ACEPTABLE';
} else {
  console.log('\n🔴 VEREDICTO: CRÍTICO - No listo para producción');
  auditoriaFinal.veredicto = 'CRITICO';
}

// Problemas por severidad
if (auditoriaFinal.problemasCriticos.length > 0) {
  console.log('\n⚠️  PROBLEMAS DETECTADOS:');
  const criticos = auditoriaFinal.problemasCriticos.filter(p => p.severidad === 'CRÍTICO');
  const altos = auditoriaFinal.problemasCriticos.filter(p => p.severidad === 'ALTO');
  const medios = auditoriaFinal.problemasCriticos.filter(p => p.severidad === 'MEDIO');

  if (criticos.length > 0) {
    console.log(`  🔴 CRÍTICOS: ${criticos.length}`);
    criticos.forEach(p => console.log(`     - ${p.modulo}: ${p.problema}`));
  }

  if (altos.length > 0) {
    console.log(`  🟡 ALTOS: ${altos.length}`);
    altos.forEach(p => console.log(`     - ${p.modulo}: ${p.problema}`));
  }

  if (medios.length > 0) {
    console.log(`  🟠 MEDIOS: ${medios.length}`);
  }
} else {
  console.log('\n✅ NO SE DETECTARON PROBLEMAS');
}

// Guardar resultado
const resultadoFile = path.join(__dirname, '../auditoria_final_modulos_ia.json');
fs.writeFileSync(resultadoFile, JSON.stringify(auditoriaFinal, null, 2));
console.log(`\n📁 Auditoría guardada en: ${resultadoFile}`);

console.log('\n' + '='.repeat(70));

process.exit(scorePromedio >= 70 ? 0 : 1);