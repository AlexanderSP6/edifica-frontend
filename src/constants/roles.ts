/**
 * Constantes de roles del sistema EDIFICA
 * 
 * IMPORTANTE: Estos valores DEBEN coincidir con:
 * - Backend: config/roles.php
 * - Base de datos: tabla roles
 */

export const ROLES = {
  ADMIN: 'ADMINISTRADOR',
  PROJECT_MANAGER: 'GESTOR DE PROYECTOS',
  ASSISTANT: 'COLABORADOR',
} as const;

export const ROLE_IDS = {
  ADMIN: 1,
  PROJECT_MANAGER: 2,
  ASSISTANT: 3,
} as const;

/**
 * Descripciones para UI
 */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  [ROLES.ADMIN]: 'Acceso total al sistema',
  [ROLES.PROJECT_MANAGER]: 'Gestión de presupuestos y proyectos propios',
  [ROLES.ASSISTANT]: 'Acceso de solo lectura y generación de reportes',
};

/**
 * Colores para Chips (Material-UI)
 */
export const ROLE_COLORS: Record<string, 'error' | 'primary' | 'success' | 'default'> = {
  [ROLES.ADMIN]: 'error',
  [ROLES.PROJECT_MANAGER]: 'primary',
  [ROLES.ASSISTANT]: 'success',
};

/**
 * Type helper para TypeScript
 */
export type RoleName = typeof ROLES[keyof typeof ROLES];