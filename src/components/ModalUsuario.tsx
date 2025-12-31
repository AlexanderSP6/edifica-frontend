import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Chip,    
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';

import { 
  Close as CloseIcon,
  CheckCircle,
  Cancel,
  Person,         
  Email,          
  AccountCircle,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { createUser, updateUser } from '../services/userService';
import { getRoles } from '../services/roleService';
import {
  sanitize,
  sanitizeAndTitleCase,
  sanitizeAndLowerCase,
  formatPhone,
  formatCI,
  formatOptional,
} from '../utils/textFormatter';
import PasswordField from './common/PasswordField';
import { isPasswordValid } from '../utils/passwordValidator';

interface Role {
  idrol: number;
  rol: string;
  status: boolean;
}

interface User {
  iduser: number;
  ci: string;
  grado: string;
  nombres: string;
  appaterno: string;
  apmaterno: string;
  email: string;
  celular: string;
  usuario: string;
  status: boolean;
  roles: Array<{ idrol: number; rol: string; status: boolean }>;
}

interface ModalUsuarioProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  userData?: User | null;
}


const getRolColor = (rol: string): "error" | "primary" | "success" | "default" => {
  switch (rol) {
    case 'ADMINISTRADOR':
      return 'error';
    case 'PREREGISTRO':
      return 'primary';
    case 'INVITACIONES':
      return 'success';
    default:
      return 'default';
  }
};


//REGEX DE VALIDACIÓN 

const reCI = /^\d{7,10}$/;                     // Solo números, 7-10 dígitos
const reGrado = /^[\p{L}. ]{3,30}$/u;          // Letras (con acentos) + punto + espacio
const reNombre = /^[\p{L} ]{3,50}$/u;          // Solo letras y espacios
const reApellido = /^[\p{L} ]{3,50}$/u;        // Solo letras y espacios
const reUsuario =  /^[a-z0-9_]{3,30}$/;        // Solo minúsculas + números + _
const reCelular = /^\+?\d{8,15}$/;             // opcional "+" , 8-15 dígitos
const reEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//FUNCIONES DE BLOQUEO DE TECLAS

const ALLOWED_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'];

const blockInvalidKey = (e: React.KeyboardEvent, pattern: RegExp) => {
  if (!pattern.test(e.key) && !ALLOWED_KEYS.includes(e.key) && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
  }
};

//ESQUEMA DE VALIDACIÓN YUP
const getValidationSchema = (mode: 'create' | 'edit') => {
  const baseSchema = {
    ci: Yup.string()
      .transform((v) => formatCI(sanitize(v)))  
      .required('El CI es requerido')
      .min(7, 'El CI debe tener al menos 7 dígitos')
      .max(10, 'El CI no puede exceder 10 dígitos')
      .matches(reCI, 'CI inválido (solo números, 7-10 dígitos)'),
    
    grado: Yup.string()
      .transform((v) => sanitizeAndTitleCase(v))
      .required('El grado es requerido')
      .min(3, 'El grado debe tener al menos 3 caracteres')
      .max(30, 'El grado no puede exceder 30 caracteres')
      .matches(reGrado, 'Grado inválido (solo letras, acentos, punto y espacio)'),
    
    nombres: Yup.string()
      .transform((v) => sanitizeAndTitleCase(v))
      .required('Los nombres son requeridos')
      .min(3, 'Los nombres deben tener al menos 3 caracteres')
      .max(50, 'Los nombres no pueden exceder 50 caracteres')
      .matches(reNombre, 'Solo se permiten letras y espacios'), 
    
    appaterno: Yup.string()
      .transform((v) => formatOptional(v, sanitizeAndTitleCase))
      .nullable()
      .test('min-length', 'El apellido paterno debe tener al menos 3 caracteres', (value) => {
        return !value || value.length >= 3;
      })
      .test('max-length', 'El apellido paterno no puede exceder 50 caracteres', (value) => {
        return !value || value.length <= 50;
      })
      .test('format', 'Solo se permiten letras y espacios', (value) => {
        return !value || reApellido.test(value);
      }),
    apmaterno: Yup.string()
      .transform((v) => formatOptional(v, sanitizeAndTitleCase))
      .nullable()
      .test('min-length', 'El apellido materno debe tener al menos 3 caracteres', (value) => {
        return !value || value.length >= 3;
      })
      .test('max-length', 'El apellido materno no puede exceder 50 caracteres', (value) => {
        return !value || value.length <= 50;
      })
      .test('format', 'Solo se permiten letras y espacios', (value) => {
        return !value || reApellido.test(value);
      }),
    email: Yup.string()
      .transform((v) => sanitizeAndLowerCase(v))
      .required('El email es requerido')
      .matches(reEmail, 'Formato de email inválido')
      .min(5, 'El email debe tener al menos 5 caracteres')
      .max(250, 'El email no puede exceder 250 caracteres'),
    
    celular: Yup.string()
      .transform((v) => formatOptional(v, (s) => formatPhone(sanitize(s))))  
      .nullable()
      .test('min-length', 'El celular debe tener al menos 8 dígitos', (value) => {
        if (!value) return true;
        const digitsOnly = value.replace(/\D/g, '');
        return digitsOnly.length >= 8;
      })
      .test('format', 'Celular inválido (formato: +59112345678 o 12345678)', (value) => {
        return !value || reCelular.test(value);
      }),
    usuario: Yup.string()
      .transform((v) => sanitizeAndLowerCase(v))  
      .required('El usuario es requerido')
      .min(3, 'El usuario debe tener al menos 3 caracteres')
      .max(30, 'El usuario no puede exceder 30 caracteres')
      .matches(reUsuario, 'Solo minúsculas, números y "_"'),
  };

  if (mode === 'create') {
    return Yup.object({
      ...baseSchema,
      password: Yup.string()
          .required('La contraseña es requerida')
          .min(8, 'Mínimo 8 caracteres')
          .max(250, 'Máximo 250 caracteres')
          .test(
            'password-strength',
            'Debe contener: mayúscula, minúscula, número y carácter especial (@$!%*?&#._-)',
            (value) => {
              if (!value) return false;
              return isPasswordValid(value); 
            }
          ),
      
      confirmPassword: Yup.string()
        .required('Debe confirmar la contraseña')
        .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir'),
      
      idrol: Yup.number()
        .required('Debe seleccionar un rol')
        .positive('Debe seleccionar un rol válido')
        .integer('El rol debe ser un número entero'),
    });
  }

  return Yup.object(baseSchema);
};

