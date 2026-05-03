// Componentes UI Base - Export Centralizado
// Este archivo centraliza todos los componentes UI reutilizables del sistema

export { default as Button } from './Button';
export { default as Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from './Modal';
export { default as Skeleton, SkeletonText, SkeletonCard, SkeletonList, SkeletonAvatar, SkeletonTable, SkeletonDashboard } from './Skeleton';
export { default as Badge, StatusBadge, CountBadge } from './Badge';

// Configuraciones y constantes para componentes UI
export const buttonVariants = ['primary', 'secondary', 'success', 'danger', 'ghost', 'outline'];
export const buttonSizes = ['xs', 'sm', 'md', 'lg', 'xl'];
export const cardVariants = ['default', 'primary', 'success', 'warning', 'danger'];
export const badgeVariants = ['default', 'primary', 'success', 'warning', 'danger', 'info', 'outline'];
export const badgeSizes = ['xs', 'sm', 'md', 'lg'];
export const modalSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'];

// Utilidades para componentes UI
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};