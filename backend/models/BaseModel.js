/**
 * MODELO BASE - ESTRUCTURA ESTÁNDAR PARA TODOS LOS MÓDULOS IA
 * Proporciona una interfaz consistente para todos los modelos del sistema
 */

const { Pool } = require('pg');

class BaseModel {
  constructor(tableName, databaseConfig = null) {
    this.tableName = tableName;
    this.pool = null;

    // Configurar pool de base de datos si se proporciona configuración
    if (databaseConfig) {
      this.pool = new Pool(databaseConfig);
    } else {
      // Configuración por defecto
      this.pool = new Pool({
        host: process.env.DB_HOST || 'db',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'axial_clinic_db',
        user: process.env.DB_USER || 'axial_admin',
        password: process.env.DB_PASSWORD || 'axial_password_123'
      });
    }
  }

  /**
   * Método genérico para obtener todos los registros
   */
  async findAll(options = {}) {
    try {
      const { limit = 100, offset = 0, orderBy = 'id', order = 'ASC' } = options;

      const query = `
        SELECT * FROM ${this.tableName}
        ORDER BY ${orderBy} ${order}
        LIMIT $1 OFFSET $2
      `;

      const result = await this.pool.query(query, [limit, offset]);
      return result.rows;
    } catch (error) {
      this.handleError('findAll', error);
      return [];
    }
  }

  /**
   * Método genérico para obtener un registro por ID
   */
  async findById(id) {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      this.handleError('findById', error);
      return null;
    }
  }

  /**
   * Método genérico para crear un registro
   */
  async create(data) {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

      const query = `
        INSERT INTO ${this.tableName} (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      this.handleError('create', error);
      return null;
    }
  }

  /**
   * Método genérico para actualizar un registro
   */
  async update(id, data) {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns.map((col, index) => `${col} = $${index + 2}`).join(', ');

      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE id = $1
        RETURNING *
      `;

      const result = await this.pool.query(query, [id, ...values]);
      return result.rows[0] || null;
    } catch (error) {
      this.handleError('update', error);
      return null;
    }
  }

  /**
   * Método genérico para eliminar un registro
   */
  async delete(id) {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
      const result = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      this.handleError('delete', error);
      return null;
    }
  }

  /**
   * Método genérico para contar registros
   */
  async count(options = {}) {
    try {
      const { where = {} } = options;
      let whereClause = '';
      const values = [];

      if (Object.keys(where).length > 0) {
        const conditions = Object.keys(where).map((key, index) => {
          values.push(where[key]);
          return `${key} = $${index + 1}`;
        }).join(' AND ');

        whereClause = `WHERE ${conditions}`;
      }

      const query = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
      const result = await this.pool.query(query, values);
      return parseInt(result.rows[0].count);
    } catch (error) {
      this.handleError('count', error);
      return 0;
    }
  }

  /**
   * Método para ejecutar queries personalizadas
   */
  async query(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error) {
      this.handleError('query', error);
      return [];
    }
  }

  /**
   * Manejo estandarizado de errores
   */
  handleError(method, error) {
    // Solo loggear errores reales, no los esperados
    if (error.code !== '23505') { // Violación de clave única es esperada a veces
      console.error(`[${this.constructor.name}.${method}] Error:`, {
        code: error.code,
        message: error.message,
        table: this.tableName
      });
    }
  }

  /**
   * Método para verificar conexión a la base de datos
   */
  async checkConnection() {
    try {
      const result = await this.pool.query('SELECT NOW()');
      return {
        success: true,
        timestamp: result.rows[0].now
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cerrar conexión al pool
   */
  async close() {
    try {
      await this.pool.end();
      return true;
    } catch (error) {
      console.error(`Error cerrando pool de ${this.tableName}:`, error);
      return false;
    }
  }
}

module.exports = BaseModel;