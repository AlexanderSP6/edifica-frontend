import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface PrivateRouteProps {
  children: JSX.Element;
  /** Permisos requeridos (al menos uno por defecto) */
  requiredPermissions?: string[];
  /** Si es true, requiere TODOS los permisos. Si es false, requiere AL MENOS UNO */
  requireAllPermissions?: boolean;
}

const PrivateRoute = ({ 
  children, 
  requiredPermissions,
  requireAllPermissions = false
}: PrivateRouteProps) => {
  const { 
    isLoading, 
    isAuthenticated, 
    requiresPasswordChange, 
    hasAnyPermission,
    hasAllPermissions,
  } = useAuth();
  
  const location = useLocation();

  // ==========================================
  // LOADING - Espera inicialización
  // ==========================================
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#191c1f',
        }}
      >
        <CircularProgress sx={{ color: '#4A90E2' }} />
      </Box>
    );
  }

  // ==========================================
  // NO AUTENTICADO
  // ==========================================
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ==========================================
  // Cambio de contraseña forzado
  // ==========================================
  if (requiresPasswordChange() && location.pathname !== '/force-change-password') {
    return <Navigate to="/force-change-password" replace />;
  }

  // ==========================================
  // Validación de permisos
  // ==========================================
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return <Navigate to="/sin-permisos" replace />;
    }
  }

  // ==========================================
  // ACCESO PERMITIDO
  // ==========================================
  return children;
};

export default PrivateRoute;