import React, { useState, useEffect, useMemo } from 'react';
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
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Typography,
  InputAdornment,
  Grid,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { 
  apuItemValidationSchema, 
  apuItemStep1Schema, 
  getInitialValues 
} from '../schemas/apuItemValidationSchema';

// ==========================================
// INTERFACES
// ==========================================

interface ApuItemFormData {
  codigo: string;
  descripcion: string;
  unidad_id: number | '';
  categoria_id: number | '';
  precio: {
    precio_material: number;
    precio_mano_obra: number;
    precio_equipo: number;
    precio_total: number;
  };
}

interface ModalApuItemProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ApuItemFormData) => Promise<void>;
  itemEdit?: any | null;
  loading?: boolean;
  categorias: Array<{ id: number; nombre: string }>;
  unidades: Array<{ id: number; codigo: string; nombre: string }>;
}

// ==========================================
// COMPONENTE
// ==========================================

const ModalApuItem: React.FC<ModalApuItemProps> = ({
  open,
  onClose,
  onSave,
  itemEdit,
  loading = false,
  categorias,
  unidades,
}) => {
  // Estado del Stepper
  const [activeStep, setActiveStep] = useState(0);
  
  // Error de submit
  const [submitError, setSubmitError] = useState('');

  const [isValidating, setIsValidating] = useState(false);

  // ==========================================
  // FORMIK
  // ==========================================
  const formik = useFormik({
    initialValues: getInitialValues(itemEdit),
    validationSchema: apuItemValidationSchema,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    
     onSubmit: async () => {
  },
  });

  // ==========================================
  // HELPER: Extraer error como string de Formik
  // ==========================================
  const getErrorText = (fieldName: string): string | undefined => {
    // Para campos anidados como precio.precio_material
    const fieldParts = fieldName.split('.');
    
    let error: any = formik.errors;
    let touched: any = formik.touched;
    
    for (const part of fieldParts) {
      if (error) error = error[part];
      if (touched) touched = touched[part];
    }
    
    // Solo mostrar error si el campo está touched Y hay un error
    if (!touched) return undefined;
    if (typeof error === 'string') return error;
    return undefined;
  };

  // ==========================================
  // HELPER: Validar input numérico
  // ==========================================
  const handleNumericInput = (
    fieldName: string,
    value: string,
    maxDecimals: number = 4
  ) => {
    // Permitir vacío
    if (value === '') {
      formik.setFieldValue(fieldName, '');
      return;
    }

    // Permitir solo números y un punto decimal
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (!regex.test(value)) {
      return;
    }

    // Validar cantidad de decimales
    const parts = value.split('.');
    if (parts.length === 2 && parts[1].length > maxDecimals) {
      return;
    }

    formik.setFieldValue(fieldName, value);
  };

  // ==========================================
  // CÁLCULO DEL PRECIO TOTAL EN TIEMPO REAL
  // ==========================================
  const precioTotal = useMemo(() => {
    const material = Number(formik.values.precio.precio_material) || 0;
    const manoObra = Number(formik.values.precio.precio_mano_obra) || 0;
    const equipo = Number(formik.values.precio.precio_equipo) || 0;
    
    return parseFloat((material + manoObra + equipo).toFixed(2));
  }, [
    formik.values.precio.precio_material,
    formik.values.precio.precio_mano_obra,
    formik.values.precio.precio_equipo,
  ]);

  // Actualizar precio_total cuando cambia el cálculo
  useEffect(() => {
    formik.setFieldValue('precio.precio_total', precioTotal);
  }, [precioTotal]);

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
      setActiveStep(0);
      setIsValidating(false);
    }
  }, [open, itemEdit]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleClose = () => {
    if (!loading) {
      formik.resetForm();
      setActiveStep(0);
      setSubmitError('');
      onClose();
    }
  };

  // Validar paso 1 antes de avanzar
  const handleNext = async () => {
  setIsValidating(true);
  
  try {
    // Validar SOLO paso 1
    await apuItemStep1Schema.validate(formik.values, { abortEarly: false });
    
    // Si pasa, avanzar (sin tocar errores)
    setActiveStep(1);
    
  } catch (err: any) {
    // Si falla, mostrar SOLO los errores reales
    const validationErrors: any = {};
    
    if (err.inner) {
      err.inner.forEach((error: any) => {
        if (error.path) {
          validationErrors[error.path] = error.message;
        }
      });
    }
    
    // Establecer errores y touched SOLO para campos con error
    formik.setErrors(validationErrors);
    formik.setTouched({
      codigo: !!validationErrors.codigo,
      descripcion: !!validationErrors.descripcion,
      categoria_id: !!validationErrors.categoria_id,
      unidad_id: !!validationErrors.unidad_id,
    }, false);
    
  } finally {
    setIsValidating(false);
  }
};



  const handleBack = () => {
    setActiveStep(0);
  };

  // ==========================================
