import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LockIcon from '@mui/icons-material/Lock';

interface NotFoundProps {
  /** Tipo de error: '404' para página no encontrada, 'forbidden' para sin permisos */
  type?: '404' | 'forbidden';
}

const NotFound: React.FC<NotFoundProps> = ({ type }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Detectar automáticamente si es sin permisos
  const isForbidden = type === 'forbidden' || location.pathname === '/sin-permisos';

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/presupuestos');
    } else {
      navigate('/login');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // ==========================================
  // CONTENIDO SEGÚN TIPO DE ERROR
  // ==========================================

  const content = isForbidden ? {
    icon: <LockIcon sx={{ fontSize: 120, color: '#ff6b35' }} />,
    code: '403',
    title: 'Acceso Denegado',
    description: 'No tienes los permisos necesarios para acceder a esta página.',
    suggestion: 'Si crees que esto es un error, contacta al administrador del sistema.',
    color: '#ff6b35', // Naranja más rojizo para forbidden
  } : {
    icon: <ErrorOutlineIcon sx={{ fontSize: 120, color: '#ff9800' }} />,
    code: '404',
    title: 'Página no encontrada',
    description: 'La ruta que estás buscando no existe o ha sido movida.',
    suggestion: 'Verifica la URL o regresa al inicio.',
    color: '#ff9800', // Naranja original para 404
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#191c1f',
        color: '#FAFBFC',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
      {/* Icono */}
      <Box sx={{ mb: 3 }}>
        {content.icon}
      </Box>

      {/* Código de error */}
      <Typography 
        variant="h1" 
        sx={{ 
          color: content.color, 
          fontWeight: 'bold',
          fontSize: { xs: '4rem', md: '6rem' }
        }}
      >
        {content.code}
      </Typography>

      {/* Título */}
      <Typography 
        variant="h4" 
        sx={{ 
          mt: 2,
          fontWeight: 600,
          fontSize: { xs: '1.5rem', md: '2rem' }
        }}
      >
        {content.title}
      </Typography>

      {/* Descripción */}
      <Typography 
        variant="body1" 
        sx={{ 
          mt: 2,
          maxWidth: 500,
          color: '#b0b0b0',
          fontSize: { xs: '0.95rem', md: '1rem' }
        }}
      >
        {content.description}
      </Typography>

      {/* Sugerencia */}
      <Typography 
        variant="body2" 
        sx={{ 
          mt: 1,
          mb: 4,
          color: '#808080',
          fontStyle: 'italic',
          fontSize: { xs: '0.85rem', md: '0.9rem' }
        }}
      >
        {content.suggestion}
      </Typography>

      {/* Botones */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Botón Volver Atrás */}
        {window.history.length > 1 && (
          <Button
            variant="outlined"
            sx={{
              borderColor: content.color,
              color: content.color,
              '&:hover': {
                borderColor: content.color,
                backgroundColor: `${content.color}15`,
              },
            }}
            onClick={handleGoBack}
          >
            Volver Atrás
          </Button>
        )}

        {/* Botón Inicio */}
        <Button
          variant="contained"
          sx={{
            backgroundColor: content.color,
            '&:hover': {
              backgroundColor: content.color,
              filter: 'brightness(1.1)',
            },
          }}
          onClick={handleGoHome}
        >
          Ir al Inicio
        </Button>
      </Box>
    </Box>
  );
};

export default NotFound;
