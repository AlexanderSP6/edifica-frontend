import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Grid,
  Chip,
  MenuItem,
  InputAdornment,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DataTable, { DataTableColumn } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import ModalCliente from '../components/ModalCliente';


import { useCliente } from '../hooks/useCliente';
import { useClienteFilters } from '../hooks/useClienteFilters';

// ==========================================
// INTERFACES
// ==========================================

interface Cliente {
  id: number;
  tipo_cliente: string;
  tipo_cliente_formateado: string;
  ci: string;
  nombre_completo: string;
  telefono: string | null;
  email: string | null;
  activo: boolean;
  presupuestos_count: number;
  created_at: string;
  updated_at: string;
}

interface ClienteFormData {
  tipo_cliente: string;
  ci: string;
  nombre_completo: string;
  telefono?: string;
  email?: string;
}

// ==========================================
// COMPONENTE
// ==========================================

const Clientes: React.FC = () => {
  // Hooks personalizados
  const cliente = useCliente();
  const filters = useClienteFilters();

  // Estados del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [itemEdit, setItemEdit] = useState<Cliente | null>(null);

  // Estados de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => Promise<void>>(() => async () => {});
  const [confirmDescription, setConfirmDescription] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('Confirmar acción');
  const [confirmSeverity, setConfirmSeverity] = useState<'warning' | 'error' | 'info' | 'success'>('warning');
  const [confirmText, setConfirmText] = useState('Confirmar');

  // Cargar items cuando cambian filtros o paginación
  useEffect(() => {
    cliente.loadItems({
      buscar: filters.filters.buscar || undefined,
      tipo_cliente: filters.filters.tipo_cliente || undefined,
      activo: filters.filters.activo || undefined,
      page: cliente.page,
      per_page: cliente.perPage,
    });
  }, [cliente.page, cliente.perPage]);

  // Definir columnas de la tabla
  const columns: DataTableColumn<Cliente>[] = [
    {
      id: 'tipo_cliente_formateado',
      label: 'Tipo',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          color={value === 'Persona Natural' ? 'primary' : 'secondary'}
          sx={{ minWidth: 100 }}
        />
      ),
    },
    {
      id: 'ci',
      label: 'CI',
      minWidth: 120,
      format: (value) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'nombre_completo',
      label: 'Nombre Completo',
      minWidth: 200,
    },
    {
      id: 'telefono',
      label: 'Teléfono',
      minWidth: 100,
      format: (value) => value || '-',
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 150,
      format: (value) => value || '-',
    },
    {
      id: 'presupuestos_count',
      label: 'Presupuestos',
      align: 'center',
      format: (value) => (
        <Chip
          label={value}
          size="small"
          color={value > 0 ? 'success' : 'default'}
          sx={{ minWidth: 50 }}
        />
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
  // HANDLERS DEL MODAL
  // ==========================================

  const handleOpenModal = (item?: Cliente) => {
    if (item) {
      setItemEdit(item);
    } else {
      setItemEdit(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setItemEdit(null);
  };

  const handleSave = async (data: ClienteFormData) => {
    setModalLoading(true);

    try {
      if (itemEdit) {
        await cliente.updateItem(itemEdit.id, data);
      } else {
        await cliente.createItem(data);
      }
      handleCloseModal();
      await cliente.loadItems({
        buscar: filters.filters.buscar || undefined,
        tipo_cliente: filters.filters.tipo_cliente || undefined,
        activo: filters.filters.activo || undefined,
        page: cliente.page,
        per_page: cliente.perPage,
      });
    } catch (err: any) {
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  // ==========================================
  // HANDLERS DE ACCIONES
  // ==========================================

  const handleEdit = (item: Cliente) => {
    handleOpenModal(item);
  };

  const handleToggleEstado = (item: Cliente) => {
    const esActivar = !item.activo;
    setConfirmTitle(esActivar ? 'Activar Cliente' : 'Inactivar Cliente');
    setConfirmSeverity(esActivar ? 'success' : 'warning');
    setConfirmText(esActivar ? 'Activar' : 'Inactivar');
    setConfirmDescription(
      `¿Está seguro que desea ${item.activo ? 'inactivar' : 'activar'} al cliente "${item.nombre_completo}"?`
    );
    setConfirmAction(() => async () => {
      const success = await cliente.toggleEstado(item.id, item.nombre_completo, item.activo);
      if (success) {
        await cliente.loadItems({
          buscar: filters.filters.buscar || undefined,
          tipo_cliente: filters.filters.tipo_cliente || undefined,
          activo: filters.filters.activo !== '' ? filters.filters.activo : undefined,
          page: cliente.page,
          per_page: cliente.perPage,
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

  // ==========================================
  // HANDLERS DE FILTROS
  // ==========================================

  const handleSearch = () => {
    cliente.setPage(1);
    cliente.loadItems({
      buscar: filters.filters.buscar || undefined,
      tipo_cliente: filters.filters.tipo_cliente || undefined,
      activo: filters.filters.activo || undefined,
      page: 1,
      per_page: cliente.perPage,
    });
  };

  const handleReset = () => {
    filters.resetFilters();
    cliente.setPage(1);
    cliente.setPerPage(10);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid size="grow">
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Clientes
          </Typography>
        </Grid>
        <Grid>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
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
            Nuevo Cliente
          </Button>
        </Grid>
      </Grid>

      {/* Alertas */}
      {cliente.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => cliente.setError('')}>
          {cliente.error}
        </Alert>
      )}
      {cliente.success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => cliente.setSuccess('')}>
          {cliente.success}
        </Alert>
      )}

      {/* Filtros */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Campo de búsqueda */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Buscar"
              placeholder="Buscar por nombre o CI..."
              value={filters.filters.buscar}
              onChange={(e) => filters.handleFilterChange('buscar', e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !cliente.loading) handleSearch();
              }}
              disabled={cliente.loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Filtro: Tipo de Cliente */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              select
              size="small"
              label="Tipo"
              value={filters.filters.tipo_cliente}
              onChange={(e) => filters.handleFilterChange('tipo_cliente', e.target.value)}
              disabled={cliente.loading}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="persona">Persona</MenuItem>
              <MenuItem value="empresa">Empresa</MenuItem>
            </TextField>
          </Grid>

          {/* Filtro: Estado (Activo/Inactivo) */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              select
              size="small"
              label="Estado"
              value={filters.filters.activo}
              onChange={(e) => filters.handleFilterChange('activo', e.target.value)}
              disabled={cliente.loading}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="1">Activos</MenuItem>
              <MenuItem value="0">Inactivos</MenuItem>
            </TextField>
          </Grid>

          {/* Selector: Registros por página */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              select
              size="small"
              label="Por página"
              value={cliente.perPage}
              onChange={(e) => {
                cliente.setPerPage(Number(e.target.value));
                cliente.setPage(1);
              }}
              disabled={cliente.loading}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </TextField>
          </Grid>

          {/* Botones de acción */}
          <Grid size={{ xs: 12, sm: 12, md: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
              {/* Botón: Limpiar filtros */}
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                disabled={cliente.loading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderWidth: 2,
                  flex: { xs: 1, md: 0 },
                  minWidth: 100,
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'primary.light',
                    color: 'white',
                  },
                }}
              >
                Limpiar
              </Button>

              {/* Botón: Buscar */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={cliente.loading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  flex: { xs: 1, md: 0 },
                  minWidth: 100,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                {cliente.loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Tabla */}
      <DataTable<Cliente>
        columns={columns}
        data={cliente.items}
        loading={cliente.loading}
        page={cliente.page}
        totalPages={cliente.totalPages}
        totalRecords={cliente.totalRecords}
        perPage={cliente.perPage}
        onPageChange={cliente.setPage}
        onEdit={handleEdit}
        onToggle={handleToggleEstado}
        getRowId={(row) => row.id}
        getRowActive={(row) => row.activo}
        emptyMessage="No se encontraron clientes"
        showIndex={true}
        showEdit={true}
        showToggle={true}
        showDelete={false}
      />

      {/* Modal de Formulario */}
      <ModalCliente
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        itemEdit={itemEdit}
        loading={modalLoading}
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


export default Clientes;