// HANDLER: Submit DIRECTO sin validación
// ==========================================
const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitError('');
  
  try {
    // Construir data DIRECTAMENTE (sin pasar por Formik)
    const data: ApuItemFormData = {
      codigo: formik.values.codigo.trim(),
      descripcion: formik.values.descripcion.trim(),
      unidad_id: Number(formik.values.unidad_id),
      categoria_id: Number(formik.values.categoria_id),
      precio: {
        precio_material: Number(formik.values.precio.precio_material) || 0,
        precio_mano_obra: Number(formik.values.precio.precio_mano_obra) || 0,
        precio_equipo: Number(formik.values.precio.precio_equipo) || 0,
        precio_total: formik.values.precio.precio_total,
      },
    };

    // Llamar  a onSave (esto activa el loading del padre)
    await onSave(data);
    
    // Resetear después de guardar
    formik.resetForm();
    setActiveStep(0);
    
  } catch (error: any) {
    if (error.response?.data?.errors) {
      const serverErrors = error.response.data.errors;
      
      const formikErrors: any = {};
      
      if (serverErrors.codigo) {
        formikErrors.codigo = Array.isArray(serverErrors.codigo) 
          ? serverErrors.codigo[0] 
          : serverErrors.codigo;
      }
      if (serverErrors.descripcion) {
        formikErrors.descripcion = Array.isArray(serverErrors.descripcion)
          ? serverErrors.descripcion[0]
          : serverErrors.descripcion;
      }
      if (serverErrors.categoria_id) {
        formikErrors.categoria_id = Array.isArray(serverErrors.categoria_id)
          ? serverErrors.categoria_id[0]
          : serverErrors.categoria_id;
      }
      if (serverErrors.unidad_id) {
        formikErrors.unidad_id = Array.isArray(serverErrors.unidad_id)
          ? serverErrors.unidad_id[0]
          : serverErrors.unidad_id;
      }
      
      if (serverErrors['precio.precio_material']) {
        formikErrors.precio = formikErrors.precio || {};
        formikErrors.precio.precio_material = Array.isArray(serverErrors['precio.precio_material'])
          ? serverErrors['precio.precio_material'][0]
          : serverErrors['precio.precio_material'];
      }
      if (serverErrors['precio.precio_mano_obra']) {
        formikErrors.precio = formikErrors.precio || {};
        formikErrors.precio.precio_mano_obra = Array.isArray(serverErrors['precio.precio_mano_obra'])
          ? serverErrors['precio.precio_mano_obra'][0]
          : serverErrors['precio.precio_mano_obra'];
      }
      if (serverErrors['precio.precio_equipo']) {
        formikErrors.precio = formikErrors.precio || {};
        formikErrors.precio.precio_equipo = Array.isArray(serverErrors['precio.precio_equipo'])
          ? serverErrors['precio.precio_equipo'][0]
          : serverErrors['precio.precio_equipo'];
      }
      if (serverErrors['precio.precio_total']) {
        formikErrors.precio = formikErrors.precio || {};
        formikErrors.precio.precio_total = Array.isArray(serverErrors['precio.precio_total'])
          ? serverErrors['precio.precio_total'][0]
          : serverErrors['precio.precio_total'];
      }
      
      formik.setErrors(formikErrors);
      formik.setTouched({
        codigo: !!formikErrors.codigo,
        descripcion: !!formikErrors.descripcion,
        categoria_id: !!formikErrors.categoria_id,
        unidad_id: !!formikErrors.unidad_id,
        precio: {
          precio_material: !!formikErrors.precio?.precio_material,
          precio_mano_obra: !!formikErrors.precio?.precio_mano_obra,
          precio_equipo: !!formikErrors.precio?.precio_equipo,
          precio_total: !!formikErrors.precio?.precio_total,
        },
      });
      
      if (formikErrors.codigo || formikErrors.descripcion || 
          formikErrors.categoria_id || formikErrors.unidad_id) {
        setActiveStep(0);
      }
    } else {
      setSubmitError(
        error.response?.data?.message || 'Error al procesar la solicitud'
      );
    }
  }
};

  const isEditMode = !!itemEdit;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <form onSubmit={handleFormSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {isEditMode ? 'Editar Item' : 'Nuevo Item'}
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError('')}>
              {submitError}
            </Alert>
          )}

          {/* Stepper */}
          <Stepper 
            activeStep={activeStep} 
            sx={{ mb: 4 }}
            alternativeLabel
          >
            <Step>
              <StepLabel
                optional={
                  <Typography variant="caption" color="text.secondary">
                    Información general
                  </Typography>
                }
              >
                Datos Básicos
              </StepLabel>
            </Step>
            <Step>
              <StepLabel
                optional={
                  <Typography variant="caption" color="text.secondary">
                    Costos del item
                  </Typography>
                }
              >
                Precios
              </StepLabel>
            </Step>
          </Stepper>

          {/* PASO 1: Datos Básicos */}
          {activeStep === 0 && (
            <Box sx={{ py: 1 }}>
              <Grid container spacing={2.5}>
                {/* Fila 1: Código y Categoría */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Código"
                    name="codigo"
                    value={formik.values.codigo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.codigo && Boolean(formik.errors.codigo)}
                    helperText={getErrorText('codigo')}
                    disabled={loading}
                    required
                    fullWidth
                    placeholder="Ej: APU-001"
                    inputProps={{ maxLength: 50 }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    label="Categoría"
                    name="categoria_id"
                    value={formik.values.categoria_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.categoria_id && Boolean(formik.errors.categoria_id)}
                    helperText={getErrorText('categoria_id')}
                    disabled={loading}
                    required
                    fullWidth
                  >
                    <MenuItem value="">Seleccionar...</MenuItem>
                    {categorias.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Fila 2: Unidad */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    select
                    label="Unidad"
                    name="unidad_id"
                    value={formik.values.unidad_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.unidad_id && Boolean(formik.errors.unidad_id)}
                    helperText={getErrorText('unidad_id')}
                    disabled={loading}
                    required
                    fullWidth
                  >
                    <MenuItem value="">Seleccionar...</MenuItem>
                    {unidades.map((unidad) => (
                      <MenuItem key={unidad.id} value={unidad.id}>
                        {unidad.codigo} - {unidad.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Fila 3: Descripción */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Descripción"
                    name="descripcion"
                    value={formik.values.descripcion}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                    helperText={getErrorText('descripcion')}
                    disabled={loading}
                    required
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Descripción del ítem"
                    inputProps={{ maxLength: 500 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* PASO 2: Precios */}
          {activeStep === 1 && (
            <Box sx={{ py: 1 }}>
              {/* Card de Componentes del Precio */}
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2.5, 
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Componentes del Precio
                </Typography>
                
                <Grid container spacing={2}>
                  {/* Precio Material */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Material"
                      type="text"
                      name="precio.precio_material"
                      value={formik.values.precio.precio_material}
                      onChange={(e) => handleNumericInput('precio.precio_material', e.target.value, 2)}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.precio?.precio_material && 
                        Boolean(formik.errors.precio?.precio_material)
                      }
                      helperText={getErrorText('precio.precio_material')}
                      disabled={loading}
                      fullWidth
                      placeholder="0.00"
                      inputProps={{ 
                        inputMode: 'decimal',
                        autoComplete: 'off'
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Bs</InputAdornment>,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Precio Mano de Obra */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Mano de Obra"
                      type="text"
                      name="precio.precio_mano_obra"
                      value={formik.values.precio.precio_mano_obra}
                      onChange={(e) => handleNumericInput('precio.precio_mano_obra', e.target.value, 2)}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.precio?.precio_mano_obra && 
                        Boolean(formik.errors.precio?.precio_mano_obra)
                      }
                      helperText={getErrorText('precio.precio_mano_obra')}
                      disabled={loading}
                      fullWidth
                      placeholder="0.00"
                      inputProps={{ 
                        inputMode: 'decimal',
                        autoComplete: 'off'
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Bs</InputAdornment>,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>

                  {/* Precio Equipo */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Equipo"
                      type="text"
                      name="precio.precio_equipo"
                      value={formik.values.precio.precio_equipo}
                      onChange={(e) => handleNumericInput('precio.precio_equipo', e.target.value, 2)}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.precio?.precio_equipo && 
                        Boolean(formik.errors.precio?.precio_equipo)
                      }
                      helperText={getErrorText('precio.precio_equipo')}
                      disabled={loading}
                      fullWidth
                      placeholder="0.00"
                      inputProps={{ 
                        inputMode: 'decimal',
                        autoComplete: 'off'
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">Bs</InputAdornment>,
                      }}
                      sx={{ backgroundColor: 'white' }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Alert para error de precio_total */}
              {getErrorText('precio.precio_total') && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {getErrorText('precio.precio_total')}
                </Alert>
              )}

              {/* Card de Precio Total */}
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  textAlign: 'center',
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 1, 
                    opacity: 0.9,
                    fontWeight: 500,
                  }}
                >
                  Precio Total
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  Bs {precioTotal.toFixed(2)}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>

        <DialogActions 
          sx={{ 
            px: 3, 
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1,
          }}
        >
          {/* Botón Cancelar */}
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            color="inherit"
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>

          <Box sx={{ flex: 1 }} />

          {/* Botón Anterior (solo en paso 2) */}
          {activeStep === 1 && (
            <Button
              onClick={handleBack}
              disabled={loading}
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ textTransform: 'none' }}
            >
              Anterior
            </Button>
          )}

          {/* Botón Siguiente (solo en paso 1) */}
          {activeStep === 0 && (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={isValidating}
              endIcon={isValidating ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardIcon />}
              sx={{ textTransform: 'none', minWidth: 130 }}
            >
              {isValidating ? 'Validando...' : 'Siguiente'}
            </Button>
          )}

          {/* Botón Guardar (solo en paso 2) */}
          {activeStep === 1 && (
            <Button
              type="submit"
              variant="contained"
              disabled={loading || isValidating}
              sx={{ textTransform: 'none', minWidth: 130 }}
            >
              {(loading || isValidating) ? (
                <CircularProgress size={20} color="inherit" />
              ) : isEditMode ? (
                'Actualizar'
              ) : (
                'Guardar'
              )}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ModalApuItem;