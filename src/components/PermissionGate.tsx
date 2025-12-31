import React from 'react';
import { useAuth } from '../auth/AuthContext';

/**
 * Componente para renderizado condicional basado en permisos
 */

interface PermissionGateProps {
  /** Contenido a mostrar si tiene permiso */
  children: React.ReactNode;
  
  /** Permiso único requerido */
  permission?: string;
  
  /** Lista de permisos*/
  permissions?: string[];
  
  /** Si es true, requiere TODOS los permisos. Si es false, requiere al MENOS UNO */
  requireAll?: boolean;
  
  /** Contenido a mostrar si NO tiene permiso */
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let hasAccess = false;

  // CASO 1: Permiso único
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  // CASO 2: Lista de permisos
  else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  }
  // CASO 3: No se especificó permiso
  else {
    hasAccess = true;
  }
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export default PermissionGate;