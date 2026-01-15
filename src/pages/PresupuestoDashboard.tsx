// src/pages/PresupuestoDashboard.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Paper,
  Chip,
  Divider,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { useAuth } from '../auth/AuthContext'; 
import PermissionGate from '../components/PermissionGate'; 

// ==========================================
// COMPONENTE
// ==========================================

const PresupuestoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const presupuesto = usePresupuesto();
  const { isProjectManager } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await presupuesto.loadItems({
        all: true,
      });
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await presupuesto.loadItems({
        all: true, 
      });
    } catch (err) {
      console.error('Error al refrescar:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // CÁLCULO DE MÉTRICAS
  // ==========================================

  const totalPresupuestos = presupuesto.items.length; 
  const activosCount = presupuesto.items.filter((p) => p.activo).length;
  const cotizacionesCount = presupuesto.items.filter((p) => p.tipo === 'cotizacion').length;
  const contratosCount = presupuesto.items.filter((p) => p.tipo === 'contrato').length;

  // Calcular monto total
  const montoTotal = presupuesto.items.reduce((sum, p) => sum + p.total_presupuesto, 0);

  // Presupuestos recientes (últimos 6)
  const recientes = [...presupuesto.items]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  // ==========================================
  // UTILIDADES
  // ==========================================

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `Bs ${amount.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Cargando dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Dashboard de Presupuestos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isProjectManager() ? 'Resumen de tus presupuestos' : 'Resumen general de presupuestos'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Tooltip title="Actualizar datos">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                border: 1,
                borderColor: 'divider',
              }}
            >
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>

          {/* Solo ADMIN y PROJECT_MANAGER */}
          <PermissionGate permission="crear_presupuesto">
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('/presupuestos/crear')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
              }}
            >
              Nuevo Presupuesto
            </Button>
          </PermissionGate>
        </Stack>
      </Stack>

      {/* ALERTAS */}
      {presupuesto.error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => presupuesto.setError('')}>
          {presupuesto.error}
        </Alert>
      )}

      {/* ========================================== */}
      {/* MÉTRICAS PRINCIPALES */}
      {/* ========================================== */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Presupuestos */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={1}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />

                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {totalPresupuestos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isProjectManager() ? 'Mis Presupuestos' : 'Total Presupuestos'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Activos */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={1}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />

                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {activosCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Presupuestos Activos
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Cotizaciones */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={1}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <DescriptionIcon sx={{ fontSize: 40, color: 'info.main' }} />

                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {cotizacionesCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cotizaciones
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Contratos */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={1}
            sx={{
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <HandshakeIcon sx={{ fontSize: 40, color: 'warning.main' }} />

                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {contratosCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contratos Firmados
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ========================================== */}
      {/* RESUMEN FINANCIERO */}
      {/* ========================================== */}
      <Card
        elevation={1}
        sx={{
          mb: 4,
          borderLeft: 4,
          borderColor: 'success.main',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Icono */}
            <Grid size={{ xs: 12, md: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  backgroundColor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AttachMoneyIcon sx={{ fontSize: 48, color: 'success.main' }} />
              </Box>
            </Grid>

            {/* Info Principal */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Valor Total en Presupuestos
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatCurrency(montoTotal)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Promedio por presupuesto:{' '}
                <strong>{formatCurrency(totalPresupuestos > 0 ? montoTotal / totalPresupuestos : 0)}</strong>
              </Typography>
            </Grid>

            {/* Distribución */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: 'grey.50',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                  Distribución
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Cotizaciones
                    </Typography>
                    <Chip label={cotizacionesCount} size="small" color="info" />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Contratos
                    </Typography>
                    <Chip label={contratosCount} size="small" color="warning" />
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ========================================== */}
      {/* PRESUPUESTOS RECIENTES */}
      {/* ========================================== */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Actividad Reciente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Últimos presupuestos creados
          </Typography>
        </Box>
        <Button
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/presupuestos/lista')}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Ver todos
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {recientes.length === 0 ? (
          <Grid size={12}>
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                border: 2,
                borderStyle: 'dashed',
                borderColor: 'divider',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No hay presupuestos recientes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isProjectManager() ? 'Crea tu primer presupuesto para comenzar' : 'No hay presupuestos creados aún'}
              </Typography>

              {/* Solo ADMIN y PROJECT_MANAGER */}
              <PermissionGate permission="crear_presupuesto">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/presupuestos/crear')}
                  sx={{ mt: 3, textTransform: 'none', fontWeight: 600 }}
                >
                  Crear Presupuesto
                </Button>
              </PermissionGate>
            </Paper>
          </Grid>
        ) : (
          recientes.map((item) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item.id}>
              <Card
                elevation={1}
                sx={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-2px)',
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => navigate(`/presupuestos/${item.id}`)}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      #{item.id}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={item.tipo_formateado}
                        size="small"
                        color={item.tipo === 'cotizacion' ? 'info' : 'warning'}
                      />
                      <Chip
                        icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                        label={formatDate(item.created_at)}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>

                  {/* Proyecto */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.nombre_proyecto}
                  </Typography>

                  {/* Cliente */}
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.cliente.nombre_completo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CI: {item.cliente.ci}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Monto e Ítems */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: 'grey.50',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                      {formatCurrency(item.total_presupuesto)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.items_count} ítems incluidos
                    </Typography>
                  </Paper>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Footer con acciones */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Chip
                      icon={item.activo ? <CheckCircleIcon /> : undefined}
                      label={item.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={item.activo ? 'success' : 'default'}
                    />

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Ver detalle">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/presupuestos/${item.id}`);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/*  Solo ADMIN y PROJECT_MANAGER */}
                      <PermissionGate permissions={['editar_presupuesto', 'editar_presupuesto_propio']}>
                        <Tooltip title="Editar">
                          <span>
                            <IconButton
                              size="small"
                              color="warning"
                              disabled={!item.activo}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/presupuestos/${item.id}/editar`);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </PermissionGate>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default PresupuestoDashboard;