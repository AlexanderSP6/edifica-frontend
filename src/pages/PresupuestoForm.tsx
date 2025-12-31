import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Stack,
  Snackbar,
  CircularProgress,
  Collapse,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import {
  ValidateDatosGenerales,
  validateItem,
  validateDetalles,
  getInitialValues,
} from '../schemas/presupuestoValidationSchema';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { useCliente } from '../hooks/useCliente';
import { usePresupuestoData } from '../hooks/usePresupuestoData';
import { useDebounce } from '../hooks/useDebounce';
import { DatosGenerales } from '../components/DatosGenerales';
import { SeleccionItems } from '../components/SeleccionItems';
import { calcularPrecioConB2, obtenerPorcentajesB2 } from '../utils/calcularPrecioB2';
import type {
  DetalleItem,
  ApuItemSelect,
  SnackbarState,
  PresupuestoFormValues,
} from '../types/presupuesto.types';

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const PresupuestoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const presupuesto = usePresupuesto();

  const isEditMode = !!id;
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const cliente = useCliente();
  const data = usePresupuestoData();

  // Estados para Snackbar
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Estados para el paso 2
  const [searchApuItem, setSearchApuItem] = useState('');
  const debouncedSearch = useDebounce(searchApuItem, 500);
  const [selectedApuItem, setSelectedApuItem] = useState<ApuItemSelect | null>(null);
  const [cantidadTemp, setCantidadTemp] = useState<string>('');
  const [detallesItems, setDetallesItems] = useState<DetalleItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | ''>('');

  // Formik
  const formik = useFormik<PresupuestoFormValues>({
    initialValues: getInitialValues(),
    validationSchema: ValidateDatosGenerales,
    onSubmit: async () => {
      //  submit manual
    },
  });

  // ==========================================
  // EFECTOS
  // ==========================================

  useEffect(() => {
    cliente.loadItems({ page: 1, per_page: 100 });
    if (isEditMode && id) {
      loadPresupuestoData();
    }
  }, [id]);

  useEffect(() => {
    if (data.error) {
      setSnackbar({
        open: true,
        message: data.error,
        severity: 'error',
      });
    }
  }, [data.error]);

  // ==========================================
  // CARGAR DATOS PARA EDICIÓN
  // ==========================================

  const loadPresupuestoData = async () => {
    if (!id) return;

    try {
      const dataPresupuesto = await presupuesto.loadById(Number(id));
      formik.setValues(getInitialValues(dataPresupuesto));

      const detalles: DetalleItem[] = dataPresupuesto.detalles.map((detalle: any) => ({
        apu_item_id: detalle.apu_item.id,
        codigo: detalle.apu_item.codigo,
        descripcion: detalle.apu_item.descripcion,
        unidad: detalle.apu_item.unidad.codigo,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        subtotal: detalle.subtotal,
      }));
      setDetallesItems(detalles);
    } catch (err) {
      console.error('Error al cargar presupuesto:', err);
      setSnackbar({
        open: true,
        message: 'Error al cargar el presupuesto',
        severity: 'error',
      });
    }
  };

  // CÁLCULOS
  const clienteSeleccionado = cliente.items.find((c) => c.id === formik.values.cliente_id);

  // Solo calculamos subtotal de ítems
  const subtotal = detallesItems.reduce((sum, item) => sum + item.subtotal, 0);

  // ==========================================
  // NAVEGACIÓN WIZARD
  // ==========================================

  const handleNext = async () => {
    if (activeStep === 0) {
      try {
        await ValidateDatosGenerales.validate(formik.values, { abortEarly: false });
        setActiveStep(1);
      } catch (err: any) {
        const errors = err.inner.reduce((acc: any, error: any) => {
          acc[error.path] = error.message;
          return acc;
        }, {});
        formik.setErrors(errors);
        formik.setTouched({
          cliente_id: true,
          nombre_proyecto: true,
          ubicacion_obra: true,
          tipo: true,
          fecha_emision: true,
        });
        
        setSnackbar({
          open: true,
          message: 'Complete todos los campos requeridos',
          severity: 'warning',
        });
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };


  // GUARDAR PRESUPUESTO
  const handleGuardarPresupuesto = async () => {
    const errorDetalles = validateDetalles(detallesItems);
    if (errorDetalles) {
      setSnackbar({
        open: true,
        message: errorDetalles,
        severity: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      // Construir datos
      const dataToSend = {
        cliente_id: Number(formik.values.cliente_id),
        nombre_proyecto: formik.values.nombre_proyecto,
        ubicacion_obra: formik.values.ubicacion_obra || undefined,
        tipo: formik.values.tipo as 'cotizacion' | 'contrato',
        fecha_emision: formik.values.fecha_emision,
        
        // Porcentajes B-2 (solo si tienen valor)
        ...(formik.values.porcentaje_cargas_sociales && {
          porcentaje_cargas_sociales: formik.values.porcentaje_cargas_sociales,
        }),
        ...(formik.values.porcentaje_iva_mano_obra && {
          porcentaje_iva_mano_obra: formik.values.porcentaje_iva_mano_obra,
        }),
        ...(formik.values.porcentaje_herramientas && {
          porcentaje_herramientas: formik.values.porcentaje_herramientas,
        }),
        ...(formik.values.porcentaje_gastos_generales && {
          porcentaje_gastos_generales: formik.values.porcentaje_gastos_generales,
        }),
        ...(formik.values.porcentaje_utilidad && {
          porcentaje_utilidad: formik.values.porcentaje_utilidad,
        }),
        ...(formik.values.porcentaje_impuestos_it && {
          porcentaje_impuestos_it: formik.values.porcentaje_impuestos_it,
        }),
        
        detalles: detallesItems.map((item) => ({
          apu_item_id: item.apu_item_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        })),
      };

      if (isEditMode) {
        await presupuesto.updateItem(Number(id), dataToSend);
        setSnackbar({
          open: true,
          message: 'Presupuesto actualizado correctamente',
          severity: 'success',
        });
      } else {
        await presupuesto.createItem(dataToSend);
        setSnackbar({
          open: true,
          message: 'Presupuesto creado correctamente',
          severity: 'success',
        });
      }

      setTimeout(() => {
        navigate('/presupuestos/lista');
      }, 1500);
    } catch (err: any) {
      console.error('Error al guardar:', err);
      const errorMessage = err.response?.data?.message || 'Error al guardar el presupuesto';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // MANEJO DE ÍTEMS
  // ==========================================

  const handleAgregarItem = () => {
    if (!selectedApuItem || !cantidadTemp || parseFloat(cantidadTemp) <= 0) {
      setSnackbar({
        open: true,
        message: 'Seleccione un ítem y una cantidad válida',
        severity: 'warning',
      });
      return;
    }

    const cantidad = parseFloat(cantidadTemp);
    const porcentajesB2 = obtenerPorcentajesB2(formik.values);
    const precioUnitario = selectedApuItem.precio_actual
    ? calcularPrecioConB2(selectedApuItem.precio_actual, porcentajesB2)
    : 0;

    const itemData = {
      apu_item_id: selectedApuItem.id,
      cantidad,
      precio_unitario: precioUnitario,
    };

    const error = validateItem(itemData);
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'warning',
      });
      return;
    }

    const subtotal = cantidad * precioUnitario;

    const nuevoItem: DetalleItem = {
      apu_item_id: selectedApuItem.id,
      codigo: selectedApuItem.codigo,
      descripcion: selectedApuItem.descripcion,
      unidad: selectedApuItem.unidad.codigo,
      cantidad,
      precio_unitario: precioUnitario,
      subtotal,
    };

    if (editingIndex !== null) {
      const updatedItems = [...detallesItems];
      updatedItems[editingIndex] = nuevoItem;
      setDetallesItems(updatedItems);
      setEditingIndex(null);
      setSnackbar({
        open: true,
        message: 'Ítem actualizado correctamente',
        severity: 'success',
      });
    } else {
      setDetallesItems([...detallesItems, nuevoItem]);
      setSnackbar({
        open: true,
        message: 'Ítem agregado al carrito',
        severity: 'success',
      });
    }

    setSelectedApuItem(null);
    setCantidadTemp('');
  };

  const handleEditarItem = (index: number) => {
    const item = detallesItems[index];
    const apuItemFound = data.apuItems.find((a) => a.id === item.apu_item_id);

    if (apuItemFound) {
      setSelectedApuItem(apuItemFound);
      setCantidadTemp(item.cantidad.toString());
      setEditingIndex(index);
    }
  };

  const handleEliminarItem = (index: number) => {
    const updatedItems = detallesItems.filter((_, i) => i !== index);
    setDetallesItems(updatedItems);
    setSnackbar({
      open: true,
      message: 'Ítem eliminado del carrito',
      severity: 'info',
    });
  };

  const handleCancelarEdicion = () => {
    setSelectedApuItem(null);
    setCantidadTemp('');
    setEditingIndex(null);
  };

  // ==========================================
  // FILTRADO DE ITEMS
  // ==========================================

  const filteredApuItems = useMemo(() => {
    return data.apuItems.filter((item) => {
      const matchSearch =
        item.codigo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchCategoria = categoriaFiltro === '' || item.categoria.id === categoriaFiltro;

      return matchSearch && matchCategoria;
    });
  }, [data.apuItems, debouncedSearch, categoriaFiltro]);

  const steps = ['Datos Generales', 'Selección de Ítems'];

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/presupuestos/lista')}
        sx={{
          mb: 3,
          textTransform: 'none',
          fontWeight: 600,
          color: 'text.secondary',
        }}
      >
        Volver
      </Button>

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <DescriptionIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {isEditMode ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        </Typography>
      </Stack>

      {/* STEPPER */}
      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: 500,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <LinearProgress
          variant="determinate"
          value={(activeStep / (steps.length - 1)) * 100}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              backgroundColor: 'primary.main',
            },
          }}
        />
      </Box>

      {/* ALERTA DE ERROR DEL HOOK */}
      <Collapse in={!!presupuesto.error}>
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => presupuesto.setError('')}>
          {presupuesto.error}
        </Alert>
      </Collapse>

      {/* CONTENIDO */}
      <Box component="div">
        {/* PASO 1: DATOS GENERALES */}
        {activeStep === 0 && (
          <DatosGenerales
            formik={formik}
            clientes={cliente.items}
            clienteSeleccionado={clienteSeleccionado}
            onClienteChange={(newCliente) => {
              formik.setFieldValue('cliente_id', newCliente?.id || '');
            }}
          />
        )}

        {/* PASO 2: SELECCIÓN DE ÍTEMS */}
        {activeStep === 1 && (
          <SeleccionItems
            // Búsqueda
            searchApuItem={searchApuItem}
            categoriaFiltro={categoriaFiltro}
            categorias={data.categorias}
            filteredApuItems={filteredApuItems}
            selectedApuItem={selectedApuItem}
            cantidadTemp={cantidadTemp}
            editingIndex={editingIndex}
            onSearchChange={setSearchApuItem}
            onCategoriaChange={setCategoriaFiltro}
            onSelectApuItem={setSelectedApuItem}
            onCantidadChange={setCantidadTemp}
            onAgregarItem={handleAgregarItem}
            onCancelarEdicion={handleCancelarEdicion}
            
            // Carrito
            detallesItems={detallesItems}
            clienteSeleccionado={clienteSeleccionado}
            nombreProyecto={formik.values.nombre_proyecto}
            onEditarItem={handleEditarItem}
            onEliminarItem={handleEliminarItem}
            
            // Resumen B-2
            subtotal={subtotal}
            porcentajeCargas={formik.values.porcentaje_cargas_sociales}
            porcentajeIvaMO={formik.values.porcentaje_iva_mano_obra}
            porcentajeHerramientas={formik.values.porcentaje_herramientas}
            porcentajeGastosGenerales={formik.values.porcentaje_gastos_generales}
            porcentajeUtilidad={formik.values.porcentaje_utilidad}
            porcentajeImpuestosIT={formik.values.porcentaje_impuestos_it}
          />
        )}

        {/* BOTONES DE NAVEGACIÓN */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 4,
            pt: 3,
            borderTop: 2,
            borderColor: 'divider',
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate('/presupuestos/lista')}
            startIcon={<CloseIcon />}
            disabled={loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancelar
          </Button>

          <Stack direction="row" spacing={2}>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Atrás
              </Button>
            )}

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                }}
              >
                Continuar
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                startIcon={
                  loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />
                }
                onClick={handleGuardarPresupuesto}
                disabled={loading || detallesItems.length === 0}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1.2,
                }}
              >
                {loading
                  ? isEditMode
                    ? 'Actualizando...'
                    : 'Guardando...'
                  : isEditMode
                  ? 'Actualizar Presupuesto'
                  : 'Guardar Presupuesto'}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      {/* SNACKBAR PARA MENSAJES */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PresupuestoForm;