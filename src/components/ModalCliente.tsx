import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { clienteValidationSchema, getInitialValues } from '../schemas/clienteValidationSchema';

// ==========================================
// INTERFACES
// ==========================================

interface ClienteFormData {
  tipo_cliente: string;
  ci: string;
  nombre_completo: string;
  telefono?: string;
  email?: string;
}

interface ModalClienteProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClienteFormData) => Promise<void>;
  itemEdit: any | null;
  loading: boolean;
}

// ==========================================
// COMPONENTE
// ==========================================

const ModalCliente: React.FC<ModalClienteProps> = ({
  open,
  onClose,
  onSave,
  itemEdit,
  loading,
}) => {
  // Error de submit
  const [submitError, setSubmitError] = useState('');

  // ==========================================
  // FORMIK
  // ==========================================
  const formik = useFormik({
    initialValues: getInitialValues(itemEdit),
    validationSchema: clienteValidationSchema,
    enableReinitialize: true,
    
    onSubmit: async (values) => {
      setSubmitError('');
      
      try {
        const data: ClienteFormData = {
          tipo_cliente: values.tipo_cliente,
          ci: values.ci.trim(),
          nombre_completo: values.nombre_completo.trim(),
          telefono: values.telefono?.trim() || undefined,
          email: values.email?.trim() || undefined,
        };

        await onSave(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Error al guardar el cliente';
        setSubmitError(errorMessage);
      }
    },
  });

  // ==========================================
  // HELPER: Extraer error como string de Formik
  // ==========================================
  const getErrorText = (fieldName: keyof typeof formik.values): string | undefined => {
    const error = formik.errors[fieldName];
    const touched = formik.touched[fieldName];
    
    if (!touched) return undefined;
    if (typeof error === 'string') return error;
    return undefined;
  };

  // Determinar label y placeholder según tipo
  const getCILabel = () => {
    return formik.values.tipo_cliente === 'empresa' ? 'NIT' : 'CI';
  };

  const getCIPlaceholder = () => {
    return formik.values.tipo_cliente === 'empresa' 
      ? 'Ej: 12345678' 
      : 'Ej: 1234567 LP';
  };

  // ==========================================
  // EFECTOS
  // ==========================================

  // Resetear form cuando se abre/cierra el modal
  useEffect(() => {
    if (open) {
      formik.resetForm({
        values: getInitialValues(itemEdit),
      });
      setSubmitError('');
    }
  }, [open, itemEdit]);

  // Limpiar campo cuando cambia tipo (crear O editar)
  useEffect(() => {
  // Solo limpiar si cambió el tipo
  if (itemEdit && formik.values.tipo_cliente !== itemEdit.tipo_cliente) {
    formik.setFieldValue('ci', '');
  } else if (!itemEdit && formik.values.tipo_cliente) {
    // En modo crear, limpiar siempre
    formik.setFieldValue('ci', '');
  }
}, [formik.values.tipo_cliente]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {itemEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{ pt: 3 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError('')}>
            {submitError}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Fila 1: Tipo de Cliente */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Tipo de Cliente"
                {...formik.getFieldProps('tipo_cliente')}
                error={formik.touched.tipo_cliente && Boolean(formik.errors.tipo_cliente)}
                helperText={getErrorText('tipo_cliente')}
                disabled={loading}
                required
              >
                <MenuItem value="persona">Persona Natural</MenuItem>
                <MenuItem value="empresa">Empresa</MenuItem>
              </TextField>
            </Grid>

            {/* Fila 2: CI/NIT */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={getCILabel()}
                placeholder={getCIPlaceholder()}
                {...formik.getFieldProps('ci')}
                error={formik.touched.ci && Boolean(formik.errors.ci)}
                helperText={getErrorText('ci')}
                disabled={loading}
                inputProps={{ maxLength: 20 }}
                required
              />
            </Grid>

            {/* Fila 3: Nombre Completo */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre Completo"
                placeholder="Ej: Juan Pérez López"
                {...formik.getFieldProps('nombre_completo')}
                error={formik.touched.nombre_completo && Boolean(formik.errors.nombre_completo)}
                helperText={getErrorText('nombre_completo')}
                disabled={loading}
                inputProps={{ maxLength: 255 }}
                required
              />
            </Grid>

            {/* Fila 4: Teléfono */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Teléfono"
                placeholder="Ej: 72345678"
                {...formik.getFieldProps('telefono')}
                error={formik.touched.telefono && Boolean(formik.errors.telefono)}
                helperText={getErrorText('telefono') || 'Opcional'}
                disabled={loading}
                inputProps={{ maxLength: 20 }}
              />
            </Grid>

            {/* Fila 5: Email */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                placeholder="Ej: juan@example.com"
                {...formik.getFieldProps('email')}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={getErrorText('email') || 'Opcional'}
                disabled={loading}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          color="primary"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          disabled={loading}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            minWidth: 120,
          }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCliente;