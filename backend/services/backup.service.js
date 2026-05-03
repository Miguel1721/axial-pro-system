const fs = require('fs').promises;
const path = require('path');
const { DateTime } = require('luxon');
const crypto = require('crypto');
const zlib = require('zlib');
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const encryptionService = require('./encryption.service');

/**
 * Servicio de Backup y Restauración
 * Sistema profesional con backups incrementales, retención y compresión
 */

class BackupService {
  constructor() {
    this.baseDir = path.join(__dirname, '../data/backups');
    this.schedules = {
      daily: '0 2 * * *',      // 2 AM todos los días
      weekly: '0 3 * * 0',     // 3 AM domingos
      monthly: '0 4 1 * *'     // 4 AM primer día del mes
    };
    this.retention = {
      daily: 7,      // Mantener 7 días
      weekly: 4,     // Mantener 4 semanas
      monthly: 12    // Mantener 12 meses
    };
    this.compressionLevel = 9;
    this.initialize();
  }

  async initialize() {
    try {
      await this.createBackupStructure();
      await this.loadBackupManifest();
      this.startScheduling();
    } catch (error) {
      console.error('Error inicializando servicio de backup:', error);
    }
  }

  async createBackupStructure() {
    const dirs = [
      this.baseDir,
      path.join(this.baseDir, 'daily'),
      path.join(this.baseDir, 'weekly'),
      path.join(this.baseDir, 'monthly'),
      path.join(this.baseDir, 'incremental'),
      path.join(this.baseDir, 'temp'),
      path.join(this.baseDir, 'restores')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async loadBackupManifest() {
    const manifestPath = path.join(this.baseDir, 'manifest.json');

    try {
      const data = await fs.readFile(manifestPath, 'utf8');
      this.manifest = JSON.parse(data);
    } catch (error) {
      this.manifest = {
        backups: [],
        lastFullBackup: null,
        lastIncrementalBackup: null,
        statistics: {
          totalBackups: 0,
          totalSize: 0,
          lastBackupDate: null
        }
      };
      await this.saveManifest();
    }
  }

  async saveManifest() {
    const manifestPath = path.join(this.baseDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(this.manifest, null, 2));
  }

  /**
   * Crear backup completo
   */
  async createFullBackup(dataType, data, metadata = {}) {
    const backupId = crypto.randomUUID();
    const timestamp = DateTime.now();

    const backup = {
      id: backupId,
      type: 'full',
      dataType,
      timestamp: timestamp.toISO(),
      data: await this.prepareBackupData(data),
      metadata: {
        ...metadata,
        version: 1,
        compressionLevel: this.compressionLevel,
        checksum: null // Se calcula después
      },
      statistics: {
        size: 0,
        compressedSize: 0,
        compressionRatio: 0
      }
    };

    // Calcular checksum antes de comprimir
    const checksum = encryptionService.generateFingerprint(backup.data);
    backup.metadata.checksum = checksum;

    // Comprimir datos
    const compressed = await this.compressData(backup.data);
    backup.data = compressed.toString('base64');
    backup.statistics.compressedSize = compressed.length;
    backup.statistics.compressionRatio = ((backup.statistics.size - compressed.length) / backup.statistics.size * 100).toFixed(2);

    // Guardar backup
    const backupPath = this.getBackupPath(backup);
    await this.saveBackup(backupPath, backup);

    // Actualizar manifest
    this.manifest.backups.push(backup);
    this.manifest.lastFullBackup = backup.timestamp;
    this.manifest.statistics.totalBackups++;
    this.manifest.statistics.totalSize += backup.statistics.compressedSize;
    this.manifest.statistics.lastBackupDate = backup.timestamp;
    await this.saveManifest();

    return backup;
  }

  /**
   * Crear backup incremental
   */
  async createIncrementalBackup(dataType, data, changes, lastBackupId) {
    const backupId = crypto.randomUUID();
    const timestamp = DateTime.now();

    const backup = {
      id: backupId,
      type: 'incremental',
      dataType,
      timestamp: timestamp.toISO(),
      basedOn: lastBackupId,
      changes: await this.prepareBackupData(changes),
      metadata: {
        version: 1,
        incremental: true,
        checksum: null
      },
      statistics: {
        size: 0,
        compressedSize: 0
      }
    };

    // Calcular checksum
    const checksum = encryptionService.generateFingerprint(backup.changes);
    backup.metadata.checksum = checksum;

    // Comprimir cambios
    const compressed = await this.compressData(backup.changes);
    backup.changes = compressed.toString('base64');
    backup.statistics.compressedSize = compressed.length;

    // Guardar backup incremental
    const backupPath = path.join(this.baseDir, 'incremental', `${backupId}.json`);
    await this.saveBackup(backupPath, backup);

    // Actualizar manifest
    this.manifest.backups.push(backup);
    this.manifest.lastIncrementalBackup = backup.timestamp;
    this.manifest.statistics.totalBackups++;
    this.manifest.statistics.totalSize += backup.statistics.compressedSize;
    await this.saveManifest();

    return backup;
  }

  /**
   * Restaurar backup
   */
  async restoreBackup(backupId, targetPath = null) {
    const backup = this.findBackup(backupId);

    if (!backup) {
      throw new Error('Backup no encontrado');
    }

    try {
      let data;

      if (backup.type === 'full') {
        // Descomprimir datos
        const compressed = Buffer.from(backup.data, 'base64');
        const decompressed = await this.decompressData(compressed);
        data = JSON.parse(decompressed.toString());
      } else if (backup.type === 'incremental') {
        // Para incrementales, primero restaurar el backup base
        const baseBackup = this.findBackup(backup.basedOn);
        if (!baseBackup) {
          throw new Error('Backup base no encontrado');
        }

        const baseData = await this.restoreBackup(backup.basedOn);
        const compressedChanges = Buffer.from(backup.changes, 'base64');
        const decompressedChanges = await this.decompressData(compressedChanges);
        const changes = JSON.parse(decompressedChanges.toString());

        // Aplicar cambios
        data = this.applyChanges(baseData, changes);
      }

      // Verificar integridad
      if (!encryptionService.verifyFingerprint(
        backup.type === 'full' ? data : changes,
        backup.metadata.checksum
      )) {
        throw new Error('Checksum inválido - datos corruptos');
      }

      // Guardar en archivo si se especifica targetPath
      if (targetPath) {
        await fs.writeFile(targetPath, JSON.stringify(data, null, 2));
      }

      return data;
    } catch (error) {
      throw new Error(`Error restaurando backup: ${error.message}`);
    }
  }

  /**
   * Preparar datos para backup
   */
  async prepareBackupData(data) {
    // Si es un archivo, leer contenido
    if (typeof data === 'string' && await this.fileExists(data)) {
      return await fs.readFile(data, 'utf8');
    }

    // Si es un objeto, convertir a JSON
    if (typeof data === 'object') {
      return JSON.stringify(data);
    }

    return data;
  }

  /**
   * Comprimir datos
   */
  async compressData(data) {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    return await gzip(buffer, { level: this.compressionLevel });
  }

  /**
   * Descomprimir datos
   */
  async decompressData(compressed) {
    return await gunzip(compressed);
  }

  /**
   * Guardar backup en disco
   */
  async saveBackup(backupPath, backup) {
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
  }

  /**
   * Obtener ruta de backup según tipo
   */
  getBackupPath(backup) {
    const timestamp = DateTime.fromISO(backup.timestamp);

    if (backup.type === 'full') {
      // Determinar si es daily, weekly o monthly
      const dayOfWeek = timestamp.weekday;
      const dayOfMonth = timestamp.day;

      let subDir = 'daily';
      if (dayOfMonth === 1) {
        subDir = 'monthly';
      } else if (dayOfWeek === 7) { // Domingo
        subDir = 'weekly';
      }

      return path.join(this.baseDir, subDir, `${backup.id}.json`);
    }

    return path.join(this.baseDir, 'incremental', `${backup.id}.json`);
  }

  /**
   * Buscar backup por ID
   */
  findBackup(backupId) {
    return this.manifest.backups.find(b => b.id === backupId);
  }

  /**
   * Aplicar cambios incrementales a datos base
   */
  applyChanges(baseData, changes) {
    if (Array.isArray(changes)) {
      return changes;
    }

    return {
      ...baseData,
      ...changes
    };
  }

  /**
   * Limpiar backups antiguos
   */
  async cleanupOldBackups() {
    const now = DateTime.now();
    const cutoffDate = now.minus({ days: this.retention.daily });

    // Limpiar backups diarios antiguos
    const dailyDir = path.join(this.baseDir, 'daily');
    const dailyFiles = await fs.readdir(dailyDir);

    for (const file of dailyFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(dailyDir, file);
        const stats = await fs.stat(filePath);
        const fileDate = DateTime.fromJSDate(stats.mtime);

        if (fileDate < cutoffDate) {
          await fs.unlink(filePath);
        }
      }
    }

    // Limpiar backups incrementales antiguos (más de 30 días)
    const incrementalDir = path.join(this.baseDir, 'incremental');
    const incrementalFiles = await fs.readdir(incrementalDir);
    const incrementalCutoff = now.minus({ days: 30 });

    for (const file of incrementalFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(incrementalDir, file);
        const stats = await fs.stat(filePath);
        const fileDate = DateTime.fromJSDate(stats.mtime);

        if (fileDate < incrementalCutoff) {
          await fs.unlink(filePath);
        }
      }
    }

    // Actualizar manifest
    this.manifest.backups = this.manifest.backups.filter(backup => {
      const backupDate = DateTime.fromISO(backup.timestamp);
      return backupDate > cutoffDate;
    });

    await this.saveManifest();
  }

