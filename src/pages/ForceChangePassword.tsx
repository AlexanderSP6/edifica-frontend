import  { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  Container,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Shield,
  Celebration,
  Info,
  Login,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Cookies from 'js-cookie';
import PasswordField from '../components/common/PasswordField';
import { isPasswordValid } from '../utils/passwordValidator';
import { forceChangePassword } from '../services/authService';

const validationSchema = Yup.object({
  temporary_password: Yup.string()
    .required('Por favor, ingresa tu contraseña temporal'),
  
  new_password: Yup.string()
    .required('Por favor, crea tu nueva contraseña')
    .min(8, 'Tu contraseña debe tener al menos 8 caracteres')
    .max(250, 'Máximo 250 caracteres')
    .test(
      'password-strength',
      'Debe contener: mayúscula, minúscula, número y carácter especial (@$!%*?&#._-)',
      (value) => {
        if (!value) return false;
        return isPasswordValid(value); 
      }
    ),
  
  new_password_confirmation: Yup.string()
    .required('Confirma tu nueva contraseña')
    .oneOf([Yup.ref('new_password')], 'Las contraseñas no coinciden. Inténtalo de nuevo'),
});

const ForceChangePassword = () => {
  const navigate = useNavigate();
  const { user, logout, clearPasswordChangeFlag } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  

  useEffect(() => {
    const forceChange = Cookies.get('force_password_change');

    if (!forceChange || forceChange !== 'true') {

      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

 
  const handleSubmit = async (values: any, { setSubmitting,setFieldError}: any) => {
    setError('');

  try {
      setLoading(true);

      const response = await forceChangePassword(
      values.temporary_password,
      values.new_password,
      values.new_password_confirmation
    );      

      if (response.data.status) {
        setSuccess(true);
        clearPasswordChangeFlag();
      }
    } catch (err: any) {
    setSubmitting(false);

    if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        Object.keys(errors).forEach((key) => {
          setFieldError(key, errors[key][0]);
        });
      } else if (err.response?.status === 401) {
        // Verificar si es expiración de contraseña
        if (err.response?.data?.error ===   'password_expired') {
          setError(
            'Contraseña Temporal Expirada\n\n' +
            'Tu contraseña temporal ya no es válida. Por tu seguridad, debes contactar al administrador del sistema para obtener una nueva contraseña temporal.'
          );
      
          // Cerrar sesión automáticamente después de 3 segundos
          setTimeout(() => {
            logout();
            navigate('/login', {
              state: {
                message: 'Tu contraseña temporal expiró. Contacta al administrador.'
              }
            });
          }, 3000);
        } else {
          setFieldError('temporary_password', 'La contraseña temporal es incorrecta');
        }
      } else {
        setError(
          err.response?.data?.message || 
          'Hubo un problema. Por favor, verifica tus datos'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToLogin = () => {
    logout();
    navigate('/login', {
      state: { 
        message: 'Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.' 
      }
    });
  };



  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        p: 2
      }}
    >
      <Container maxWidth="md">
        <Card elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Header con gradiente */}
          <Box 
            sx={{ 
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              p: 4,
              textAlign: 'center',
              color: 'white'
            }}
          >
            <Shield sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Protege tu Cuenta
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>
              Solo tomará un minuto crear tu contraseña personal
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Stepper de progreso */}
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={success ? 1 : 0} alternativeLabel>
                <Step>
                  <StepLabel>Crear Contraseña</StepLabel>
                </Step>
                <Step>
                  <StepLabel>¡Listo!</StepLabel>
                </Step>
              </Stepper>
            </Box>

            {/* Alerta informativa */}
            {!success && (
              <Alert 
                severity="info" 
                icon={<Info />}
                sx={{ mb: 3, bgcolor: '#e3f2fd', color: '#0d47a1' }}
              >
                <Typography variant="body2" fontWeight="600" gutterBottom>
                  ¿Por qué debo cambiar mi contraseña?
                </Typography>
                <Typography variant="caption">
                  Tu administrador generó una contraseña temporal para ti. 
                  Por tu seguridad, <strong>solo tú</strong> debes conocer tu contraseña permanente.
                </Typography>
              </Alert>
            )}

            {/* Usuario actual */}
            {!success && user && (
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: '#f8f9fa', 
                  p: 2.5, 
                  borderRadius: 2,
                  mb: 3,
                  border: '2px solid #e0e0e0'
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.5rem'
                  }}
                >
                  {user?.nombres?.charAt(0) || 'U'}
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="#7f8c8d" fontWeight="600">
                    Bienvenido/a
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="#2c3e50">
                    {user?.nombres} {user?.appaterno}
                  </Typography>
                  <Chip 
                    label={`@${user?.usuario}`} 
                    size="small" 
                    sx={{ 
                      mt: 0.5,
                      bgcolor: '#e3f2fd',
                      color: '#1976d2',
                      fontWeight: 600
                    }} 
                  />
                </Box>
              </Box>
            )}

            {/* Alertas de error */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Alerta de éxito */}
            {success && (
            <Box>
              <Alert 
                severity="success" 
                icon={<Celebration />}
                sx={{ mb: 2, bgcolor: '#e8f5e9', color: '#2e7d32', border: '2px solid #4caf50' }}
              >
                <Typography variant="h6" fontWeight="700" gutterBottom>
                  ¡Perfecto! Tu cuenta está protegida 
                </Typography>
                <Typography variant="body2">
                  Tu contraseña ha sido actualizada exitosamente.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                  Por seguridad, inicia sesión nuevamente con tu nueva contraseña.
                </Typography>
              </Alert>

              {/* BOTÓN PARA IR AL LOGIN */}
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<Login />}
                    onClick={handleGoToLogin}
                    sx={{
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      color: 'white',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                      },
                      fontWeight: 700,
                      py: 1.8,
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Continuar al Login
                  </Button>

                  <Typography 
                    variant="caption" 
                    align="center" 
                    sx={{ color: '#7f8c8d', mt: 1 }}
                  >
                    Serás redirigido a la página de inicio de sesión
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Formulario */}
            {!success && (
              <Formik
                initialValues={{
                  temporary_password: '',
                  new_password: '',
                  new_password_confirmation: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Grid container spacing={3}>
                      {/* CONTRASEÑA TEMPORAL */}
                      <Grid item xs={12}>
                        <PasswordField
                          name="temporary_password"
                          label="Contraseña Temporal"
                          size="medium"
                          required
                          placeholder="La contraseña que recibiste de tu administrador"
                          autoComplete="current-password"
                          disabled={isSubmitting || loading}
                        />
                      </Grid>

                      {/* NUEVA CONTRASEÑA (con indicador completo) */}
                      <Grid item xs={12}>
                        <PasswordField
                          name="new_password"
                          label="Tu Nueva Contraseña"
                          size="medium"
                          showStrengthBar
                          showCriteria
                          required
                          placeholder="Crea una contraseña fuerte que solo tú conozcas"
                          autoComplete="new-password"
                          disabled={isSubmitting || loading}
                        />
                      </Grid>

                      {/*CONFIRMAR CONTRASEÑA */}
                      <Grid item xs={12}>
                        <PasswordField
                          name="new_password_confirmation"
                          label="Confirma tu Nueva Contraseña"
                          size="medium"
                          required
                          placeholder="Escribe tu contraseña nuevamente"
                          autoComplete="new-password"
                          disabled={isSubmitting || loading}
                        />
                      </Grid>

                {/* Botones */}
                <Grid item xs={12}>
                <Box mt={4} display="flex" gap={2} flexDirection="column">
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    fullWidth
                    startIcon={loading ? null : <Shield />}
                    sx={{
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      color: 'white',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)'
                      },
                      '&:disabled': { bgcolor: '#bdc3c7' },
                      fontWeight: 700,
                      py: 1.8,
                      fontSize: '1rem'
                    }}
                  >
                    {loading ? 'Guardando tu contraseña...' : 'Guardar mi Nueva Contraseña'}
                  </Button>

                  <Button
                    variant="text"
                    onClick={handleLogout}
                    disabled={loading}
                    fullWidth
                    sx={{
                      color: '#7f8c8d',
                      '&:hover': { 
                        bgcolor: '#ecf0f1'
                      }
                    }}
                  >
                    Cerrar Sesión
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
          )}
          </Formik>
         )}         
          </CardContent>
        </Card>

        {/* Footer */}
        <Box mt={3} textAlign="center">
          <Typography variant="caption" sx={{ color: 'white', opacity: 0.9 }}>
            Sistema de Registro Militar — Ministerio de Defensa
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ForceChangePassword;