const ModalUsuario = ({ open, onClose, onSuccess, mode, userData }: ModalUsuarioProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'create') { 
        fetchRoles();
      }
      setSubmitError(null);
    }
  }, [open, mode]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await getRoles();
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const getInitialValues = () => {
    if (mode === 'edit' && userData) {
      return {
        ci: userData.ci,
        grado: userData.grado,
        nombres: userData.nombres,
        appaterno: userData.appaterno|| '',
        apmaterno: userData.apmaterno || '',
        email: userData.email,
        celular: userData.celular || '',
        usuario: userData.usuario,
      };
    }

    return {
      ci: '',
      grado: '',
      nombres: '',
      appaterno: '',
      apmaterno: '',
      email: '',
      celular: '',
      usuario: '',
      password: '',
      confirmPassword: '',
      idrol: 2,
      status: true,
    };
  };



  const handleSubmit = async (values: any, { setSubmitting, setFieldError, resetForm }: any) => {
    setSubmitError(null);
    try {
      if (mode === 'create') {
      // Yup ya formateó y sanitizó todos los campos
      const { confirmPassword, ...userData } = values;
      await createUser(userData);
    } else {
      // En modo edición, también usar valores ya formateados por Yup
      await updateUser(userData!.iduser, values);
    }
      
      // Limpiar formulario y contraseñas de memoria
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      setSubmitting(false);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          setFieldError(key, errors[key][0]);
        });
      } else {
        const action = mode === 'create' ? 'crear' : 'actualizar';
        setSubmitError(error.response?.data?.message || `Error al ${action} el usuario`);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '92vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        py: 2.5,
        px: 3,
      }}>
        <Typography variant="h5" component="div" fontWeight={600}>
          {mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Formik
        initialValues={getInitialValues()}
        validationSchema={getValidationSchema(mode)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
          <Form autoComplete="off">
            <DialogContent sx={{ pt: 3, px: 4 }}>
              {submitError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(211, 47, 47, 0.15)',
                    '& .MuiAlert-icon': {
                      fontSize: 24,
                    }
                  }}
                  onClose={() => setSubmitError(null)}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {submitError}
                  </Typography>
                </Alert>
              )}

              {/* ENCABEZADO INFORMATIVO EN MODO EDITAR */}
              {mode === 'edit' && userData && (
                <Box sx={{ 
                  mb: 3, 
                  p: 2.5, 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: 2,
                  border: '2px solid #e3f2fd',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                    Información del Usuario
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Estado
                      </Typography>
                      <Chip
                        label={userData.status ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={userData.status ? 'success' : 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Roles Asignados
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {userData.roles && userData.roles.length > 0 ? (
                          userData.roles.map((rol) => (
                            <Chip
                              key={rol.idrol}
                              label={rol.rol}
                              size="small"
                              variant="outlined"
                              color={getRolColor(rol.rol)}
                              sx={{ 
                                fontWeight: 600,
                                borderWidth: '1.5px',
                              }}

                            />
                          ))
                        ) : (
                          <Chip label="Sin rol" size="small" variant="outlined" />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* TÍTULO SECCIÓN: Información Personal */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600} 
                  color="#1976d2"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Person sx={{ fontSize: 20 }} />
                  Información Personal
                </Typography>
              </Box>

              {/* SECCIÓN: Información Personal */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="ci"
                    label="CI *"
                    placeholder="Ej: 8765493"
                    value={values.ci}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={(e) => blockInvalidKey(e, /\d/)}
                    error={touched.ci && Boolean(errors.ci)}
                    helperText={touched.ci && errors.ci}
                    inputProps={{ 
                      maxLength: 12,
                      inputMode: 'numeric',
                      pattern: '\\d{7,10}',
                    }}
                    autoComplete="nope"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="grado"
                    label="Grado *"
                    placeholder="Ej: Sgto., Cap., Tte."
                    value={values.grado}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.grado && Boolean(errors.grado)}
                    helperText={touched.grado && errors.grado}
                    inputProps={{ maxLength: 30 }}
                    autoComplete="nope"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    name="nombres"
                    label="Nombres *"
                    placeholder="Ingrese sus nombres completos"
                    value={values.nombres}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={(e) => blockInvalidKey(e, /[\p{L} ]/u)}
                    error={touched.nombres && Boolean(errors.nombres)}
                    helperText={touched.nombres && errors.nombres}
                    inputProps={{ maxLength: 50 }}
                    autoComplete="given-name"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="appaterno"
                    label="Apellido Paterno"
                    placeholder="Apellido Paterno"
                    value={values.appaterno}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={(e) => blockInvalidKey(e, /[\p{L} ]/u)}
                    error={touched.appaterno && Boolean(errors.appaterno)}
                    helperText={touched.appaterno && errors.appaterno}
                    inputProps={{ maxLength: 50 }}
                    autoComplete="family-name"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="apmaterno"
                    label="Apellido Materno"
                    placeholder="Apellido Materno"
                    value={values.apmaterno}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={(e) => blockInvalidKey(e, /[\p{L} ]/u)}
                    error={touched.apmaterno && Boolean(errors.apmaterno)}
                    helperText={touched.apmaterno && errors.apmaterno}
                    inputProps={{ maxLength: 50 }}
                    autoComplete="family-name"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ 
                my: 3, 
                borderColor: '#e0e0e0',
                '&::before, &::after': {
                  borderColor: '#e0e0e0',
                }
              }}>
                <Chip 
                  label="Información de Contacto" 
                  size="small"
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              </Divider>

              {/* TÍTULO SECCIÓN: Información de Contacto */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600} 
                  color="#1976d2"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Email sx={{ fontSize: 20 }} />
                  Datos de Contacto
                </Typography>
              </Box>

              {/* SECCIÓN: Información de Contacto */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="email"
                    label="Email *"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    inputProps={{ maxLength: 250 }}
                    autoComplete="email"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="celular"
                    label="Celular"
                    placeholder="Ej:77123456 (Opcional)"
                    value={values.celular}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={(e) => blockInvalidKey(e, /[\d+]/)}
                    error={touched.celular && Boolean(errors.celular)}
                    helperText={touched.celular && errors.celular}
                    inputProps={{ 
                      maxLength: 16,
                      inputMode: 'tel',
                      pattern: '\\+?\\d{8,15}',
                    }}
                    autoComplete="tel"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ 
                my: 3, 
                borderColor: '#e0e0e0',
                '&::before, &::after': {
                  borderColor: '#e0e0e0',
                }
              }}>
                <Chip 
                  label="Información de Acceso" 
                  size="small"
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              </Divider>

              {/* TÍTULO SECCIÓN: Información de Acceso */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600} 
                  color="#1976d2"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <AccountCircle sx={{ fontSize: 20 }} />
                  Credenciales de Acceso
                </Typography>
              </Box>

              {/* SECCIÓN: Información de Acceso */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={mode === 'edit' ? 12 : 6}>
                  <TextField
                    fullWidth
                    size="small"
                    name="usuario"
                    label="Usuario *"
                    placeholder="Ej: user_123"
                    value={values.usuario}
                    onChange={(e) => {
                    const lowercase = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setFieldValue('usuario', lowercase);
                    }}
                    onBlur={(e) => {
                      handleBlur(e);
                      setFieldValue('usuario', sanitizeAndLowerCase(e.target.value));
                    }}
                    error={touched.usuario && Boolean(errors.usuario)}
                    helperText={touched.usuario && errors.usuario}
                    inputProps={{ 
                      maxLength: 30,
                      pattern: '[a-z0-9_]{3,30}',
                    }}
                    autoComplete="username"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 2px 12px rgba(25, 118, 210, 0.25)',
                        },
                      },
                    }}
                  />
                </Grid>

                {mode === 'create' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Rol *</InputLabel>
                      <Select
                        name="idrol"
                        value={values.idrol}
                        label="Rol *"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.idrol && Boolean(errors.idrol)}
                        disabled={loadingRoles}
                        sx={{
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 2px 12px rgba(25, 118, 210, 0.25)',
                          },
                        }}
                      >
                        {roles.map((rol) => (
                          <MenuItem key={rol.idrol} value={rol.idrol}>
                            {rol.rol}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {/* CONTRASEÑAS: Solo para crear usuario */}
                {mode === 'create' && (
                  <>
                    <Grid item xs={12} sm={6}>
                     <PasswordField
                      name="password"
                      label="Contraseña"
                      showStrengthBar
                      showCriteria
                      required
                      placeholder="Ingrese contraseña segura"
                    />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                    <PasswordField
                      name="confirmPassword"
                      label="Confirmar Contraseña"
                      required
                      placeholder="Repita la contraseña"
                    />
                    </Grid>
                  </>
                )}

                {/* SWITCH DE ESTADO */}
                {mode === 'create' && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2.5,
                        background: values.status 
                          ? 'linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%)' 
                          : 'linear-gradient(135deg, #ffebee 0%, #fef5f5 100%)',
                        borderRadius: 2,
                        border: `2px solid ${values.status ? '#4caf50' : '#f44336'}`,
                        boxShadow: values.status 
                          ? '0 2px 8px rgba(76, 175, 80, 0.15)' 
                          : '0 2px 8px rgba(244, 67, 54, 0.15)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: values.status 
                            ? '0 4px 12px rgba(76, 175, 80, 0.25)' 
                            : '0 4px 12px rgba(244, 67, 54, 0.25)',
                          transform: 'translateY(-1px)',
                        }
                      }}
                      onClick={() => setFieldValue('status', !values.status)}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: values.status ? '#4caf50' : '#f44336',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        {values.status ? <CheckCircle /> : <Cancel />}
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={600} sx={{ color: values.status ? '#2e7d32' : '#c62828' }}>
                          {values.status ? 'Usuario Activo' : 'Usuario Inactivo'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: values.status ? '#558b2f' : '#d32f2f' }}>
                          {values.status 
                            ? 'El usuario podrá acceder al sistema' 
                            : 'El usuario no podrá iniciar sesión'}
                        </Typography>
                      </Box>

                      <Box
                        onClick={() => setFieldValue('status', !values.status)}
                        sx={{
                          width: 56,
                          height: 30,
                          borderRadius: 15,
                          backgroundColor: values.status ? '#4caf50' : '#bdbdbd',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease',
                          flexShrink: 0,
                          '&:hover': {
                            backgroundColor: values.status ? '#43a047' : '#9e9e9e',
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            position: 'absolute',
                            top: 3,
                            left: values.status ? 29 : 3,
                            transition: 'left 0.3s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                )} 
              </Grid>
            </DialogContent>

            <DialogActions sx={{ 
              px: 3, 
              py: 2.5, 
              borderTop: '1px solid #e0e0e0', 
              gap: 1.5,
              background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
            }}>
              <Button 
                onClick={onClose} 
                variant="outlined"
                disabled={isSubmitting}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  borderWidth: 2,
                  fontWeight: 600,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  }
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                sx={{ 
                  textTransform: 'none', 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {isSubmitting 
                  ? (mode === 'create' ? 'Guardando...' : 'Actualizando...') 
                  : (mode === 'create' ? 'Guardar Usuario' : 'Actualizar Usuario')
                }
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ModalUsuario;