  /**
   * Iniciar programación automática de backups
   */
  startScheduling() {
    // Implementación de scheduling con node-cron
    // Por ahora, solo log
    console.log('Sistema de backup iniciado');
    console.log('Backups completos: Daily (2 AM), Weekly (Sunday 3 AM), Monthly (1st 4 AM)');
  }

  /**
   * Obtener estadísticas de backup
   */
  async getBackupStatistics() {
    return {
      totalBackups: this.manifest.statistics.totalBackups,
      totalSize: this.manifest.statistics.totalSize,
      lastBackup: this.manifest.statistics.lastBackupDate,
      lastFullBackup: this.manifest.lastFullBackup,
      lastIncrementalBackup: this.manifest.lastIncrementalBackup,
      retentionPolicies: this.retention,
      nextScheduledBackups: this.getNextScheduledBackups()
    };
  }

  /**
   * Obtener próximos backups programados
   */
  getNextScheduledBackups() {
    const now = DateTime.now();

    return {
      daily: now.plus({ days: 1 }).set({ hour: 2, minute: 0, second: 0 }).toISO(),
      weekly: this.getNextWeekdayDate(7, 3).toISO(), // Próximo domingo a las 3 AM
      monthly: this.getNextMonthFirstDay(4).toISO() // Primer día del próximo mes a las 4 AM
    };
  }

