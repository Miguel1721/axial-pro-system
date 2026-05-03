/**
 * Rutas de CDN API
 * Endpoints para gestión de assets y distribución CDN
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const CDNService = require('../services/cdn.service');

// Inicializar servicio singleton
const cdnService = new CDNService();

// Configurar multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/cdn');
    fs.mkdir(uploadDir, { recursive: true })
      .then(() => cb(null, uploadDir))
      .catch(err => cb(err));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp|pdf|js|css|woff|woff2|ttf|eot/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos de imagen, documento y fuente'));
  }
});

/**
 * @route   POST /api/cdn/upload
 * @desc    Subir asset a CDN
 * @access  Private (Admin)
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó archivo'
      });
    }

    const { name, type, environment, autoPurge, tags } = req.body;

    const asset = await cdnService.uploadAsset(req.file.path, {
      name: name || req.file.originalname,
      type,
      environment: environment || 'production',
      autoPurge: autoPurge !== 'false',
      tags: tags ? tags.split(',') : []
    });

    res.json({
      success: true,
      data: asset,
      message: 'Asset subido exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/cdn/upload/multiple
 * @desc    Subir múltiples assets a CDN
 * @access  Private (Admin)
 */
router.post('/upload/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron archivos'
      });
    }

    const { environment, autoPurge } = req.body;

    const assets = await cdnService.uploadAssets(
      req.files.map(f => f.path),
      {
        environment: environment || 'production',
        autoPurge: autoPurge !== 'false'
      }
    );

    res.json({
      success: true,
      data: assets,
      message: `${assets.length} assets subidos exitosamente`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/cdn/assets
 * @desc    Obtener todos los assets
 * @access  Private (Admin)
 */
router.get('/assets', (req, res) => {
  try {
    const { type, environment, limit = 100 } = req.query;

    let assets = Array.from(cdnService.assets.values());

    // Filtrar por tipo
    if (type) {
      assets = assets.filter(a => a.type === type);
    }

    // Filtrar por environment
    if (environment) {
      assets = assets.filter(a => a.environment === environment);
    }

    // Limitar resultados
    assets = assets.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: assets,
      total: assets.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/cdn/assets/:id
 * @desc    Obtener asset específico
 * @access  Private
 */
router.get('/assets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const asset = cdnService.assets.get(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset no encontrado'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/cdn/purge
 * @desc    Invalidar caché de CDN
 * @access  Private (Admin)
 */
router.post('/purge', async (req, res) => {
  try {
    const { assetId, patterns } = req.body;

    if (assetId) {
      const asset = cdnService.assets.get(assetId);
      if (asset) {
        await cdnService.purgeCache(asset, patterns);
      }
    } else if (patterns && patterns.length > 0) {
      for (const pattern of patterns) {
        await cdnService.purgeCache({}, [pattern]);
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Se requiere assetId o patterns'
      });
    }

    res.json({
      success: true,
      message: 'Caché purgado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/cdn/optimize-images
 * @desc    Generar imágenes optimizadas
 * @access  Private (Admin)
 */
router.post('/optimize-images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó imagen'
      });
    }

    const { sizes, formats } = req.body;

    const optimizedImages = await cdnService.generateOptimizedImages(req.file.path, {
      sizes: sizes ? sizes.split(',').map(s => parseInt(s)) : undefined,
      formats: formats ? formats.split(',') : undefined
    });

    res.json({
      success: true,
      data: optimizedImages,
      message: 'Imágenes optimizadas generadas'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/cdn/distributions
 * @desc    Crear nueva distribución CDN
 * @access  Private (Admin)
 */
router.post('/distributions', async (req, res) => {
  try {
    const distributionData = req.body;

    // Validar datos requeridos
    const required = ['name', 'domains', 'origins'];
    const missing = required.filter(field => !distributionData[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Campos requeridos faltantes: ${missing.join(', ')}`
      });
    }

    const distribution = await cdnService.createDistribution(distributionData);

    res.json({
      success: true,
      data: distribution,
      message: 'Distribución creada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/cdn/distributions
 * @desc    Obtener todas las distribuciones
 * @access  Private (Admin)
 */
router.get('/distributions', (req, res) => {
  try {
    const distributions = Array.from(cdnService.distributions.values());

    res.json({
      success: true,
      data: distributions,
      total: distributions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/cdn/stats
 * @desc    Obtener estadísticas de CDN
 * @access  Private (Admin)
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await cdnService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/cdn/config
 * @desc    Obtener configuración de CDN
 * @access  Private (Admin)
 */
router.get('/config', async (req, res) => {
  try {
    const config = await cdnService.exportConfig();

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/cdn/health
 * @desc    Health check del servicio de CDN
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'cdn',
    status: 'operational',
    provider: cdnService.config.provider,
    assets: cdnService.assets.size,
    distributions: cdnService.distributions.size,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
module.exports.cdnService = cdnService;