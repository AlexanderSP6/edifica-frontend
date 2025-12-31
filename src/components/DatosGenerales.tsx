import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Autocomplete,
  Typography,
  Stack,
  Grid,
  InputAdornment,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import PercentIcon from '@mui/icons-material/Percent';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { FormikProps } from 'formik';
import type { Cliente, PresupuestoFormValues } from '../types/presupuesto.types';

// ==========================================
// INTERFACES
// ==========================================

interface DatosGeneralesProps {
  formik: FormikProps<PresupuestoFormValues>;
  clientes: Cliente[];
  clienteSeleccionado?: Cliente;
  onClienteChange: (cliente: Cliente | null) => void;
}

// ==========================================
// COMPONENTE
// ==========================================

export const DatosGenerales: React.FC<DatosGeneralesProps> = ({
  formik,
  clientes,
  clienteSeleccionado,
  onClienteChange,
}) => {
  const [expandedB2, setExpandedB2] = useState(false);

  return (
    <Box>
      {/* ========================================== */}
      {/* DATOS DEL CLIENTE */}
      {/* ========================================== */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <PersonIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Datos del Cliente
        </Typography>
      </Stack>

      <Card
        elevation={1}
        sx={{
          mb: 4,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Autocomplete
            options={clientes}
            getOptionLabel={(option) => `${option.nombre_completo} (${option.ci})`}
            value={clienteSeleccionado || null}
            onChange={(_, newValue) => onClienteChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar cliente"
                placeholder="Escriba nombre o CI..."
                error={formik.touched.cliente_id && Boolean(formik.errors.cliente_id)}
                helperText={formik.touched.cliente_id && (formik.errors.cliente_id as string)}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'action.active' }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />

          {clienteSeleccionado && (
            <Alert
              icon={<CheckCircleIcon />}
              severity="info"
              sx={{
                backgroundColor: '#e3f2fd',
                '& .MuiAlert-icon': {
                  color: 'primary.main',
                },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Cliente Seleccionado
              </Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Nombre Completo
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {clienteSeleccionado.nombre_completo}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Carnet de Identidad
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {clienteSeleccionado.ci}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Correo Electrónico
                  </Typography>
                  <Typography variant="body2">{clienteSeleccionado.email || '-'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Teléfono
                  </Typography>
                  <Typography variant="body2">{clienteSeleccionado.telefono || '-'}</Typography>
                </Grid>
              </Grid>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ========================================== */}
      {/* DATOS DEL PROYECTO */}
      {/* ========================================== */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <FolderIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Datos del Proyecto
        </Typography>
      </Stack>

      <Card
        elevation={1}
        sx={{
          mb: 4,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Nombre del Proyecto"
                name="nombre_proyecto"
                value={formik.values.nombre_proyecto}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nombre_proyecto && Boolean(formik.errors.nombre_proyecto)}
                helperText={formik.touched.nombre_proyecto && (formik.errors.nombre_proyecto as string)}
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Ubicación de la Obra"
                name="ubicacion_obra"
                value={formik.values.ubicacion_obra}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.ubicacion_obra && Boolean(formik.errors.ubicacion_obra)}
                helperText={formik.touched.ubicacion_obra && (formik.errors.ubicacion_obra as string)}
                placeholder="Ej: Zona Sur, Calacoto, La Paz"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Tipo de Presupuesto"
                name="tipo"
                value={formik.values.tipo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.tipo && Boolean(formik.errors.tipo)}
                helperText={formik.touched.tipo && (formik.errors.tipo as string)}
                required
              >
                <MenuItem value="cotizacion">Cotización</MenuItem>
                <MenuItem value="contrato">Contrato</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Fecha de Emisión"
                name="fecha_emision"
                value={formik.values.fecha_emision}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fecha_emision && Boolean(formik.errors.fecha_emision)}
                helperText={formik.touched.fecha_emision && (formik.errors.fecha_emision as string)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ========================================== */}
      {/* PORCENTAJES FORMULARIO B-2 */}
      {/* ========================================== */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <PercentIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Configuración Porcentajes
        </Typography>
        <Chip 
          label="Por defecto" 
          size="small" 
          color="info" 
          variant="outlined"
        />
      </Stack>

      <Card
        elevation={1}
        sx={{
          borderLeft: 3,
          borderColor: 'primary.main',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Accordion 
            expanded={expandedB2}
            onChange={() => setExpandedB2(!expandedB2)}
            elevation={0}
            sx={{
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 3,
                py: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Cálculo porcentual de los precios unitarios
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {expandedB2 ? 'Clic para ocultar' : 'Haga clic para configurar los porcentajes del formulario'}
                  </Typography>
                </Box>
                <Chip 
                  label={expandedB2 ? 'Configurando' : 'Porcentajes establecidos'}
                  size="small"
                  color={expandedB2 ? 'primary' : 'default'}
                />
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 3, pb: 3 }}>
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ mb: 3 }}
              >
                Los porcentajes por defecto responden al marco de referencia utilizado en proyectos de construcción. 
                Puede modificarlos si el proyecto requiere valores diferentes.
              </Alert>

              <Grid container spacing={2.5}>
                {/* SECCIÓN 2: MANO DE OBRA */}
                <Grid size={12}>
                  <Divider textAlign="left" sx={{ mb: 2 }}>
                    <Chip label="Sección 2: Mano de Obra" size="small" color="primary" />
                  </Divider>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cargas Sociales"
                    name="porcentaje_cargas_sociales"
                    value={formik.values.porcentaje_cargas_sociales}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.porcentaje_cargas_sociales &&
                      Boolean(formik.errors.porcentaje_cargas_sociales)
                    }
                    helperText={
                      formik.touched.porcentaje_cargas_sociales &&
                      (formik.errors.porcentaje_cargas_sociales as string)
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ step: '0.01', min: '0', max: '100' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="IVA Mano de Obra"
                    name="porcentaje_iva_mano_obra"
                    value={formik.values.porcentaje_iva_mano_obra}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.porcentaje_iva_mano_obra &&
                      Boolean(formik.errors.porcentaje_iva_mano_obra)
                    }
                    helperText={
                      formik.touched.porcentaje_iva_mano_obra &&
                      (formik.errors.porcentaje_iva_mano_obra as string)
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ step: '0.01', min: '0', max: '100' }}
                  />
                </Grid>

                {/* SECCIÓN 3: EQUIPO */}
                <Grid size={12}>
                  <Divider textAlign="left" sx={{ my: 2 }}>
                    <Chip label="Sección 3: Equipo y Herramientas" size="small" color="primary" />
                  </Divider>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Herramientas"
                    name="porcentaje_herramientas"
                    value={formik.values.porcentaje_herramientas}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.porcentaje_herramientas &&
                      Boolean(formik.errors.porcentaje_herramientas)
                    }
                    helperText={
                      formik.touched.porcentaje_herramientas &&
                      (formik.errors.porcentaje_herramientas as string)
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ step: '0.01', min: '0', max: '100' }}
                  />
                </Grid>

                {/* SECCIÓN 4-6: GASTOS, UTILIDAD, IT */}
                <Grid size={12}>
                  <Divider textAlign="left" sx={{ my: 2 }}>
                    <Chip label="Secciones 4-6: Gastos, Utilidad e Impuestos" size="small" color="primary" />
                  </Divider>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Gastos Generales"
                    name="porcentaje_gastos_generales"
                    value={formik.values.porcentaje_gastos_generales}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.porcentaje_gastos_generales &&
                      Boolean(formik.errors.porcentaje_gastos_generales)
                    }
                    helperText={
                      formik.touched.porcentaje_gastos_generales &&
                      (formik.errors.porcentaje_gastos_generales as string)
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ step: '0.01', min: '0', max: '100' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Utilidad"
                    name="porcentaje_utilidad"
                    value={formik.values.porcentaje_utilidad}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.porcentaje_utilidad &&
                      Boolean(formik.errors.porcentaje_utilidad)
                    }
                    helperText={
                      formik.touched.porcentaje_utilidad &&
                      (formik.errors.porcentaje_utilidad as string)
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ step: '0.01', min: '0', max: '100' }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Impuestos IT"
                    name="porcentaje_impuestos_it"
                    value={formik.values.porcentaje_impuestos_it}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.porcentaje_impuestos_it &&
                      Boolean(formik.errors.porcentaje_impuestos_it)
                    }
                    helperText={
                      formik.touched.porcentaje_impuestos_it &&
                      (formik.errors.porcentaje_impuestos_it as string)
                    }
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    inputProps={{ step: '0.01', min: '0', max: '100' }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </Box>
  );
};