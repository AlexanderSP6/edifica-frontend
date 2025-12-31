import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  CircularProgress,
  Stack,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConstructionIcon from '@mui/icons-material/Construction';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate, useParams } from 'react-router-dom';
import { usePresupuesto } from '../hooks/usePresupuesto';
import GenerarPDFFormularioB2 from '../components/GenerarPDFFormularioB2';
import GenerarPDFFormularioB1 from '../components/GenerarPDFFormularioB1';
import type { PresupuestoCompleto } from '../types/presupuesto.types';
import PermissionGate from '../components/PermissionGate'; 

// ==========================================
// COMPONENTE
// ==========================================

const PresupuestoView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const presupuesto = usePresupuesto();

  const [data, setData] = useState<PresupuestoCompleto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPresupuesto();
  }, [id]);

  const loadPresupuesto = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await presupuesto.loadById(Number(id));
      console.log('Presupuesto cargado:', response);
      console.log('Tiene total_materiales?', response.total_materiales);
      console.log('Tiene total_presupuesto?', response.total_presupuesto);
      setData(response);
    } catch (err) {
      console.error('Error al cargar presupuesto:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'Bs 0.00';
    }
    return `Bs ${amount.toLocaleString('es-BO', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00%';
    }
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Presupuesto no encontrado</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>

      {/* ========================================== */}
      {/* HEADER CON BOTONES */}
      {/* ========================================== */}
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ mb: 3 }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/presupuestos/lista')}
          variant="outlined"
          sx={{ 
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Volver
        </Button>
        {/*FORMULARIO B-1 */}
        <GenerarPDFFormularioB1 
          presupuestoId={data.id}
           variant="outlined"
            size="medium"
        />
        {/*FORMULARIO B-2 */}
        <PermissionGate permissions={['editar_presupuesto', 'editar_presupuesto_propio']}>
        <GenerarPDFFormularioB2 
          presupuestoId={data.id} 
          variant="contained"
          size="medium"
        />
        </PermissionGate>
      </Stack>

      {/* ========================================== */}
      {/* TÍTULO Y CHIPS */}
      {/* ========================================== */}
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between" 
        flexWrap="wrap" 
        gap={2} 
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <DescriptionIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              Presupuesto NRO° {data.id}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {data.nombre_proyecto}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={data.activo ? <CheckCircleIcon /> : <CancelIcon />}
            label={data.activo ? 'Activo' : 'Inactivo'}
            color={data.activo ? 'success' : 'default'}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={data.tipo_formateado}
            color={data.tipo === 'cotizacion' ? 'info' : 'warning'}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<CalendarTodayIcon />}
            label={formatDate(data.fecha_emision)}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Stack>

      {/* ALERTAS */}
      {presupuesto.error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => presupuesto.setError('')}>
          {presupuesto.error}
        </Alert>
      )}
      {presupuesto.success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => presupuesto.setSuccess('')}>
          {presupuesto.success}
        </Alert>
      )}

      {/* ========================================== */}
      {/* INFORMACIÓN GENERAL - CLIENTE Y PROYECTO */}
      {/* ========================================== */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* CLIENTE */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            elevation={1}
            sx={{
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <PersonIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Cliente
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {data.cliente.nombre_completo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CI: {data.cliente.ci}
                  </Typography>
                </Box>

                <Chip
                  label={data.cliente.tipo_cliente === 'persona' ? 'Persona Natural' : 'Empresa'}
                  size="small"
                  color="primary"
                  sx={{ alignSelf: 'flex-start' }}
                />

                <Divider />

                <Stack spacing={1.5}>
                  {data.cliente.email && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EmailIcon sx={{ fontSize: 18, color: 'action.active' }} />
                      <Typography variant="body2">{data.cliente.email}</Typography>
                    </Stack>
                  )}

                  {data.cliente.telefono && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneIcon sx={{ fontSize: 18, color: 'action.active' }} />
                      <Typography variant="body2">{data.cliente.telefono}</Typography>
                    </Stack>
                  )}

                  {!data.cliente.email && !data.cliente.telefono && (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Sin información de contacto
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* PROYECTO */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            elevation={1}
            sx={{
              height: '100%',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <FolderIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Proyecto
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {data.nombre_proyecto}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={data.tipo_formateado}
                      size="small"
                      color={data.tipo === 'cotizacion' ? 'info' : 'warning'}
                    />
                    <Chip
                      icon={data.activo ? <CheckCircleIcon /> : <CancelIcon />}
                      label={data.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={data.activo ? 'success' : 'default'}
                    />
                  </Stack>
                </Box>

                <Divider />

                <Stack spacing={1.5}>
                  {data.ubicacion_obra && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocationOnIcon sx={{ fontSize: 18, color: 'action.active' }} />
                      <Typography variant="body2" color="text.secondary">
                        Ubicación
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {data.ubicacion_obra}
                      </Typography>
                    </Stack>
                  )}

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarTodayIcon sx={{ fontSize: 18, color: 'action.active' }} />
                    <Typography variant="body2" color="text.secondary">
                      Fecha de Emisión
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDate(data.fecha_emision)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CategoryIcon sx={{ fontSize: 18, color: 'action.active' }} />
                    <Typography variant="body2" color="text.secondary">
                      Ítems Incluidos
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {data.detalles.length}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ========================================== */}
      {/* TABLA DE ÍTEMS */}
      {/* ========================================== */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <DescriptionIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Detalle de Ítems
        </Typography>
        <Chip 
          label={`${data.detalles.length} ${data.detalles.length === 1 ? 'ítem' : 'ítems'}`} 
          size="small" 
          color="primary"
        />
      </Stack>

      <TableContainer 
        component={Paper} 
        elevation={1} 
        sx={{ 
          mb: 4,
          border: 1,
          borderColor: 'divider'
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '50px' }}>#</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '120px' }}>Código</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '100px' }} align="center">
                Unidad
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '120px' }} align="right">
                Cantidad
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                P. Unitario
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                Subtotal
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.detalles.map((detalle, index) => (
              <TableRow 
                key={detalle.id}
                hover
                sx={{
                  backgroundColor: index % 2 === 0 ? 'white' : 'grey.50',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                <TableCell 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontWeight: 700,
                    color: 'primary.main'
                  }}
                >
                  {detalle.apu_item.codigo}
                </TableCell>
                <TableCell>{detalle.apu_item.descripcion}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={detalle.apu_item.unidad.codigo} 
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {detalle.cantidad.toLocaleString('es-BO', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4 
                  })}
                </TableCell>
                <TableCell align="right">{formatCurrency(detalle.precio_unitario)}</TableCell>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'primary.main',
                    fontSize: '0.95rem'
                  }}
                >
                  {formatCurrency(detalle.subtotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ========================================== */}
      {/* DESGLOSE FORMULARIO  */}
      {/* ========================================== */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <AttachMoneyIcon sx={{ color: 'success.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Presupuesto Total  
        </Typography>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* COLUMNA IZQUIERDA - DETALLES */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            
            {/* SECCIÓN 1: MATERIALES */}
            <Paper elevation={1} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <ConstructionIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  1. MATERIALES
                </Typography>
                {data.desglose && (
                  <Chip 
                    label={formatPercentage(data.desglose.materiales.porcentaje)} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 'auto' }}
                  />
                )}
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatCurrency(data.total_materiales)}
              </Typography>
              {data.desglose && (
                <LinearProgress 
                  variant="determinate" 
                  value={data.desglose.materiales.porcentaje} 
                  sx={{ 
                    mt: 1.5,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'primary.100',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'primary.main',
                    }
                  }}
                />
              )}
            </Paper>

            {/* SECCIÓN 2: MANO DE OBRA */}
            <Paper elevation={1} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <PeopleIcon sx={{ fontSize: 20, color: 'info.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  2. MANO DE OBRA
                </Typography>
                {data.desglose && (
                  <Chip 
                    label={formatPercentage(data.desglose.mano_obra.porcentaje)} 
                    size="small" 
                    color="info"
                    sx={{ ml: 'auto' }}
                  />
                )}
              </Stack>

              <Stack spacing={1} sx={{ mb: 1.5 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Subtotal Mano Obra
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(data.subtotal_mano_obra)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    + Cargas Sociales ({formatPercentage(data.porcentaje_cargas_sociales)})
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(data.monto_cargas_sociales)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    + IVA ({formatPercentage(data.porcentaje_iva_mano_obra)})
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(data.monto_iva_mano_obra)}
                  </Typography>
                </Stack>

                <Divider />
              </Stack>

              <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                {formatCurrency(data.total_mano_obra)}
              </Typography>

              {data.desglose && (
                <LinearProgress 
                  variant="determinate" 
                  value={data.desglose.mano_obra.porcentaje} 
                  sx={{ 
                    mt: 1.5,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'info.100',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'info.main',
                    }
                  }}
                />
              )}
            </Paper>

            {/* SECCIÓN 3: EQUIPO */}
            <Paper elevation={1} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <BuildIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  3. EQUIPO Y HERRAMIENTAS
                </Typography>
                {data.desglose && (
                  <Chip 
                    label={formatPercentage(data.desglose.equipo.porcentaje)} 
                    size="small" 
                    color="warning"
                    sx={{ ml: 'auto' }}
                  />
                )}
              </Stack>

              <Stack spacing={1} sx={{ mb: 1.5 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Equipo Base
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(data.total_equipo_base)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    + Herramientas ({formatPercentage(data.porcentaje_herramientas)})
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(data.monto_herramientas)}
                  </Typography>
                </Stack>

                <Divider />
              </Stack>

              <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {formatCurrency(data.total_equipo)}
              </Typography>

              {data.desglose && (
                <LinearProgress 
                  variant="determinate" 
                  value={data.desglose.equipo.porcentaje} 
                  sx={{ 
                    mt: 1.5,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'warning.100',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'warning.main',
                    }
                  }}
                />
              )}
            </Paper>

            {/* SECCIONES 4-6 COMPACTAS */}
            <Paper elevation={1} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
              <Stack spacing={1.5}>
                {/* Gastos Generales */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    4. Gastos Generales ({formatPercentage(data.porcentaje_gastos_generales)})
                  </Typography>
                  {data.desglose && (
                    <Chip 
                      label={formatPercentage(data.desglose.gastos_generales.porcentaje)} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                  <Typography variant="body1" sx={{ fontWeight: 700, minWidth: 130, textAlign: 'right' }}>
                    {formatCurrency(data.monto_gastos_generales)}
                  </Typography>
                </Stack>

                <Divider />

                {/* Utilidad */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    5. Utilidad ({formatPercentage(data.porcentaje_utilidad)})
                  </Typography>
                  {data.desglose && (
                    <Chip 
                      label={formatPercentage(data.desglose.utilidad.porcentaje)} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                  <Typography variant="body1" sx={{ fontWeight: 700, minWidth: 130, textAlign: 'right' }}>
                    {formatCurrency(data.monto_utilidad)}
                  </Typography>
                </Stack>

                <Divider />

                {/* Impuestos IT */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccountBalanceIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                    6. Impuestos IT ({formatPercentage(data.porcentaje_impuestos_it)})
                  </Typography>
                  {data.desglose && (
                    <Chip 
                      label={formatPercentage(data.desglose.impuestos_it.porcentaje)} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                  <Typography variant="body1" sx={{ fontWeight: 700, minWidth: 130, textAlign: 'right' }}>
                    {formatCurrency(data.monto_impuestos_it)}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* COLUMNA DERECHA - TOTAL */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card 
            elevation={3}
            sx={{ 
              position: 'sticky',
              top: 20,
              background: 'linear-gradient(135deg, #6d2838ff 0%, #A63C55 100%)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3} alignItems="center">
                <AttachMoneyIcon sx={{ fontSize: 64, color: 'white', opacity: 0.9 }} />
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="overline" 
                    sx={{ 
                      color: 'white',
                      opacity: 0.9,
                      letterSpacing: 2,
                      fontSize: '0.9rem'
                    }}
                  >
                    TOTAL PRESUPUESTO
                  </Typography>
                  
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'white',
                      mt: 1,
                      mb: 2
                    }}
                  >
                    {formatCurrency(data.total_presupuesto)}
                  </Typography>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', my: 2 }} />

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'white',
                      opacity: 0.9,
                      lineHeight: 1.6
                    }}
                  >
                    Incluye IVA, Cargas Sociales, Gastos Generales, 
                    Utilidad e Impuestos según Formulario B-2
                  </Typography>
                </Box>

                {/* PORCENTAJES APLICADOS */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    width: '100%',
                    p: 2,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'white',
                      opacity: 0.9,
                      fontWeight: 600,
                      display: 'block',
                      mb: 1
                    }}
                  >
                    PORCENTAJES APLICADOS:
                  </Typography>
                  
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                        Cargas Sociales:
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {formatPercentage(data.porcentaje_cargas_sociales)}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                        IVA Mano Obra:
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {formatPercentage(data.porcentaje_iva_mano_obra)}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                        Herramientas:
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {formatPercentage(data.porcentaje_herramientas)}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                        Gastos Generales:
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {formatPercentage(data.porcentaje_gastos_generales)}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                        Utilidad:
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {formatPercentage(data.porcentaje_utilidad)}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" sx={{ color: 'white', opacity: 0.8 }}>
                        Impuestos IT:
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {formatPercentage(data.porcentaje_impuestos_it)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PresupuestoView;