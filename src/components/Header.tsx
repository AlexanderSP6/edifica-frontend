import React, { useState, useCallback, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Button,
  Chip,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Logout,
  AccountCircle,
  Shield,
  AdminPanelSettings,
  SupervisorAccount,
  PersonOutline,
  AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { logout as logoutService } from '../services/authService';


//  FUNCIONES DEL PERFIL DE USUARIO

const getInitials = (nombres?: string| null, appaterno?: string|null): string => {
  if (!nombres || !appaterno) return 'U';
  return `${nombres.charAt(0)}${appaterno.charAt(0)}`.toUpperCase();
};

const getRoleIcon = (roleName: string) => {
  if (roleName.includes('ADMIN')) return <AdminPanelSettings fontSize="small" />;
  if (roleName.includes('SUPERV')) return <SupervisorAccount fontSize="small" />;
  return <PersonOutline fontSize="small" />;
};

const getRoleColor = (roleName: string): 'primary' | 'default' | 'secondary' => {
  if (roleName.includes('ADMIN')) return 'primary';
  if (roleName.includes('SUPERV')) return 'secondary';
  return 'default';
};

const formatLastLogin = (lastLogin: string | null | undefined): string => {
  if (!lastLogin) return 'No disponible';
  
  try {
    const date = new Date(lastLogin);
    if (isNaN(date.getTime())) return 'Formato inválido';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-BO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
};
// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================
const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { user, logout } = useAuth();


  // HANDLERS
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNavigateToProfile = useCallback(() => {
    handleMenuClose();
    navigate('/Perfil');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
  try {
    setIsLoggingOut(true);
    handleMenuClose();
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 1. Llamar al backend para invalidar token
    try {
      await logoutService();
    } catch (backendError) {
      console.warn('Error al llamar al backend para logout:', backendError);
    }
    
    // 2. Limpiar estado local
    logout();
    
    // 3. Redirigir
    navigate('/login', { replace: true });
    
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    logout();
    navigate('/login', { replace: true });
  } finally {
    setIsLoggingOut(false);
  }
}, [logout, navigate, handleMenuClose]);

  // DATOS DEL USUARIO

    const userData = useMemo(() => {
    if (!user) {
      return {
        initials: 'U',
        fullName: 'Usuario',
        grade: 'Sin grado',
        email: 'No disponible',
        username: 'usuario',
        roles: [],
        lastLogin: 'No disponible'
      };
    }

    return {
      initials: getInitials(user.nombres, user.appaterno),
      fullName: `${user.nombres} ${user.appaterno} ${user.apmaterno || ''}`.trim(),
      grade: user.grado || 'Sin grado',
      email: user.email || 'No disponible',
      username: user.usuario || 'usuario',
      roles: user.roles?.filter(role => role.status === true) || [],
      lastLogin: formatLastLogin(user.last_login ?? undefined) 
    };
  }, [user]);

  if (!user) {
    return (
      <AppBar position="fixed" sx={{ zIndex: 1300, bgcolor: '#1a1a1a' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Shield sx={{ fontSize: 28, mr: 1.5, color: '#1976d2' }} />
            <Typography variant="h6" fontWeight="700">EDIFICA</Typography>
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: 1300, 
        bgcolor: '#1a1a1a',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
      }}
    >
      <Toolbar>
        {/* LOGO */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
              EDIFICA
            </Typography>
            <Typography variant="caption" sx={{ color: '#b0b0b0', fontSize: '0.7rem' }}>
              Sistema de Registro Presupuestario
            </Typography>
          </Box>
        </Box>

        {/* INFO USUARIO */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {userData.grade}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b0b0b0', fontSize: '0.75rem' }}>
              {userData.username}
            </Typography>
          </Box>
        </Box>

        {/* AVATAR */}
        <Avatar
          sx={{ 
            cursor: isLoggingOut ? 'wait' : 'pointer',
            width: 40,
            height: 40,
            bgcolor: '#1976d2',
            fontWeight: 700,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: isLoggingOut ? 'none' : 'scale(1.05)',
              bgcolor: '#1565c0',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
            },
            opacity: isLoggingOut ? 0.6 : 1
          }}
          onClick={isLoggingOut ? undefined : handleMenuOpen}
        >
          {isLoggingOut ? <CircularProgress size={20} sx={{ color: 'white' }} /> : userData.initials}
        </Avatar>

        {/* MENÚ DROPDOWN */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 8,
            sx: {
              width: 340,
              mt: 1.5,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }
          }}
        >
          {/* HEADER */}
          <Box sx={{ bgcolor: '#1a1a1a', color: 'white', p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: '#1976d2', fontSize: '1.5rem', fontWeight: 700 }}>
                {userData.initials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight="700" noWrap>
                  {userData.fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  {userData.grade}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={handleNavigateToProfile}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
                fontWeight: 600,
                textTransform: 'none',
                py: 1
              }}
            >
              Ver Perfil Completo
            </Button>
          </Box>

          {/* INFO */}
          <Box sx={{ p: 2 }}>
            {/* Email */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                CORREO ELECTRÓNICO
              </Typography>
              <Typography variant="body2" fontWeight="600" noWrap sx={{ mt: 0.5 }}>
                {userData.email}
              </Typography>
            </Box>

            {/* Roles */}
            {userData.roles.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
                  ROLES
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {userData.roles.map((role) => (
                    <Chip
                      key={role.idrol}
                      icon={getRoleIcon(role.rol)}
                      label={role.rol}
                      size="small"
                      color={getRoleColor(role.rol)}
                      sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Última conexión */}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="600">
                ÚLTIMA CONEXIÓN
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight="600">
                  {userData.lastLogin}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* ACCIONES */}
          <Box sx={{ p: 1 }}>
            <MenuItem
              onClick={handleNavigateToProfile}
              sx={{ borderRadius: 1, py: 1.5, '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' } }}
            >
              <ListItemIcon>
                <AccountCircle sx={{ color: '#1976d2' }} />
              </ListItemIcon>
              <ListItemText primary="Mi Cuenta" primaryTypographyProps={{ fontWeight: 600 }} />
            </MenuItem>

            <MenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              sx={{ borderRadius: 1, py: 1.5, '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' } }}
            >
              <ListItemIcon>
                {isLoggingOut ? (
                  <CircularProgress size={20} sx={{ color: '#d32f2f' }} />
                ) : (
                  <Logout sx={{ color: '#d32f2f' }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                primaryTypographyProps={{ fontWeight: 600, color: '#d32f2f' }}
              />
            </MenuItem>
          </Box>

          {/* FOOTER */}
          <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Ministerio de Defensa — Bolivia
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;