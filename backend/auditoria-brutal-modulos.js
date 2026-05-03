#!/usr/bin/env node
/**
 * AUDITORÍA BRUTAL DE LOS 10 MÓDULOS IA - FASE 4
 * Revisión exhaustiva y honesta del estado real de implementación
 */

const fs = require('fs');
const path = require('path');

const auditoria = {
  modulos: [],
  problemas: [],
  exitos: [],
  severidad: {
    critico: [],
    alto: [],
    medio: [],
    bajo: []
  }
};

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function separator(char = '═', length = 80) {
  return char.repeat(length);
}

// Definición de los 10 módulos
const modulosIA = [
  {
    id: 1,
    nombre: 'Predicción de Demanda',
    archivosBackend: [
      'routes/predicciones.routes.js',
      'models/predicciones.model.js'
    ],
    archivosFrontend: [
      'pages/PrediccionesPage.jsx'
    ],
    endpointsEsperados: [
      'GET /api/predicciones/demanda',
      'GET /api/predicciones/metrics'
    ],
    funcionalidadesClave: [
      'Análisis de demanda histórica',
      'Predicción de citas futuras',
      'Métricas de precisión'
    ]
  },
  {
    id: 2,
    nombre: 'Optimización de Citas',
    archivosBackend: [
      'routes/optimizacion.routes.js',
      'models/optimizacion.model.js'
    ],
    archivosFrontend: [
      'pages/OptimizacionesPage.jsx'
    ],
    endpointsEsperados: [
      'GET /api/optimizaciones/citas',
      'POST /api/optimizaciones/agenda'
    ],
    funcionalidadesClave: [
      'Algoritmo de optimización',
      'Reducción de vacíos',
      'Balanceo de médicos'
    ]
  },
  {
    id: 3,
    nombre: 'Chatbot de Triaje',
    archivosBackend: [
      'routes/chatbot.routes.js',
      'models/chatbot.model.js'
    ],
    archivosFrontend: [
      'pages/ChatbotPage.jsx',
      'components/ChatbotTriaje.jsx'
    ],
    endpointsEsperados: [
      'POST /api/chatbot/iniciar',
      'POST /api/chatbot/enviar'
    ],
    funcionalidadesClave: [
      'Clasificación de urgencias',
      'Preguntas adaptativas',
      'Redirección automática'
    ]
  },
  {
    id: 4,
    nombre: 'Análisis de Historial',
    archivosBackend: [
      'routes/analisis.routes.js',
      'models/analisisHistorial.model.js'
    ],
    archivosFrontend: [
      'pages/AnalisisPage.jsx',
      'components/AnalisisHistorial.jsx'
    ],
    endpointsEsperados: [
      'GET /api/analisis/historial',
      'GET /api/analisis/patrones'
    ],
    funcionalidadesClave: [
      'Detección de patrones recurrentes',
      'Alertas tempranas',
      'Tendencias de salud'
    ]
  },
  {
    id: 5,
    nombre: 'Reconocimiento Voz',
    archivosBackend: [
      'routes/reconocimientoVoz.routes.js'
    ],
    archivosFrontend: [
      'pages/ReconocimientoVozPage.jsx'
    ],
    endpointsEsperados: [
      'POST /api/reconocimiento-voz/transcribir',
      'POST /api/reconocimiento-voz/comando'
    ],
    funcionalidadesClave: [
      'Transcripción de audio',
      'Dictado de notas médicas',
      'Búsqueda por voz'
    ]
  },
  {
    id: 6,
    nombre: 'Alertas de Stock',
    archivosBackend: [
      'routes/alertasStock.routes.js'
    ],
    archivosFrontend: [
      'pages/AlertasPage.jsx'
    ],
    endpointsEsperados: [
      'GET /api/alertas-stock/prediccion',
      'GET /api/alertas-stock/sugerencias'
    ],
    funcionalidadesClave: [
      'Predicción de agotamiento',
      'Sugerencias de reabastecimiento',
      'Optimización de inventario'
    ]
  },
  {
    id: 7,
    nombre: 'Sentimiento Pacientes',
    archivosBackend: [
      'routes/sentimientoPaciente.routes.js'
    ],
    archivosFrontend: [
      'components/SentimientoPaciente.jsx'
    ],
    endpointsEsperados: [
      'GET /api/sentimiento-paciente/analisis',
      'GET /api/sentimiento-paciente/nps'
    ],
    funcionalidadesClave: [
      'Análisis de feedbacks',
      'Detección de quejas',
      'Cálculo de NPS'
    ]
  },
  {
    id: 8,
    nombre: 'Sugerencias de Citas',
    archivosBackend: [
      'routes/sugerenciasCitas.routes.js',
      'models/sugerenciasCitas.model.js'
    ],
    archivosFrontend: [
      'components/SugerenciasCitas.jsx'
    ],
    endpointsEsperados: [
      'GET /api/sugerencias-citas/optimas',
      'GET /api/sugerencias-citas/medico'
    ],
    funcionalidadesClave: [
      'Horarios óptimos',
      'Médico más adecuado',
      'Preparación previa'
    ]
  },
  {
    id: 9,
    nombre: 'Automatización Recordatorios',
    archivosBackend: [
      'routes/recordatorios.routes.js'
    ],
    archivosFrontend: [
      'components/Recordatorios.jsx'
    ],
    endpointsEsperados: [
      'GET /api/recordatorios/configurar',
      'GET /api/recordatorios/estadisticas'
    ],
    funcionalidadesClave: [
      'SMS/WhatsApp optimizados',
      'Horarios inteligentes',
      'Estadísticas de efectividad'
    ]
  },
  {
    id: 10,
    nombre: 'IA Vision',
    archivosBackend: [
      'routes/iavision.routes.js',
      'models/iavision.model.js'
    ],
    archivosFrontend: [
      'pages/IAVisionPage.jsx',
      'pages/ChatbotTriajePage.jsx',
      'components/ChatbotTriaje.jsx'
    ],
    endpointsEsperados: [
      'GET /api/iavision/ocupacion-maxima',
      'GET /api/iavision/dias-criticos',
      'GET /api/iavision/prediccion-picos',
      'POST /api/iavision/optimizar-calendario',
      'POST /api/iavision/chatbot-triaje'
    ],
    funcionalidadesClave: [
      'Ocupación máxima horarios',
      'Días críticos y alertas',
      'Optimización de calendario',
      'Predicción de picos estacionales',
      'Chatbot de triaje 24/7',
      'OCR documentos médicos',
      'Análisis de imágenes médicas',
      'Reconocimiento facial check-in'
    ]
  }
];

// Función para verificar si un archivo existe
function verificarArchivo(ruta) {
  const fullPath = path.join(__dirname, ruta);
  if (fs.existsSync(fullPath)) {
    try {
      const contenido = fs.readFileSync(fullPath, 'utf8');
      return { existe: true, contenido };
    } catch (error) {
      return { existe: true, error: error.message };
    }
  }
  return { existe: false };
}

// Función para verificar si un endpoint está definido en el servidor
function verificarEndpointEnServicio(endpoint, archivoServer) {
  try {
    const serverPath = path.join(__dirname, archivoServer);
    if (!fs.existsSync(serverPath)) {
      return { encontrado: false, razon: 'server.js no encontrado' };
    }

    const serverContent = fs.readFileSync(serverPath, 'utf8');

    // Verificar si el endpoint está registrado
    const endpointPattern = new RegExp(`app\\.(use|get|post|put|delete)\\(['"\`]${endpoint}['"\`]`, 'i');
    const encontrado = endpointPattern.test(serverContent);

    return { encontrado, razon: encontrado ? 'endpoint encontrado' : 'endpoint no registrado' };
  } catch (error) {
    return { encontrado: false, razon: error.message };
  }
}

// Función para analizar calidad del código
function analizarCalidadCodigo(contenido, moduloNombre) {
  const problemas = [];

  // Verificar si es solo stub/mock
  if (contenido.includes('TODO') || contenido.includes('FALTA IMPLEMENTAR')) {
    problemas.push({
      tipo: 'STUB',
      mensaje: 'Código contiene TODOs o implementaciones pendientes'
    });
  }

  // Verificar si tiene try-catch proper
  if (!contenido.includes('try') && contenido.includes('async')) {
    problemas.push({
      tipo: 'ERROR_HANDLING',
      mensaje: 'Falta manejo de errores en funciones asíncronas'
    });
  }

  // Verificar si tiene console.log en producción
  if ((contenido.match(/console\.log/g) || []).length > 5) {
    problemas.push({
      tipo: 'CLEAN_CODE',
      mensaje: 'Excesivo uso de console.log para producción'
    });
  }

  // Verificar si tiene hardcoded data
  if (contenido.includes('mockData') || contenido.includes('dummyData')) {
    problemas.push({
      tipo: 'MOCK_DATA',
      mensaje: 'Uso de datos mock en lugar de implementación real'
    });
  }

  return problemas;
}

