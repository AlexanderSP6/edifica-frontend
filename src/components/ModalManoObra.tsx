import React, { useState, useEffect, useMemo } from 'react';
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
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { manoObraValidationSchema, getInitialValues } from '../schemas/manoObraValidationSchema';

// ==========================================
// INTERFACES
// ==========================================

interface ManoObraFormData {
  descripcion: string;
  unidad_id: number | '';
  apu_item_id: number | '';
  rendimiento: number | '';
  precio_unitario: number | '';
  vigente_desde: string;
  vigente_hasta?: string;
}

interface ModalManoObraProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ManoObraFormData) => Promise<void>;
  itemEdit: any | null;
  loading: boolean;
  categorias: Array<{ id: number; codigo: string; nombre: string }>;
  apuItems: Array<{ 
    id: number; 
    codigo: string; 
    descripcion: string; 
    categoria?: { id: number; codigo: string; nombre: string } 
  }>;
  unidades: Array<{ id: number; codigo: string; nombre: string }>;
}

// ==========================================
// COMPONENTE
// ==========================================

const ModalManoObra: React.FC<ModalManoObraProps> = ({
  open,
  onClose,
  onSave,
  itemEdit,
  loading,
  categorias,
  apuItems,
  unidades,
}) => {
  // Items filtrados por categoría
  const [apuItemsFiltrados, setApuItemsFiltrados] = useState(apuItems);
  
  // Error de submit
  const [submitError, setSubmitError] = useState('');

  // ==========================================
  // FORMIK
  // ==========================================
  const formik = useFormik({
    initialValues: getInitialValues(itemEdit),
    validationSchema: manoObraValidationSchema,
    enableReinitialize: true, // Reinicia cuando cambia itemEdit
    
    onSubmit: async (values) => {
      setSubmitError('');
      
      try {
        const data: ManoObraFormData = {
          descripcion: values.descripcion.trim(),
          unidad_id: Number(values.unidad_id),
          apu_item_id: Number(values.apu_item_id),
          rendimiento: Number(values.rendimiento),
          precio_unitario: Number(values.precio_unitario),
          vigente_desde: values.vigente_desde,
          vigente_hasta: values.vigente_hasta || undefined,
        };

        await onSave(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Error al guardar la mano de obra';
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

  // ==========================================
  // HELPER: Validar input numérico (evita 'e', '+', '-', etc.)
  // ==========================================
  const handleNumericInput = (
    fieldName: keyof typeof formik.values,
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
      return; // Ignorar input inválido
    }

    // Validar cantidad de decimales
    const parts = value.split('.');
    if (parts.length === 2 && parts[1].length > maxDecimals) {
      return; // Ignorar si excede decimales permitidos
    }

    formik.setFieldValue(fieldName, value);
  };

  // ==========================================
  
  // ==========================================
  // CÁLCULO DEL TOTAL EN TIEMPO REAL
  // ==========================================
  const totalCalculado = useMemo(() => {
    const rendimiento = Number(formik.values.rendimiento);
    const precioUnitario = Number(formik.values.precio_unitario);
    
    if (!isNaN(rendimiento) && !isNaN(precioUnitario) && rendimiento >= 0 && precioUnitario >= 0) {
      // Buscar la unidad seleccionada para verificar si es porcentaje
      const unidadSeleccionada = unidades.find(u => u.id === formik.values.unidad_id);
      const esPorcentaje = unidadSeleccionada?.codigo === '%';
      
      if (esPorcentaje) {
        return (precioUnitario * (rendimiento / 100)).toFixed(4);
      }
      
      return (precioUnitario * rendimiento).toFixed(4);
    }
    
    return '0.0000';
  }, [formik.values.rendimiento, formik.values.precio_unitario, formik.values.unidad_id, unidades]);

  // ==========================================
  // EFECTOS
  // ==========================================

  // Resetear form y errores cuando se abre/cierra el modal
  useEffect(() => {
    if (open) {
      formik.resetForm({
        values: getInitialValues(itemEdit),
      });
      setSubmitError('');
    }
  }, [open, itemEdit]);

  // Filtrar APU Items cuando cambia la categoría
  useEffect(() => {
    if (formik.values.categoria_id) {
      const itemsFiltrados = apuItems.filter(
        (item) => item.categoria?.id === formik.values.categoria_id
      );
      setApuItemsFiltrados(itemsFiltrados);
      
      // Si el APU Item actual no está en los filtrados, limpiarlo
      if (formik.values.apu_item_id) {
        const itemExiste = itemsFiltrados.some((item) => item.id === formik.values.apu_item_id);
        if (!itemExiste) {
          formik.setFieldValue('apu_item_id', '');
        }
      }
    } else {
      setApuItemsFiltrados(apuItems);
    }

  }, [formik.values.categoria_id, apuItems]);

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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {itemEdit ? 'Editar Mano de Obra' : 'Nueva Mano de Obra'}
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
          <Grid container spacing={3}>
            {/* Fila 1: Categoría (filtro) | APU Item */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Categoría (Filtro)"
                {...formik.getFieldProps('categoria_id')}
                value={formik.values.categoria_id ?? ''}
                disabled={loading}
                helperText="Filtra los Items por Categoría"
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {categorias.map((categoria) => (
                  <MenuItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="APU Item"
                {...formik.getFieldProps('apu_item_id')}
                error={formik.touched.apu_item_id && Boolean(formik.errors.apu_item_id)}
                helperText={
                  getErrorText('apu_item_id') || `${apuItemsFiltrados.length} ítems disponibles`
                }
                disabled={loading}
                required
              >
                <MenuItem value="">Seleccione un APU Item</MenuItem>
                {apuItemsFiltrados.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.codigo} - {item.descripcion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Fila 2: Descripción */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Descripción"
                placeholder="Ej: Albañil especializado, Ayudante, Oficial..."
                {...formik.getFieldProps('descripcion')}
                error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
                helperText={getErrorText('descripcion')}
                disabled={loading}
                multiline
                rows={2}
                required
              />
            </Grid>

            {/* Fila 3: Unidad | Rendimiento */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Unidad"
                {...formik.getFieldProps('unidad_id')}
                error={formik.touched.unidad_id && Boolean(formik.errors.unidad_id)}
                helperText={getErrorText('unidad_id')}
                disabled={loading}
                required
              >
                <MenuItem value="">Seleccione una unidad</MenuItem>
                {unidades.map((unidad) => (
                  <MenuItem key={unidad.id} value={unidad.id}>
                    {unidad.codigo} - {unidad.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="text"
                label="Rendimiento"
                placeholder="0.0000"
                name="rendimiento"
                value={formik.values.rendimiento}
                onChange={(e) => handleNumericInput('rendimiento', e.target.value, 4)}
                onBlur={formik.handleBlur}
                error={formik.touched.rendimiento && Boolean(formik.errors.rendimiento)}
                helperText={
                  getErrorText('rendimiento') || 'Coeficiente de uso (hasta 4 decimales)'
                }
                disabled={loading}
                inputProps={{ 
                  inputMode: 'decimal',
                  autoComplete: 'off'
                }}
                required
              />
            </Grid>

            {/* Fila 4: Precio Unitario | Total (calculado) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="text"
                label="Precio Unitario"
                placeholder="0.00"
                name="precio_unitario"
                value={formik.values.precio_unitario}
                onChange={(e) => handleNumericInput('precio_unitario', e.target.value, 2)}
                onBlur={formik.handleBlur}
                error={formik.touched.precio_unitario && Boolean(formik.errors.precio_unitario)}
                helperText={getErrorText('precio_unitario')}
                disabled={loading}
                inputProps={{ 
                  inputMode: 'decimal',
                  autoComplete: 'off'
                }}
                InputProps={{
                  endAdornment: (
                    <Chip 
                      label="BOB" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  ),
                }}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              {/* Campo SOLO LECTURA - Total calculado */}
              <TextField
                fullWidth
                label="Total"
                value={totalCalculado}
                disabled
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Chip 
                      label="BOB" 
                      size="small" 
                      color="primary" 
                      variant="filled"
                    />
                  ),
                  sx: {
                    backgroundColor: '#f5f5f5',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: 'primary.main',
                  },
                }}
                helperText="Cálculo automático"
              />
            </Grid>

            {/* Fila 5: Fechas de Vigencia */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Vigente Desde"
                {...formik.getFieldProps('vigente_desde')}
                error={formik.touched.vigente_desde && Boolean(formik.errors.vigente_desde)}
                helperText={getErrorText('vigente_desde')}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Vigente Hasta"
                {...formik.getFieldProps('vigente_hasta')}
                error={formik.touched.vigente_hasta && Boolean(formik.errors.vigente_hasta)}
                helperText={
                  getErrorText('vigente_hasta') || 'Opcional - Dejar vacío si no tiene fecha límite'
                }
                disabled={loading}
                InputLabelProps={{ shrink: true }}
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

export default ModalManoObra;