import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { categoriaValidationSchema, getInitialValues } from '../schemas/categoriaValidationSchema';

// ==========================================
// INTERFACES
// ==========================================

interface CategoriaFormData {
  nombre: string;
}

interface ModalCategoriaProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CategoriaFormData) => Promise<void>;
  categoriaEdit?: any | null;
  loading?: boolean;
}

// ==========================================
// COMPONENTE
// ==========================================

const ModalCategoria: React.FC<ModalCategoriaProps> = ({
  open,
  onClose,
  onSave,
  categoriaEdit,
  loading = false,
}) => {
  
  const [submitError, setSubmitError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  // ==========================================
  // FORMIK
  // ==========================================
  const formik = useFormik({
    initialValues: getInitialValues(categoriaEdit),
    validationSchema: categoriaValidationSchema,
    enableReinitialize: true,
    
    onSubmit: async (values) => {
      setSubmitError('');
      
      try {

        setIsValidating(true);

        const data: CategoriaFormData = {
          nombre: values.nombre.trim(),
        };

        await onSave(data);
        
        // Resetear después de guardar
        formik.resetForm();
      } catch (error: any) {
        if (error.response?.data?.errors) {
          const serverErrors = error.response.data.errors;
          
          // Mapear errores del servidor
          const formikErrors: any = {};
          
          if (serverErrors.nombre) {
            formikErrors.nombre = Array.isArray(serverErrors.nombre)
              ? serverErrors.nombre[0]
              : serverErrors.nombre;
          }
          
          formik.setErrors(formikErrors);
        } else {
          setSubmitError(
            error.response?.data?.message || 'Error al procesar la solicitud'
          );
        }
      }finally{
        setIsValidating(false);
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

  // ==========================================
  // EFECTOS
  // ==========================================

  // Resetear form cuando se abre/cierra el modal
  useEffect(() => {
    if (open) {
      formik.resetForm({
        values: getInitialValues(categoriaEdit),
      });
      setSubmitError('');
      setIsValidating(false);
    }
  }, [open, categoriaEdit]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleClose = () => {
    if (!loading) {
      formik.resetForm();
      onClose();
    }
  };

  const isEditMode = !!categoriaEdit;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  setIsValidating(true); 
 
  const errors = await formik.validateForm();
  
  if (Object.keys(errors).length === 0) {
   
    formik.handleSubmit();
  } else {
 
    formik.setTouched({
      nombre: true,
    });
    setIsValidating(false); 
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
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
          }}
        >
          {isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ py: 1 }}>
            {/* Campo Nombre */}
            <TextField
              label="Nombre de la Categoría"
              {...formik.getFieldProps('nombre')}
              error={formik.touched.nombre && Boolean(formik.errors.nombre)}
              helperText={getErrorText('nombre')}
              disabled={loading}
              required
              fullWidth
              placeholder="Ej: Obras preliminares"
              inputProps={{ maxLength: 120 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading }
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isValidating}
            sx={{ textTransform: 'none', minWidth: 120 }}
          >
            {(loading || isValidating) ? (
              <CircularProgress size={20} color="inherit" />
            ) : isEditMode ? (
              'Actualizar'
            ) : (
              'Guardar'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ModalCategoria;