// Función principal de auditoría
async function auditarModulo(modulo) {
  log(colors.cyan, `\n🔍 AUDITANDO: Módulo ${modulo.id} - ${modulo.nombre}`);

  const resultado = {
    id: modulo.id,
    nombre: modulo.nombre,
    archivosBackend: [],
    archivosFrontend: [],
    endpoints: [],
    funcionalidades: [],
    estado: 'DESCONOCIDO',
    problemas: [],
    score: 0
  };

  let totalPuntos = 0;
  let puntosObtenidos = 0;

  // Verificar archivos backend
  log(colors.blue, '  📂 Archivos Backend:');
  for (const archivo of modulo.archivosBackend) {
    const verificacion = verificarArchivo(archivo);
    if (verificacion.existe) {
      log(colors.green, `    ✅ ${archivo}`);
      resultado.archivosBackend.push({ archivo, estado: 'OK' });
      puntosObtenidos++;

      if (verificacion.contenido) {
        const problemasCodigo = analizarCalidadCodigo(verificacion.contenido, modulo.nombre);
        if (problemasCodigo.length > 0) {
          problemasCodigo.forEach(prob => {
            log(colors.yellow, `      ⚠️  ${prob.mensaje}`);
            resultado.problemas.push({ archivo, tipo: prob.tipo, mensaje: prob.mensaje });
          });
        }
      }
    } else {
      log(colors.red, `    ❌ ${archivo} - NO ENCONTRADO`);
      resultado.archivosBackend.push({ archivo, estado: 'FALTANTE' });
      auditoria.problemas.push({
        modulo: modulo.nombre,
        severidad: 'CRÍTICO',
        mensaje: `Archivo backend faltante: ${archivo}`
      });
      auditoria.severidad.critico.push(`Módulo ${modulo.id}: ${archivo}`);
    }
    totalPuntos++;
  }

  // Verificar archivos frontend
  log(colors.blue, '  🎨 Archivos Frontend:');
  for (const archivo of modulo.archivosFrontend) {
    const rutaFrontend = `../frontend/src/${archivo}`;
    const verificacion = verificarArchivo(rutaFrontend);
    if (verificacion.existe) {
      log(colors.green, `    ✅ ${archivo}`);
      resultado.archivosFrontend.push({ archivo, estado: 'OK' });
      puntosObtenidos++;
    } else {
      log(colors.red, `    ❌ ${archivo} - NO ENCONTRADO`);
      resultado.archivosFrontend.push({ archivo, estado: 'FALTANTE' });
      auditoria.problemas.push({
        modulo: modulo.nombre,
        severidad: 'ALTO',
        mensaje: `Archivo frontend faltante: ${archivo}`
      });
      auditoria.severidad.alto.push(`Módulo ${modulo.id}: ${archivo}`);
    }
    totalPuntos++;
  }

  // Verificar endpoints en servidor
  log(colors.blue, '  🔌 Endpoints:');
  for (const endpoint of modulo.endpointsEsperados) {
    const verificacion = verificarEndpointEnServicio(endpoint, 'server.js');
    if (verificacion.encontrado) {
      log(colors.green, `    ✅ ${endpoint}`);
      resultado.endpoints.push({ endpoint, estado: 'OK' });
      puntosObtenidos++;
    } else {
      log(colors.red, `    ❌ ${endpoint} - ${verificacion.razon}`);
      resultado.endpoints.push({ endpoint, estado: 'FALTANTE', razon: verificacion.razon });
      auditoria.problemas.push({
        modulo: modulo.nombre,
        severidad: 'CRÍTICO',
        mensaje: `Endpoint no registrado: ${endpoint}`
      });
      auditoria.severidad.critico.push(`Módulo ${modulo.id}: ${endpoint}`);
    }
    totalPuntos++;
  }

  // Verificar funcionalidades clave (solo si existen los archivos)
  log(colors.blue, '  ⚙️  Funcionalidades Clave:');
  for (const funcionalidad of modulo.funcionalidadesClave) {
    // Solo verificamos que esté mencionada en algún archivo
    let encontrada = false;
    for (const archivo of [...modulo.archivosBackend, ...modulo.archivosFrontend]) {
      const ruta = archivo.startsWith('pages/') || archivo.startsWith('components/')
        ? `../frontend/src/${archivo}`
        : archivo;
      const verificacion = verificarArchivo(ruta);
      if (verificacion.existe && verificacion.contenido) {
        // Buscar palabras clave de la funcionalidad
        const palabrasClave = funcionalidad.toLowerCase().split(' ');
        const encontrado = palabrasClave.some(palabra =>
          verificacion.contenido.toLowerCase().includes(palabra)
        );
        if (encontrado) {
          encontrada = true;
          break;
        }
      }
    }

    if (encontrada) {
      log(colors.green, `    ✅ ${funcionalidad}`);
      resultado.funcionalidades.push({ funcionalidad, estado: 'IMPLEMENTADA' });
      puntosObtenidos++;
    } else {
      log(colors.yellow, `    ⚠️  ${funcionalidad} - NO VERIFICABLE`);
      resultado.funcionalidades.push({ funcionalidad, estado: 'NO VERIFICABLE' });
    }
    totalPuntos++;
  }

  // Calcular score y estado
  resultado.score = totalPuntos > 0 ? Math.round((puntosObtenidos / totalPuntos) * 100) : 0;

  if (resultado.score === 100) {
    resultado.estado = '✅ COMPLETO';
  } else if (resultado.score >= 80) {
    resultado.estado = '🟢 CASI COMPLETO';
  } else if (resultado.score >= 60) {
    resultado.estado = '🟡 PARCIAL';
  } else if (resultado.score >= 40) {
    resultado.estado = '🟠 INSUFICIENTE';
  } else {
    resultado.estado = '🔴 CRÍTICO';
  }

  log(colors.magenta, `  📊 Score: ${resultado.score}% - ${resultado.estado}`);

  auditoria.modulos.push(resultado);

  if (resultado.score === 100) {
    auditoria.exitos.push(modulo.nombre);
  }

  return resultado;
}

