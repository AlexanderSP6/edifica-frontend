import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Lock,
  CheckCircle,
  Person,
  Badge,
  Phone,
  Email,
  AccountCircle,
  Shield,
  Security,
  CalendarToday,
  AdminPanelSettings,
  SupervisorAccount,
  PersonOutline,
  Close, 
} from '@mui/icons-material';
import Grid from '@mui/material/GridLegacy';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { getProfile, UserProfile} from '../services/profileService';
import PasswordField from '../components/common/PasswordField';
import { isPasswordValid } from '../utils/passwordValidator';
import { changePassword } from '../services/authService';

const validationSchema = Yup.object({
  current_password: Yup.string()
    .required('Ingrese su contraseña actual'),
  
  new_password: Yup.string()
    .required('Ingrese la nueva contraseña')
    .min(8, 'Mínimo 8 caracteres')
    .max(250, 'Máximo 250 caracteres')
    .test(
      'password-strength',
      'Debe contener: mayúscula, minúscula, número y carácter especial',
      (value) => {
        if (!value) return false;
        return isPasswordValid(value);
      }
    )
    .test(
      'different-from-current',
      'La nueva contraseña debe ser diferente a la actual',
      function(value) {
        return value !== this.parent.current_password;
      }
    ),
  
  new_password_confirmation: Yup.string()
    .required('Confirme la nueva contraseña')
    .oneOf([Yup.ref('new_password')], 'Las contraseñas no coinciden'),
});



const Perfil = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [autoCloseTimeout, setAutoCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.data.status) {
        setProfile(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleCloseModal = () => {
    if (autoCloseTimeout) {
      clearTimeout(autoCloseTimeout);
      setAutoCloseTimeout(null);
    }
    setOpenModal(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  //Cerrar y recargar perfil
  const closeAndReload = async () => {
    if (autoCloseTimeout) {
      clearTimeout(autoCloseTimeout);
      setAutoCloseTimeout(null);
    }
    
    setLoading(true);
    handleCloseModal();
    await loadProfile();
    setLoading(false);
  };

  const handleSubmitPassword = async (
    values: any,
    { setSubmitting, resetForm, setFieldError }: any
  ) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await changePassword(
          values.current_password,
          values.new_password,
          values.new_password_confirmation
      );

      setSubmitSuccess(true);
      resetForm();

      const timeout = setTimeout(async () => {
        setLoading(true);
        handleCloseModal();
        await loadProfile();
        setLoading(false);
      }, 8000); 
      
      setAutoCloseTimeout(timeout);

    } catch (error: any) {
      setSubmitting(false);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          setFieldError(key, errors[key][0]);
        });
      } else if (error.response?.status === 401) {
        setFieldError('current_password', 'La contraseña actual es incorrecta');
      } else {
        setSubmitError(
          error.response?.data?.message ||
          'Error al cambiar contraseña. Intente nuevamente.'
        );
      }
    }
  };


  const getInitials = (nombres: string, appaterno: string) => {
    return `${nombres.charAt(0)}${appaterno.charAt(0)}`.toUpperCase();
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName.includes('ADMIN')) return <AdminPanelSettings />;
    if (roleName.includes('SUPERV')) return <SupervisorAccount />;
    return <PersonOutline />;
  };

  const getRoleColor = (roleName: string) => {
    if (roleName.includes('ADMIN')) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    if (roleName.includes('SUPERV')) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'No se pudo cargar el perfil'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header con Avatar */}

    <Card 
  elevation={0}
  sx={{ 
    background: 'linear-gradient(135deg, #73172D 0%, #A63C55 100%)',
    color: 'white',
    mb: 3,
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative'
  }}
