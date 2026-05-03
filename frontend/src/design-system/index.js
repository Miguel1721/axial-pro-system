/**
 * Design System Index - Solo Exports
 *
 * Solo exporta constantes sin crear objetos complejos
 * para evitar dependencias circulares durante el bundling
 */

// Re-exportar todas las constantes
export * from './tokens';

// No crear objetos complejos que causen circularidad
// Solo exports individuales para uso directo
