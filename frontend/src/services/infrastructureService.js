/**
 * Servicio de Infraestructura - FASE 5
 * Conexión real con los servicios del backend
 */

import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Analytics Service
 */
export const analyticsService = {
  async getMetrics() {
    const response = await fetch(`${API_BASE_URL}/api/analytics/metrics/realtime`);
    return response.json();
  },

  async getReport(type = 'daily', days = 7) {
    const response = await fetch(`${API_BASE_URL}/api/analytics/report/${type}?days=${days}`);
    return response.json();
  },

  async trackUser(userId, role, action = 'login') {
    const response = await fetch(`${API_BASE_URL}/api/analytics/track/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role, action })
    });
    return response.json();
  },

  async trackFeature(feature, userId) {
    const response = await fetch(`${API_BASE_URL}/api/analytics/track/feature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature, userId })
    });
    return response.json();
  }
};

/**
 * A/B Testing Service
 */
export const abTestingService = {
  async getExperiments() {
    const response = await fetch(`${API_BASE_URL}/api/ab-testing/experiments`);
    return response.json();
  },

  async getExperiment(id) {
    const response = await fetch(`${API_BASE_URL}/api/ab-testing/experiments/${id}`);
    return response.json();
  },

  async createExperiment(data) {
    const response = await fetch(`${API_BASE_URL}/api/ab-testing/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getResults(id) {
    const response = await fetch(`${API_BASE_URL}/api/ab-testing/experiments/${id}/results`);
    return response.json();
  },

  async getAssignment(userId, experimentId) {
    const response = await fetch(`${API_BASE_URL}/api/ab-testing/assignment?userId=${userId}&experimentId=${experimentId}`);
    return response.json();
  },

  async trackEvent(userId, experimentId, event, data = {}) {
    const response = await fetch(`${API_BASE_URL}/api/ab-testing/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, experimentId, event, data })
    });
    return response.json();
  }
};

/**
 * WebSocket Service
 */
export const webSocketService = {
  getStatus() {
    return fetch(`${API_BASE_URL}/socketio/status`)
      .then(response => response.json());
  },

  connect() {
    return io(API_BASE_URL, {
      transports: ['websocket'],
      reconnection: true
    });
  }
};

/**
 * Deployment Service
 */
export const deploymentService = {
  async getDeployments() {
    const response = await fetch(`${API_BASE_URL}/api/deployment/deployments`);
    return response.json();
  },

  async getDeployment(id) {
    const response = await fetch(`${API_BASE_URL}/api/deployment/deployments/${id}`);
    return response.json();
  },

  async createDeployment(data) {
    const response = await fetch(`${API_BASE_URL}/api/deployment/deployments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async startDeployment(id) {
    const response = await fetch(`${API_BASE_URL}/api/deployment/deployments/${id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  async getHistory() {
    const response = await fetch(`${API_BASE_URL}/api/deployment/history?limit=10`);
    return response.json();
  },

  async getStrategies() {
    const response = await fetch(`${API_BASE_URL}/api/deployment/strategies`);
    return response.json();
  }
};

/**
 * CDN Service
 */
export const cdnService = {
  async getAssets() {
    const response = await fetch(`${API_BASE_URL}/api/cdn/assets`);
    return response.json();
  },

  async getAsset(id) {
    const response = await fetch(`${API_BASE_URL}/api/cdn/assets/${id}`);
    return response.json();
  },

  async getStats() {
    const response = await fetch(`${API_BASE_URL}/api/cdn/stats`);
    return response.json();
  },

  async getConfig() {
    const response = await fetch(`${API_BASE_URL}/api/cdn/config`);
    return response.json();
  },

  async uploadFile(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    if (options.name) formData.append('name', options.name);
    if (options.type) formData.append('type', options.type);
    if (options.environment) formData.append('environment', options.environment);
    if (options.autoPurge !== undefined) formData.append('autoPurge', options.autoPurge);
    if (options.tags) formData.append('tags', options.tags.join(','));

    const response = await fetch(`${API_BASE_URL}/api/cdn/upload`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  async purgeCache(assetId, patterns = []) {
    const response = await fetch(`${API_BASE_URL}/api/cdn/purge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId, patterns })
    });
    return response.json();
  }
};

/**
 * Service combinado para obtener todas las métricas
 */
export const infrastructureService = {
  async getAllMetrics() {
    try {
      const [analytics, wsStatus, deployments, cdnStats, abTesting] = await Promise.all([
        analyticsService.getMetrics(),
        webSocketService.getStatus(),
        deploymentService.getHistory(),
        cdnService.getStats(),
        abTestingService.getExperiments()
      ]);

      return {
        analytics: analytics.data,
        websocket: wsStatus,
        deployments: deployments.data,
        cdn: cdnStats.data,
        abTesting: abTesting.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching infrastructure metrics:', error);
      throw error;
    }
  }
};