  /**
   * Obtener fecha del próximo día de la semana
   */
  getNextWeekdayDate(weekday, hour) {
    const date = DateTime.now();
    let nextDate = date.set({ hour, minute: 0, second: 0 });

    while (nextDate.weekday !== weekday) {
      nextDate = nextDate.plus({ days: 1 });
    }

    if (nextDate <= date) {
      nextDate = nextDate.plus({ weeks: 1 });
    }

    return nextDate;
  }

  /**
   * Obtener fecha del primer día del próximo mes
   */
  getNextMonthFirstDay(hour) {
    const now = DateTime.now();
    return now.plus({ months: 1 }).set({ day: 1, hour, minute: 0, second: 0 });
  }

  /**
   * Verificar si archivo existe
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clonar backup
   */
  async cloneBackup(backupId, newDataType = null) {
    const originalBackup = this.findBackup(backupId);

    if (!originalBackup) {
      throw new Error('Backup original no encontrado');
    }

    const clonedBackup = {
      ...originalBackup,
      id: crypto.randomUUID(),
      dataType: newDataType || originalBackup.dataType,
      timestamp: DateTime.now().toISO(),
      clonedFrom: backupId
    };

    const backupPath = this.getBackupPath(clonedBackup);
    await this.saveBackup(backupPath, clonedBackup);

    this.manifest.backups.push(clonedBackup);
    await this.saveManifest();

    return clonedBackup;
  }

  /**
   * Exportar backup
   */
  async exportBackup(backupId, exportPath) {
    const backup = this.findBackup(backupId);

    if (!backup) {
      throw new Error('Backup no encontrado');
    }

    const exportData = {
      backup,
      exportedAt: DateTime.now().toISO(),
      exportFormat: 'JSON'
    };

    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    return exportPath;
  }

  /**
   * Importar backup
   */
  async importBackup(importPath) {
    const importData = JSON.parse(await fs.readFile(importPath, 'utf8'));

    if (!importData.backup) {
      throw new Error('Formato de importación inválido');
    }

    const backup = importData.backup;

    // Generar nuevo ID para evitar conflictos
    backup.id = crypto.randomUUID();
    backup.importedAt = DateTime.now().toISO();

    const backupPath = this.getBackupPath(backup);
    await this.saveBackup(backupPath, backup);

    this.manifest.backups.push(backup);
    await this.saveManifest();

    return backup;
  }

  /**
   * Verificar integridad de todos los backups
   */
  async verifyAllBackups() {
    const results = [];

    for (const backup of this.manifest.backups) {
      try {
        const backupPath = this.getBackupPath(backup);
        const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));

        const isValid = encryptionService.verifyFingerprint(
          backup.type === 'full' ? backupData.data : backupData.changes,
          backup.metadata.checksum
        );

        results.push({
          backupId: backup.id,
          valid: isValid,
          timestamp: backup.timestamp
        });
      } catch (error) {
        results.push({
          backupId: backup.id,
          valid: false,
          error: error.message
        });
      }
    }

    return {
      total: results.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
      details: results
    };
  }
}

// Singleton instance
const backupService = new BackupService();

module.exports = backupService;