// Función para generar reporte final
function generarReporteFinal() {
  log(colors.cyan, `\n${separator('═')}`);
  log(colors.magenta, '📋 REPORTE FINAL DE AUDITORÍA - FASE 4 IA');
  log(colors.cyan, `${separator('═')}\n`);

  // Resumen por estado
  log(colors.yellow, '📊 RESUMEN POR ESTADO:');
  const estados = {};
  auditoria.modulos.forEach(mod => {
    estados[mod.estado] = (estados[mod.estado] || 0) + 1;
  });

  Object.entries(estados).forEach(([estado, count]) => {
    log(colors.white, `  ${estado}: ${count} módulo(s)`);
  });

  // Top módulos
  log(colors.cyan, '\n🏆 TOP MÓDULOS:');
  const sorted = [...auditoria.modulos].sort((a, b) => b.score - a.score);
  sorted.slice(0, 3).forEach((mod, idx) => {
    log(colors.green, `  ${idx + 1}. Módulo ${mod.id} - ${mod.nombre} (${mod.score}%)`);
  });

  // Módulos críticos
  log(colors.red, '\n🚨 MÓDULOS CRÍTICOS (score < 60%):');
  const criticos = sorted.filter(mod => mod.score < 60);
  if (criticos.length === 0) {
    log(colors.green, '  ✅ No hay módulos críticos');
  } else {
    criticos.forEach(mod => {
      log(colors.red, `  ❌ Módulo ${mod.id} - ${mod.nombre} (${mod.score}%)`);
    });
  }

  // Problemas por severidad
  log(colors.yellow, '\n⚠️  PROBLEMAS POR SEVERIDAD:');
  log(colors.red, `  🔴 CRÍTICOS: ${auditoria.severidad.critico.length}`);
  auditoria.severidad.critico.forEach(prob => log(colors.red, `    - ${prob}`));

  log(colors.yellow, `  🟡 ALTOS: ${auditoria.severidad.alto.length}`);
  auditoria.severidad.alto.forEach(prob => log(colors.yellow, `    - ${prob}`));

  // Veredicto final
  log(colors.cyan, `\n${separator('═')}`);
  const scorePromedio = Math.round(
    auditoria.modulos.reduce((sum, mod) => sum + mod.score, 0) / auditoria.modulos.length
  );

  if (scorePromedio >= 90) {
    log(colors.green, '🎉 VEREDICTO: EXCELENTE - Sistema IA listo para producción');
  } else if (scorePromedio >= 80) {
    log(colors.green, '✅ VEREDICTO: MUY BUENO - Sistema IA funcional con mejoras menores');
  } else if (scorePromedio >= 70) {
    log(colors.yellow, '⚠️  VEREDICTO: ACEPTABLE - Sistema IA necesita mejoras moderadas');
  } else if (scorePromedio >= 60) {
    log(colors.yellow, '🟡 VEREDICTO: PREOCUPANTE - Sistema IA requiere atención urgente');
  } else {
    log(colors.red, '🔴 VEREDICTO: CRÍTICO - Sistema IA no está listo para producción');
  }

  log(colors.cyan, `   Score Promedio: ${scorePromedio}%`);
  log(colors.cyan, `   Módulos Completos: ${auditoria.exitos.length}/10`);
  log(colors.cyan, `${separator('═')}\n`);
}

// Ejecutar auditoría
async function ejecutarAuditoria() {
  log(colors.cyan, `${separator('═')}`);
  log(colors.magenta, '🔍 AUDITORÍA BRUTAL DE LOS 10 MÓDULOS IA - FASE 4');
  log(colors.cyan, `${separator('═')}`);
  log(colors.white, 'Fecha: ' + new Date().toLocaleString('es-ES'));
  log(colors.white, 'Objetivo: Verificación exhaustiva y honesta del estado real de implementación\n');

  for (const modulo of modulosIA) {
    await auditarModulo(modulo);
  }

  generarReporteFinal();

  // Guardar auditoría en archivo JSON
  const auditoriaPath = path.join(__dirname, '../auditoria_modulos_ia_resultados.json');
  fs.writeFileSync(auditoriaPath, JSON.stringify(auditoria, null, 2));
  log(colors.green, `\n✅ Auditoría guardada en: ${auditoriaPath}`);
}

// Ejecutar
ejecutarAuditoria().catch(console.error);