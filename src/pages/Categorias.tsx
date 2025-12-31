import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Pagination,
  Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

import ModalCategoria from '../components/ModalCategoria';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  toggleCategoriaEstado,
} from '../services/categoriaService';

interface Categoria {
  id: number;
  nombre: string;
  activo: boolean;
  apu_items_count?: number;
  created_at: string;
  updated_at: string;
}

interface CategoriaFormData {
  nombre: string;
}

const Categorias: React.FC = () => {
  // ==================== ESTADO ====================
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  
  // Paginación
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filtros
  const [filters, setFilters] = useState({
    buscar: '',
    activo: 'all',
    fecha_desde: null as Date | null,
    fecha_hasta: null as Date | null,
  });

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState<Categoria | null>(null);

  // Diálogos de confirmación
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '' as 'toggle',
    categoria: null as Categoria | null,
    loading: false,
  });

  // Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ==================== EFECTOS ====================
  useEffect(() => {
    loadCategorias();
  }, [page, perPage, filters]);

  // ==================== FUNCIONES ====================
  
  // Cargar categorías
  const loadCategorias = async () => {
    setLoading(true);
    try {
      const params = {
        page: page,
        per_page: perPage,
        buscar: filters.buscar || undefined,
        activo: filters.activo !== 'all' ? filters.activo : undefined,
        fecha_desde: filters.fecha_desde ? format(filters.fecha_desde, 'yyyy-MM-dd') : undefined,
        fecha_hasta: filters.fecha_hasta ? format(filters.fecha_hasta, 'yyyy-MM-dd') : undefined,
      };

      const response = await getCategorias(params);
      
      if (response.data.success) {
        setCategorias(response.data.data);
        setTotalRows(response.data.meta?.total || 0);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setCategoriaEdit(null);
    setModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (categoria: Categoria) => {
    setCategoriaEdit(categoria);
    setModalOpen(true);
  };

  // Guardar (crear o editar)
  const handleSave = async (data: CategoriaFormData) => {
  setModalLoading(true);
  try {
    if (categoriaEdit) {
      await updateCategoria(categoriaEdit.id, data);
      setSuccess('Categoría actualizada exitosamente');
    } else {
      await createCategoria(data);
      setSuccess('Categoría creada exitosamente');
    }
    
    setModalOpen(false);
    await loadCategorias(); 
  } catch (error: any) {
    throw error;
  } finally {
    setModalLoading(false);
  }
};

  // Abrir diálogo de toggle estado
  const handleToggleClick = (categoria: Categoria) => {
    setConfirmDialog({
      open: true,
      type: 'toggle',
      categoria,
      loading: false,
    });
  };

  // Confirmar toggle estado
  const handleToggleConfirm = async () => {
    if (!confirmDialog.categoria) return;

    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await toggleCategoriaEstado(confirmDialog.categoria.id);
      const action = confirmDialog.categoria.activo ? 'inactivada' : 'activada';
      setSuccess(`Categoría ${action} exitosamente`);
      
      setConfirmDialog({ open: false, type: 'toggle', categoria: null, loading: false });
      loadCategorias();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al cargar categorías');
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  // Manejar búsqueda
  const handleSearch = () => {
    setPage(1);
    loadCategorias();
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      buscar: '',
      activo: 'all',
      fecha_desde: null,
      fecha_hasta: null,
    });
    setPage(1);
  };

  // Cambiar página
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };


  // Formatear fecha
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return '-';
    }
  };

  // Calcular total de páginas
  const totalPages = Math.ceil(totalRows / perPage);

  // ==================== RENDER ====================
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box sx={{ p: 3 }}>
        {/* Encabezado */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
              Gestión de Categorías
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreate}
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
              Nueva Categoría
            </Button>
          </Box>
              {/* Alertas */}
  {error && (
    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
      {error}
    </Alert>
  )}
  {success && (
    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
    {success}
    </Alert>
)}
          {/* Filtros - Fila 1 */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              placeholder="Buscar por nombre..."
              value={filters.buscar}
              onChange={(e) => setFilters({ ...filters, buscar: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              label="Estado"
              value={filters.activo}
              onChange={(e) => setFilters({ ...filters, activo: e.target.value })}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="true">Activas</MenuItem>
              <MenuItem value="false">Inactivas</MenuItem>
            </TextField>
          </Stack>

          {/* Filtros - Fila 2: Fechas */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <DatePicker
              label="Fecha Desde"
              value={filters.fecha_desde}
              onChange={(newValue) => setFilters({ ...filters, fecha_desde: newValue })}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
              format="dd/MM/yyyy"
            />

            <DatePicker
              label="Fecha Hasta"
              value={filters.fecha_hasta}
              onChange={(newValue) => setFilters({ ...filters, fecha_hasta: newValue })}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                },
              }}
              format="dd/MM/yyyy"
              minDate={filters.fecha_desde || undefined}
            />

            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ 
                    textTransform: 'none',
                    minWidth: 120,
                  }}
                  >
                 {loading ? 'Buscando...' : 'Buscar'}
            </Button>

            <Button
              variant="text"
              startIcon={<RefreshIcon />}
              onClick={handleClearFilters}

               sx={{ 
    textTransform: 'none', 
    minWidth: 120,
    bgcolor: '#4685e9ff',  
    color: 'white',
    fontWeight: 600,
    boxShadow: 2,
  }}
            >
              Limpiar
            </Button>
          </Stack>
        </Paper>
        

        {/* Tabla */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Nombre
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Estado
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Items
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Fecha Creación
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Última Actualización
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron categorías
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  categorias.map((categoria) => (
                    <TableRow key={categoria.id} hover>
                      <TableCell>{categoria.nombre}</TableCell>
                      
                      {/* Estado */}
                      <TableCell align="center">
                        <Chip
                          label={categoria.activo ? 'Activo' : 'Inactivo'}
                          color={categoria.activo ? 'success' : 'default'}
                          size="small"
                          sx={{ minWidth: 70 }}
                        />
                      </TableCell>
                      
                      {/* Items */}
                    <TableCell align="center">
                        <Avatar
                        sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 20,
                        width: 25,
                        height: 28,
                        px: 1.5,
                        borderRadius: 1.5,
                        bgcolor: '#ffff',
                        color: '#8446abff',   
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        border: '1px solid #d5bbd9ff',
                        }}
                        >
                        {categoria.apu_items_count || 0}
                        </Avatar>
                    </TableCell>
                      
                      {/* Fecha Creación */}
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(categoria.created_at)}
                        </Typography>
                      </TableCell>
                      
                      {/* Última Actualización */}
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(categoria.updated_at)}
                        </Typography>
                      </TableCell>
                      
                      {/* Acciones */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Editar categoría">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleEdit(categoria)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'warning.light',
                                  color: 'white',
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={categoria.activo ? 'Desactivar categoría' : 'Activar categoría'}>
                            <IconButton
                              size="small"
                              color={categoria.activo ? 'success' : 'default'}
                              onClick={() => handleToggleClick(categoria)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: categoria.activo ? '#e8f5e9' : '#f5f5f5',
                                },
                              }}
                            >
                              {categoria.activo ? (
                                <ToggleOnIcon fontSize="small" />
                              ) : (
                                <ToggleOffIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          <Box sx={{ 
            mt: 2, 
            mb: 2,
            px: 2,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {categorias.length === 0 ? 0 : (page - 1) * perPage + 1} - {Math.min(page * perPage, totalRows)} de <strong>{totalRows}</strong> categorías
            </Typography>
            
            {totalPages > 1 && (
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                siblingCount={1}
                boundaryCount={1}
              />
            )}
          </Box>
        </Paper>
          

        {/* Modal de Categoría */}
        <ModalCategoria
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          categoriaEdit={categoriaEdit}
          loading={modalLoading}
        />

        {/* Diálogo de Confirmación */}
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          onConfirm={handleToggleConfirm}
          title={
            confirmDialog.categoria?.activo
              ? '¿Inactivar categoría?'
              : '¿Activar categoría?'
          }
          description={
            confirmDialog.categoria?.activo
              ? 'La categoría dejará de estar disponible en el sistema.'
              : 'La categoría estará disponible en el sistema.'
          }
          severity={confirmDialog.categoria?.activo ? 'error' : 'success'}
          confirmText={confirmDialog.categoria?.activo ? 'Inactivar' : 'Activar'}
          cancelText="Cancelar"
          loading={confirmDialog.loading}
          showAlert={false}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default Categorias;