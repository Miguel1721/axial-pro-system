#!/usr/bin/env node
/**
 * LIMPIEZA DE CÓDIGO - SCRIPT AUTOMATIZADO
 * Elimina console.logs excesivos, TODOs, y mejora calidad del código
 */

const fs = require('fs');
const path = require('path');

class CodeCleaner {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      consoleLogsRemoved: 0,
      todosFixed: 0,
      commentsImproved: 0,
      errorsFixed: 0
    };
  }

  /**
   * Procesar un archivo individual
   */
  processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // 1. Eliminar console.log excesivos (dejar máx 3 por archivo)
      const consoleLogs = content.match(/console\.log\(/g);
      if (consoleLogs && consoleLogs.length > 3) {
        content = this.removeExcessiveConsoleLogs(content);
        modified = true;
        this.stats.consoleLogsRemoved += consoleLogs.length - 3;
      }

      // 2. Convertir TODOs en tareas con issue tracker
      if (content.includes('TODO') || content.includes('FIXME')) {
        content = this.fixTODOs(content, filePath);
        modified = true;
        this.stats.todosFixed++;
      }

      // 3. Mejorar comentarios
      content = this.improveComments(content);
      if (content !== this.originalContent) {
        modified = true;
        this.stats.commentsImproved++;
      }

      // 4. Corregir errores comunes
      content = this.fixCommonErrors(content);
      if (content !== this.originalContent) {
        modified = true;
        this.stats.errorsFixed++;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.stats.filesProcessed++;
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Eliminar console.logs excesivos
   */
  removeExcessiveConsoleLogs(content) {
    const lines = content.split('\n');
    const logLines = [];

    // Identificar líneas con console.log
    lines.forEach((line, index) => {
      if (line.includes('console.log')) {
        logLines.push(index);
      }
    });

    // Mantener solo los primeros 3 console.log importantes
    if (logLines.length > 3) {
      // Eliminar console.logs que no son de error
      const toRemove = logLines.slice(3);
      toRemove.reverse().forEach(lineIndex => {
        const line = lines[lineIndex];
        if (!line.includes('error') && !line.includes('Error')) {
          lines[lineIndex] = ''; // Eliminar línea
        }
      });
    }

    return lines.join('\n').replace(/\n\s*\n/g, '\n\n');
  }

  /**
   * Convertir TODOs en tareas rastreables
   */
  fixTODOs(content, filePath) {
    let modified = false;

    // Reemplazar TODOs con formato estandarizado
    content = content.replace(/TODO:?/gi, (match, offset, string) => {
      modified = true;
      return '@TODO(' + path.basename(filePath) + '):';
    });

    // Reemplazar FIXMEs
    content = content.replace(/FIXME:?/gi, (match, offset, string) => {
      modified = true;
      return '@FIXME(' + path.basename(filePath) + '):';
    });

    return content;
  }

  /**
   * Mejorar comentarios
   */
  improveComments(content) {
    this.originalContent = content;

    // Convertir comentarios de una línea en formato JSDoc
    content = content.replace(/\/\/ (.*)/g, (match, comment) => {
      if (comment.length > 50 && !comment.includes('http')) {
        return `/**\n * ${comment}\n */`;
      }
      return match;
    });

    return content;
  }

  /**
   * Corregir errores comunes de código
   */
  fixCommonErrors(content) {
    // 1. Agregar punto y coma donde falta
    content = content.replace(/^(\s+)(return|throw|break|continue)([^;])$/gm, '$1$2$3;');

    // 2. Convertir var en const/let
    content = content.replace(/\bvar\s+/g, 'let ');

    // 3. Agregar async/await donde falta
    content = content.replace(/\.then\(([^)]+)\)\s*=>/g, 'async ($1) =>');

    // 4. Eliminar llaves vacías
    content = content.replace(/\{\s*\}/g, '{}');

    return content;
  }

  /**
   * Procesar directorio completo
   */
  processDirectory(dirPath, extensions = ['.js', '.jsx']) {
    const files = fs.readdirSync(dirPath);
    const results = {
      processed: [],
      skipped: []
    };

    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursivamente procesar subdirectorios
        const subResults = this.processDirectory(fullPath, extensions);
        results.processed.push(...subResults.processed);
        results.skipped.push(...subResults.skipped);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        const wasModified = this.processFile(fullPath);
        if (wasModified) {
          results.processed.push(fullPath);
        } else {
          results.skipped.push(fullPath);
        }
      }
    });

    return results;
  }

  /**
   * Imprimir estadísticas
   */
  printStatistics() {
    console.log('\n📊 CODE CLEANING STATISTICS');
    console.log('─'.repeat(50));
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Console logs removed: ${this.stats.consoleLogsRemoved}`);
    console.log(`TODOs fixed: ${this.stats.todosFixed}`);
    console.log(`Comments improved: ${this.stats.commentsImproved}`);
    console.log(`Errors fixed: ${this.stats.errorsFixed}`);
    console.log('─'.repeat(50));
  }
}

/**
 * Función principal
 */
async function cleanCodeBase() {
  const cleaner = new CodeCleaner();

  console.log('🧹 Starting code cleanup...');
  console.log('═'.repeat(50));

  // Limpiar archivos de rutas
  console.log('\n📂 Cleaning routes...');
  const routesResults = cleaner.processDirectory(
    path.join(__dirname, '../routes'),
    ['.js']
  );

  // Limpiar archivos de modelos
  console.log('\n📂 Cleaning models...');
  const modelsResults = cleaner.processDirectory(
    path.join(__dirname, '../models'),
    ['.js']
  );

  // Limpiar archivos de tests
  console.log('\n📂 Cleaning tests...');
  const testsResults = cleaner.processDirectory(
    path.join(__dirname, '../tests'),
    ['.js']
  );

  // Imprimir estadísticas
  cleaner.printStatistics();

  // Guardar reporte
  const report = {
    timestamp: new Date().toISOString(),
    stats: cleaner.stats,
    routes: routesResults,
    models: modelsResults,
    tests: testsResults
  };

  const reportPath = __dirname + '/../code-cleaning-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📁 Report saved to: ${reportPath}`);
  console.log('✅ Code cleanup completed!');
}

// Ejecutar
if (require.main === module) {
  cleanCodeBase().catch(console.error);
}

module.exports = CodeCleaner;