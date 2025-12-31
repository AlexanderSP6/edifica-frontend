import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Email, Visibility, VisibilityOff, Engineering, Lock } from '@mui/icons-material';
import { styled } from '@mui/system';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { login as loginService } from '../services/authService';
import { useAuth } from '../auth/AuthContext';

// ==========================================
// STYLED COMPONENTS
// ==========================================

const LoginContainer = styled(Box)({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  overflow: 'hidden',
});

const ImageSection = styled(Box)(({ theme }) => ({
  flex: '0 0 50%',
  position: 'relative',
  backgroundImage: 'url(/assets/images/building-login.jpg)',
  backgroundSize: '100%',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.7) 0%, rgba(64, 64, 64, 0.5) 100%)',
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const LogoOverlay = styled(Box)({
  position: 'absolute',
  top: '32px',
  left: '32px',
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#fff',
});

const FormSection = styled(Box)(({ theme }) => ({
  flex: '0 0 50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#ffffff',
  padding: '48px 24px',
  [theme.breakpoints.down('md')]: {
    flex: '1',
    backgroundImage:
      'linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/assets/images/building-login.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
}));

const FormCard = styled(Box)({
  width: '100%',
  maxWidth: '420px',
  animation: 'fadeIn 0.6s ease-in-out',
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#ff6b35',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ff6b35',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#ff6b35',
  },
});

const PasswordTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#ff6b35',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ff6b35',
      borderWidth: '2px',
    },
    '& input[type="password"]::-ms-reveal': {
      display: 'none',
    },
    '& input[type="password"]::-ms-clear': {
      display: 'none',
    },
    '& input[type="password"]::-webkit-credentials-auto-fill-button': {
      visibility: 'hidden',
      position: 'absolute',
      right: 0,
    },
    '& input[type="password"]::-webkit-textfield-decoration-container': {
      visibility: 'hidden',
      pointerEvents: 'none',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#ff6b35',
  },
});

const LoginButton = styled(Button)({
  backgroundColor: '#ff6b35',
  color: '#fff',
  height: '48px',
  borderRadius: '24px',
  fontWeight: 600,
  fontSize: '15px',
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#e85a28',
    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});

// ==========================================
// COMPONENTE
// ==========================================

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ==========================================
  // FORMIK
  // ==========================================

  const formik = useFormik({
    initialValues: { 
      email: '', 
      password: '' 
    },
    
    validationSchema: Yup.object({
      email: Yup.string()
        .matches(
          /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 
          'Correo electrónico no válido'
        )
        .required('El correo electrónico es obligatorio'),
      password: Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .required('La contraseña es obligatoria'),
    }),

    onSubmit: async (values) => {
      try {
        // ==========================================
        // LLAMAR AL SERVICIO DE LOGIN
        // ==========================================
        const response = await loginService(values.email, values.password);

        const { access_token, user, expires_in } = response.data;

        // ==========================================
        // VALIDAR QUE TENGA PERMISOS
        // ==========================================
        if (!user.permisos || user.permisos.length === 0) {
          alert(
            'Error: Usuario sin permisos asignados.\n\n' +
            'Contacta al administrador del sistema.'
          );
          return;
        }
        // ==========================================
        // GUARDAR EN AUTHCONTEXT
        // ==========================================
        login(access_token, user, expires_in, false);

        // ==========================================
        // NAVEGAR A DASHBOARD
        // ==========================================
        navigate('/presupuestos', { replace: true });

      } catch (err: any) {
        console.error('Error en login:', err);

        // ==========================================
        // MANEJO DE ERRORES
        // ==========================================
        if (err.response?.status === 401) {
          alert(
            'Credenciales incorrectas.\n\n' +
            'Verifica tu correo electrónico y contraseña e inténtalo nuevamente.'
          );
        } else if (err.response?.status === 403) {
          alert(
            'Tu cuenta está desactivada.\n\n' +
            'Contacta al administrador para más información.'
          );
        } else if (err.response?.status >= 500) {
          alert(
            'Error del servidor.\n\n' +
            'Por favor, intenta nuevamente en unos momentos.'
          );
        } else {
          // Usar el mensaje mejorado del servicio si existe
          const errorMessage = err.message || 'Error al iniciar sesión';
          alert(errorMessage);
        }
      }
    },
  });

  // ==========================================
  // EFECTOS
  // ==========================================

  useEffect(() => {
    const token = Cookies.get('token');
    const forceChange = Cookies.get('force_password_change');

    if (token && !forceChange) {
      navigate('/presupuestos');
    }
  }, [navigate]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <LoginContainer>
      {/* ========================================== */}
      {/* SECCIÓN IMAGEN */}
      {/* ========================================== */}
      <ImageSection>
        <LogoOverlay>
          <Engineering sx={{ fontSize: 36, color: '#ff6b35' }} />
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff', lineHeight: 1 }}>
              EDIFICA
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Gestión de Construcción
            </Typography>
          </Box>
        </LogoOverlay>
      </ImageSection>

      {/* ========================================== */}
      {/* SECCIÓN FORMULARIO */}
      {/* ========================================== */}
      <FormSection>
        <FormCard>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                mb: 2,
              }}
            >
              <Engineering sx={{ fontSize: 36, color: '#ff6b35' }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="#1a1a1a" gutterBottom>
              Bienvenido a EDIFICA
            </Typography>
            <Typography variant="body2" color="#666" sx={{ maxWidth: '320px', mx: 'auto' }}>
              Sistema de gestión de presupuestos de construcción
            </Typography>
          </Box>

          {/* Formulario */}
          <form 
            onSubmit={formik.handleSubmit}
            autoComplete="on"
            noValidate
          >
            {/* ========================================== */}
            {/* EMAIL */}
            {/* ========================================== */}
            <Box mb={2}>
              <StyledTextField
                fullWidth
                label="Correo electrónico"
                name="email"
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                inputProps={{
                  autoCapitalize: 'none',
                  autoCorrect: 'off',
                  spellCheck: 'false',
                }}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#999' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* ========================================== */}
            {/* PASSWORD */}
            {/* ========================================== */}
            <Box mb={3}>
              <PasswordTextField
                fullWidth
                label="Contraseña"
                name="password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#999' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ color: '#999' }} />
                        ) : (
                          <Visibility sx={{ color: '#999' }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* ========================================== */}
            {/* BOTÓN LOGIN */}
            {/* ========================================== */}
            <LoginButton type="submit" fullWidth disabled={formik.isSubmitting}>
              {formik.isSubmitting ? (
                <CircularProgress size={24} sx={{ color: '#fff' }} />
              ) : (
                'Ingresar'
              )}
            </LoginButton>
          </form>

          {/* Footer */}
          <Box mt={4} textAlign="center">
            <Typography variant="caption" color="#999">
              Términos de uso · Política de privacidad
            </Typography>
          </Box>
        </FormCard>
      </FormSection>
    </LoginContainer>
  );
};

export default Login;