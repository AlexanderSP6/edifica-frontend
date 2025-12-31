import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { 
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { asignarRoles } from '../services/userService';
import { getRoles } from '../services/roleService';
import ConfirmDialog from './ConfirmDialog';

interface Role {
  idrol: number;
  rol: string;
  status: boolean;
}

interface User {
  iduser: number;
  ci: string;
  nombres: string;
  appaterno: string | null;
  apmaterno: string | null;
  usuario: string;
  roles: Array<{ idrol: number; rol: string; status: boolean }>;
}

interface ModalAsignarRolesProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

interface FormValues {
  selectedRoles: number[];
}
const roleDescriptions: Record<string, string> = {
  'ADMINISTRADOR': 'Acceso total al sistema',
  'ARQUITECTO': 'Acceso propio a presupuestos y proyectos',
  'ASISTENTE': 'Acceso limitado a tareas asignadas',
};

const validationSchema = Yup.object({
  selectedRoles: Yup.array()
    .min(1, 'Debe seleccionar al menos un rol')
    .required('Debe seleccionar al menos un rol'),
});

const ModalAsignarRoles = ({ open, onClose, onSuccess, user }: ModalAsignarRolesProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRoles, setPendingRoles] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchRoles();
      setSubmitError(null);
      setShowConfirmDialog(false);
    }
  }, [open]);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await getRoles();
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      setSubmitError('Error al cargar roles activos');
    } finally {
      setLoadingRoles(false);
    }
  };

  const getInitialRoles = () => {
    if (!user) return [];
    return user.roles.map(r => r.idrol);
  };

  const handleFormSubmit = (values: FormValues) => {
    const currentRoleIds = user?.roles.map(r => r.idrol) || [];
    // Convertir a Set para comparación más eficiente
    const currentSorted = [...currentRoleIds].sort().join(',');
    const selectedSorted = [...values.selectedRoles].sort().join(',');
    
    if (currentSorted === selectedSorted) {
      setSubmitError('No se detectaron cambios en los roles');
      return;
    }
    
    setPendingRoles(values.selectedRoles);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await asignarRoles(user.iduser, pendingRoles);
      setShowConfirmDialog(false);
      onSuccess();
      onClose();
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message || 'Error al asignar roles'
      );
      setShowConfirmDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog 
        open={open && !showConfirmDialog}
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AdminIcon />
            <Typography variant="h5" component="div" fontWeight={600}>
              Asignar Roles
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Formik
          initialValues={{
            selectedRoles: getInitialRoles(),
          }}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, setFieldValue }) => (
            <Form>
              <DialogContent sx={{ pt: 3, px: 4 }}>
                {submitError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {submitError}
                  </Alert>
                )}

                <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                  Usuario
                  </Typography>
                  <Typography variant="h6" color="text.primary" sx={{ mt: 0.5 }}>
                  {[
                    user.nombres,
                    user.appaterno,
                    user.apmaterno
                  ]
                  .filter(Boolean)
                  .join(' ')
                  .trim() || 'Sin nombre'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: '#bdbdbd' }} />

                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Roles Activos
                </Typography>

                {loadingRoles ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {roles.map((rol) => {
                      const isSelected = values.selectedRoles.includes(rol.idrol);
                      
                      const handleToggle = () => {
                        if (isSelected) {
                          setFieldValue('selectedRoles', values.selectedRoles.filter(id => id !== rol.idrol));
                        } else {
                          setFieldValue('selectedRoles', [...values.selectedRoles, rol.idrol]);
                        }
                      };

                      return (
                        <Box
                          key={rol.idrol}
                          sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : '#e0e0e0',
                            borderRadius: 2,
                            backgroundColor: isSelected ? '#e3f2fd' : 'white',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: isSelected ? '#e3f2fd' : '#f5f5f5',
                            }
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSelected}
                                onChange={handleToggle}
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body1" fontWeight={600}>
                                  {rol.rol}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {roleDescriptions[rol.rol] || 'Sin descripción'}
                                </Typography>
                              </Box>
                            }
                            sx={{ width: '100%', m: 0, cursor: 'pointer' }}
                            onClick={(e) => {
                              if ((e.target as HTMLElement).tagName !== 'INPUT') {
                                handleToggle();
                              }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {touched.selectedRoles && errors.selectedRoles && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {errors.selectedRoles}
                  </Alert>
                )}
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #e0e0e0', gap: 1 }}>
                <Button 
                  onClick={onClose} 
                  variant="outlined"
                  sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={loadingRoles}
                  sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}
                >
                  Guardar Roles
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => !isSubmitting && setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Cambios de Roles"
        description="Los roles del usuario serán actualizados. "
        severity="warning"
        confirmText="Actualizar Roles"
        cancelText="Cancelar"
        loading={isSubmitting}
        showAlert={false}
      >
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Roles seleccionados: <strong>{pendingRoles.length}</strong>
          </Typography>
        </Box>
      </ConfirmDialog>
    </>
  );
};

export default ModalAsignarRoles;