>
  <CardContent sx={{ p: 4 }}>
    <Grid container spacing={3} alignItems="center">
      <Grid item>
        <Avatar 
          sx={{ 
            width: 100, 
            height: 100,
            bgcolor: 'rgba(255,255,255,0.3)',
            fontSize: '2.5rem',
            fontWeight: 700,
            border: '4px solid rgba(255,255,255,0.5)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}
        >
          {getInitials(profile.nombres, profile.appaterno)}
        </Avatar>
      </Grid>
      <Grid item xs>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Typography variant="h4" fontWeight="700">
             {profile.nombres} {profile.appaterno} {profile.apmaterno}
          </Typography>
          <Chip
            label="Activo"
            size="small"
            sx={{
              bgcolor: '#4caf50',
              color: 'white',
              fontWeight: 600,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.7 }
              }
            }}
          />
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
          <AccountCircle sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
          Usuario: <strong>{profile.usuario}</strong>
        </Typography>
        {profile.last_login && (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            <CalendarToday sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
            Última conexión: {new Date(profile.last_login).toLocaleString('es-BO')}
          </Typography>
        )}
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          size="large"
          startIcon={<Lock />}
          onClick={handleOpenModal}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            '&:hover': { 
              bgcolor: 'rgba(255,255,255,0.3)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
            },
            textTransform: 'none',
            px: 4,
            py: 1.5,
            fontWeight: 600,
            fontSize: '1rem',
            borderRadius: 2,
            transition: 'all 0.3s ease'
          }}
        >
          Cambiar Contraseña
        </Button>
      </Grid>
    </Grid>
  </CardContent>
    </Card>

      {/* Grid de Cards */}
      <Grid container spacing={3}>
        {/* Card 1: Información Personal */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              border: '1px solid #dbeafe',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box 
                  sx={{ 
                    bgcolor: '#e0e7ff', 
                    borderRadius: 2, 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Person sx={{ color: '#667eea', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" fontWeight="700" color="#1e293b">
                  Información Personal
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={2.5}>
                <Box>
                  <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 0.5, display: 'block' }}>
                    GRADO 
                  </Typography>
                  <Typography variant="body1" fontWeight="600" color="#1e293b">
                    {profile.grado}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>

                <Box>
                  <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 0.5, display: 'block' }}>
                    NOMBRES COMPLETOS
                  </Typography>
                  <Typography variant="body1" fontWeight="600" color="#1e293b">
                    {profile.nombres}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>

                <Box>
                  <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 0.5, display: 'block' }}>
                    APELLIDO PATERNO
                  </Typography>
                  <Typography variant="body1" fontWeight="600" color="#1e293b">
                    {profile.appaterno}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>

                <Box>
                  <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 0.5, display: 'block' }}>
                    APELLIDO MATERNO
                  </Typography>
                  <Typography variant="body1" fontWeight="600" color="#1e293b">
                    {profile.apmaterno || 'No registrado'}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>

                <Box>
                  <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Badge sx={{ fontSize: 16 }} /> CARNET DE IDENTIDAD
                  </Typography>
                  <Typography variant="body1" fontWeight="600" color="#1e293b">
                    {profile.ci}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Información de Contacto */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              border: '1px solid #e0e7ff',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box 
                  sx={{ 
                    bgcolor: '#dbeafe', 
                    borderRadius: 2, 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Email sx={{ color: '#3b82f6', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" fontWeight="700" color="#1e293b">
                  Información de Contacto
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={2.5}>
                <Box>
                  <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Email sx={{ fontSize: 16 }} /> CORREO ELECTRÓNICO
                  </Typography>
                  <Typography variant="body1" fontWeight="600" color="#1e293b">
                    {profile.email}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>

                <Box>
                  <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Phone sx={{ fontSize: 16 }} /> NÚMERO DE CELULAR
                  </Typography>
                  <Typography variant="body1" fontWeight="600" color="#1e293b">
                    {profile.celular || 'No registrado'}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Card 3: Cuenta y Roles */}
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              border: '1px solid #e0e7ff',
              mt: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box 
                  sx={{ 
                    bgcolor: '#fef3c7', 
                    borderRadius: 2, 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Shield sx={{ color: '#f59e0b', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" fontWeight="700" color="#1e293b">
                  Cuenta y Permisos
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={2.5}>
                <Box>
                  <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccountCircle sx={{ fontSize: 16 }} /> NOMBRE DE USUARIO
                  </Typography>
                  <Typography variant="body1" fontWeight="600" color="#1e293b">
                    {profile.usuario}
                  </Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>

                <Box>
                  <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Shield sx={{ fontSize: 16 }} /> ROLES ASIGNADOS
                  </Typography>
                  <Box display="flex" gap={1.5} flexWrap="wrap">
                    {profile.roles.map(role => (
                      <Chip 
                        key={role.idrol}
                        icon={getRoleIcon(role.rol)}
                        label={role.rol}
                        sx={{
                          background: getRoleColor(role.rol),
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          height: '36px',
                          px: 1.5,
                          border: '2px solid rgba(255,255,255,0.3)',
                          '& .MuiChip-icon': { color: 'white' },
                          '&:hover': { 
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4: Seguridad */}
        <Grid item xs={12}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              border: '1px solid #cfd8dc',
              background: 'linear-gradient(135deg, #eceff1 0%, #ffffff 100%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(96, 125, 139, 0.15)',
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box 
                  sx={{ 
                    bgcolor: '#eceff1', 
                    borderRadius: 2, 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Security sx={{ color: '#607D8B', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" fontWeight="700" color="#1e293b">
                  Seguridad de la Cuenta
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'white',
                      borderRadius: 2,
                      border: '2px solid #b0bec5',
                      textAlign: 'center'
                    }}
                  >
                    <Lock sx={{ fontSize: 48, color: '#607D8B', mb: 2 }} />
                    <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
                      ÚLTIMA ACTUALIZACIÓN DE CONTRASEÑA
                    </Typography>
                    <Typography variant="h5" fontWeight="700" color="#607D8B">
                      {profile.password_changed_at 
                        ? new Date(profile.password_changed_at).toLocaleDateString('es-BO', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'No registrado'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'white',
                      borderRadius: 2,
                      border: '2px solid #b0bec5',
                      textAlign: 'center'
                    }}
                  >
                    <CalendarToday sx={{ fontSize: 48, color: '#607D8B', mb: 2 }} />
                    <Typography variant="caption" color="#64748b" fontWeight="600" sx={{ mb: 1, display: 'block' }}>
                      ÚLTIMA SESIÓN INICIADA
                    </Typography>
                    <Typography variant="h5" fontWeight="700" color="#607D8B">
                      {profile.last_login 
                        ? new Date(profile.last_login).toLocaleDateString('es-BO', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'No registrado'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de Cambio de Contraseña  */}

<Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #73172D 0%, #A63C55 100%)',
            color: 'white',
            pb: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Lock />
            <Typography variant="h6" fontWeight="600">Cambiar Contraseña</Typography>
          </Box>
        </DialogTitle>
        
        <Formik
          initialValues={{
            current_password: '',
            new_password: '',
            new_password_confirmation: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmitPassword}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form>
              <DialogContent dividers sx={{ p: 3 }}>
                {submitError && (
                  <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
                    {submitError}
                  </Alert>
                )}
                
                {submitSuccess && (
                   <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3,
                      bgcolor: '#e8f5e9',
                      border: '2px solid #4caf50',
                    }} 
                    icon={<CheckCircle />}
                    action={
                      <Button 
                        color="inherit" 
                        size="small"
                        onClick={closeAndReload}
                        startIcon={<Close/>}
                        sx={{
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: 'rgba(46, 125, 50, 0.1)',
                          },
                        }}
                      >
                        Cerrar
                      </Button>
                    }
                  >
                    <Typography variant="body2" fontWeight="600">
                      ¡Contraseña actualizada correctamente!
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.9 }}>
                      Se cerrará automáticamente...
                    </Typography>
                  </Alert>
                )}

                <Box display="flex" flexDirection="column" gap={3}>
                  {/*CONTRASEÑA ACTUAL */}
                  <PasswordField
                    name="current_password"
                    label="Contraseña Actual"
                    size="medium"
                    required
                    placeholder="Ingrese su contraseña actual"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />

                  {/* NUEVA CONTRASEÑA  */}
                  <PasswordField
                    name="new_password"
                    label="Nueva Contraseña"
                    size="medium"
                    showStrengthBar
                    showCriteria
                    required
                    placeholder="Cree una contraseña segura"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />

                  {/* CONFIRMAR (sin indicador) */}
                  <PasswordField
                    name="new_password_confirmation"
                    label="Confirmar Nueva Contraseña"
                    size="medium"
                    required
                    placeholder="Repita la nueva contraseña"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                  />
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 2.5, bgcolor: '#f5f7fa' }}>
                <Button 
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  sx={{
                    color: '#64748b',
                    '&:hover': { bgcolor: '#e2e8f0' }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    background: 'linear-gradient(135deg, #73172D 0%, #A63C55 100%)',
                    color: 'white',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #5d1224 0%, #8a3044 100%)',
                    },
                    '&:disabled': { bgcolor: '#bdc3c7' },
                    px: 3,
                    fontWeight: 600
                  }}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Cambiar Contraseña'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default Perfil;