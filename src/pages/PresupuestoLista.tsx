// src/pages/PresupuestoLista.tsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import DataTable, { DataTableColumn, DataTableAction } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import PresupuestoFilters from '../components/PresupuestoFilters';
import PermissionGate from '../components/PermissionGate';

import { useAuth } from '../auth/AuthContext';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { usePresupuestoFilters } from '../hooks/usePresupuestoFilters';
import { useCliente } from '../hooks/useCliente';
import type { Presupuesto } from '../types/presupuesto.types';

import { usePDFExport } from '../hooks/usePDFExport';
import { presupuestosPDFConfig, transformPresupuestosForPDF } from '../utils/pdf/presupuestosPDF';
import { FileDownload } from '@mui/icons-material';

// ==========================================
// COMPONENTE
// ==========================================

const PresupuestoLista: React.FC = () => {
  const navigate = useNavigate();
  const presupuesto = usePresupuesto();
  const filters = usePresupuestoFilters();
  const cliente = useCliente();
  const { isExporting, exportError, exportData } = usePDFExport();
  const { hasPermission, hasAnyPermission } = useAuth();
  
  // Estados de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});
  const [confirmDescription, setConfirmDescription] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('Confirmar acción');
  const [confirmSeverity, setConfirmSeverity] = useState<'warning' | 'error' | 'info' | 'success'>('warning');
  const [confirmText, setConfirmText] = useState('Confirmar');

  // ==========================================
  // EFFECTS
  // ==========================================

  // Cargar clientes
  useEffect(() => {
    const loadClientes = async () => {
      await cliente.loadItems({
        all: true,
        activo: '1',
      });
    };
    loadClientes();
  }, []);

  // Cargar presupuestos
  useEffect(() => {
    presupuesto.loadItems({
      buscar: filters.filters.buscar || undefined,
      cliente_id: filters.filters.cliente_id || undefined,
      tipo: filters.filters.tipo || undefined,
      fecha_desde: filters.filters.fecha_desde || undefined,
      fecha_hasta: filters.filters.fecha_hasta || undefined,
      activo: filters.filters.activo || undefined,
      page: presupuesto.page,
      perPage: presupuesto.perPage,
    });
  }, [presupuesto.page, presupuesto.perPage]);

  // ==========================================
  // COLUMNAS
  // ==========================================

  const columns: DataTableColumn<Presupuesto>[] = [
    {
      id: 'nombre_proyecto',
      label: 'Proyecto',
      minWidth: 200,
    },
    {
      id: 'cliente',
      label: 'Cliente',
      minWidth: 150,
      format: (value) => (
        <>
          <Typography variant="body2">{value.nombre_completo}</Typography>
          <Typography variant="caption" color="text.secondary">
            CI: {value.ci}
          </Typography>
        </>
      ),
    },
    {
      id: 'tipo_formateado',
      label: 'Tipo',
      align: 'center',
      format: (value, row) => (
        <Chip
          label={value}
          size="small"
          color={row.tipo === 'cotizacion' ? 'info' : 'warning'}
          sx={{ minWidth: 90 }}
        />
      ),
    },
    {
      id: 'fecha_emision',
      label: 'Fecha',
      align: 'center',
      format: (value) => {
        if (!value) return '-';
        return format(parseISO(value), 'dd/MM/yyyy');
      },
    },
    {
      id: 'total_presupuesto',
      label: 'Total',
      align: 'right',
      format: (value) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
          Bs {value.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      id: 'items_count',
      label: 'Ítems',
      align: 'center',
      format: (value) => (
        <Chip label={value} size="small" color="default" sx={{ minWidth: 50 }} />
      ),
    },
    {
      id: 'activo',
      label: 'Estado',
      align: 'center',
      format: (value) => (
        <Chip
          label={value ? 'Activo' : 'Inactivo'}
          color={value ? 'success' : 'default'}
          size="small"
          sx={{ minWidth: 70 }}
        />
      ),
    },
  ];

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleView = (item: Presupuesto) => {
    navigate(`/presupuestos/${item.id}`);
  };

  const handleEdit = (item: Presupuesto) => {
    navigate(`/presupuestos/${item.id}/editar`);
  };

  const handleToggleEstado = (item: Presupuesto) => {
    const esActivar = !item.activo;
    setConfirmTitle(esActivar ? 'Activar Presupuesto' : 'Inactivar Presupuesto');
    setConfirmSeverity(esActivar ? 'success' : 'warning');
    setConfirmText(esActivar ? 'Activar' : 'Inactivar');
    setConfirmDescription(
      `¿Está seguro que desea ${item.activo ? 'inactivar' : 'activar'} el presupuesto "${item.nombre_proyecto}"?`
    );
    setConfirmAction(() => async () => {
      const success = await presupuesto.toggleEstado(item);
      if (success) {
        await presupuesto.loadItems({
          buscar: filters.filters.buscar || undefined,
          cliente_id: filters.filters.cliente_id || undefined,
          tipo: filters.filters.tipo || undefined,
          fecha_desde: filters.filters.fecha_desde || undefined,
          fecha_hasta: filters.filters.fecha_hasta || undefined,
          activo: filters.filters.activo !== '' ? filters.filters.activo : undefined,
          page: presupuesto.page,
          perPage: presupuesto.perPage,
        });
      }
    });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    try {
      await confirmAction();
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
    }
  };

  const handleCloseConfirm = () => {
    if (!confirmLoading) {
      setConfirmOpen(false);
    }
  };

  const handleSearch = () => {
    presupuesto.setPage(1);
    presupuesto.loadItems({
      buscar: filters.filters.buscar || undefined,
      cliente_id: filters.filters.cliente_id || undefined,
      tipo: filters.filters.tipo || undefined,
      fecha_desde: filters.filters.fecha_desde || undefined,
      fecha_hasta: filters.filters.fecha_hasta || undefined,
      activo: filters.filters.activo || undefined,
      page: 1,
      perPage: presupuesto.perPage,
    });
  };

  const handleReset = () => {
    filters.resetFilters();
    presupuesto.setPage(1);
    presupuesto.setPerPage(10);
  };

  const handleExportPDF = async () => {
    const allItems = await presupuesto.loadAllItems({
      buscar: filters.filters.buscar || undefined,
      cliente_id: filters.filters.cliente_id || undefined,
      tipo: filters.filters.tipo || undefined,
      fecha_desde: filters.filters.fecha_desde || undefined,
      fecha_hasta: filters.filters.fecha_hasta || undefined,
      activo: filters.filters.activo || undefined,
    });

    if (allItems.length === 0) {
      presupuesto.setError('No hay datos para exportar');
      return;
    }

    const dataForPDF = transformPresupuestosForPDF(allItems);
    const appliedFilters: Record<string, string> = {};

    if (filters.filters.buscar) {
      appliedFilters.buscar = filters.filters.buscar;
    }
    if (filters.filters.cliente_id) {
      const clienteSeleccionado = cliente.items.find(c => c.id === filters.filters.cliente_id);
      appliedFilters.cliente = clienteSeleccionado?.nombre_completo || `ID: ${filters.filters.cliente_id}`;
    }
    if (filters.filters.tipo) {
      appliedFilters.tipo = filters.filters.tipo === 'cotizacion' ? 'Cotización' : 'Contrato';
    }
    if (filters.filters.fecha_desde) {
      appliedFilters.fecha_desde = new Date(filters.filters.fecha_desde).toLocaleDateString('es-BO');
    }
    if (filters.filters.fecha_hasta) {
      appliedFilters.fecha_hasta = new Date(filters.filters.fecha_hasta).toLocaleDateString('es-BO');
    }
    if (filters.filters.activo) {
      appliedFilters.estado = filters.filters.activo === 'true' ? 'Activos' : 'Inactivos';
    }

    const success = await exportData(presupuestosPDFConfig, dataForPDF, appliedFilters);

    if (success) {
      presupuesto.setSuccess(`PDF generado exitosamente con ${allItems.length} registros`);
    } else {
      presupuesto.setError(exportError || 'Error al generar PDF');
    }
  };


  const customActions:
  DataTableAction<Presupuesto>[] = [
    // Ver detalle: TODOS (ADMIN, PROJECT_MANAGER, ASISTENTE)
    {
      icon: <VisibilityIcon fontSize="small" />,
      label: 'Ver detalle',
      color: 'info' ,
      onClick: handleView,
    },
  ];

  // Editar: Solo ADMIN y PROJECT_MANAGER (NO ASISTENTE)
  if (hasAnyPermission(['editar_presupuesto', 'editar_presupuesto_propio'])) {
    customActions.push({
      icon: <EditIcon fontSize="small" />,
      label: 'Editar',
      color: 'warning',
      onClick: handleEdit,
    });
  }

  // Toggle estado: Solo ADMIN (NO PROJECT_MANAGER ni ASISTENTE)
  if (hasPermission('toggle_presupuesto')) {
    customActions.push({
      icon: <ToggleOffIcon fontSize="small" />,
      label: 'Cambiar estado',
      color: 'success',
      onClick: handleToggleEstado,
    });
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid size="grow">
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Presupuestos
          </Typography>
        </Grid>
        <Grid>
          <Box display="flex" gap={2}>
            {/* Nuevo Presupuesto: Solo ADMIN y PROJECT_MANAGER */}
            <PermissionGate permission="crear_presupuesto">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/presupuestos/crear')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                Nuevo Presupuesto
              </Button>
            </PermissionGate>

            {/* Exportar PDF: TODOS */}
            <PermissionGate permission="generar_pdf_presupuesto">
              <Button
                variant="outlined"
                color="error"
                startIcon={
                  isExporting ? (
                    <CircularProgress size={20} color="error" />
                  ) : (
                    <FileDownload />
                  )
                }
                onClick={handleExportPDF}
                disabled={isExporting || presupuesto.loading || presupuesto.items.length === 0}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2.5,
                  transition: 'all 0.2s ease'
                }}
              >
                {isExporting ? 'Generando PDF...' : 'Exportar PDF'}
              </Button>
            </PermissionGate>
          </Box>
        </Grid>
      </Grid>

      {/* Alertas */}
      {presupuesto.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => presupuesto.setError('')}>
          {presupuesto.error}
        </Alert>
      )}
      {presupuesto.success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => presupuesto.setSuccess('')}>
          {presupuesto.success}
        </Alert>
      )}

      {!cliente.loading && cliente.items.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No hay clientes activos disponibles. Debe crear al menos un cliente antes de crear presupuestos.
        </Alert>
      )}

      {/* Filtros */}
      <PresupuestoFilters
        filters={filters.filters}
        clientes={cliente.items}
        perPage={presupuesto.perPage}
        loading={presupuesto.loading || cliente.loading}
        onFilterChange={filters.handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
        onPerPageChange={(value) => {
          presupuesto.setPerPage(value);
          presupuesto.setPage(1);
        }}
      />

      {/* Tabla */}
      <DataTable<Presupuesto>
        columns={columns}
        data={presupuesto.items}
        loading={presupuesto.loading}
        page={presupuesto.page}
        totalPages={presupuesto.totalPages}
        totalRecords={presupuesto.totalRecords}
        perPage={presupuesto.perPage}
        onPageChange={presupuesto.setPage}
        getRowId={(row) => row.id}
        getRowActive={(row) => row.activo}
        emptyMessage="No se encontraron presupuestos"
        showIndex={true}
        showEdit={false}
        showToggle={false}
        showDelete={false}
        customActions={customActions}
      />

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        severity={confirmSeverity}
        confirmText={confirmText}
        onConfirm={handleConfirm}
        onClose={handleCloseConfirm}
        loading={confirmLoading}
      />
    </Box>
  );
};

export default PresupuestoLista;