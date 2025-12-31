import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
  Alert,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Skeleton,
  Grid,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';

// Hooks personalizados
import { useApuItems } from '../hooks/useApuItems';
import { useApuFilters } from '../hooks/useApuFilters';
import { useApuData } from '../hooks/useApuData';

// Componentes
import ApuItemsFilters from '../components/ApuItemsFilters';
import ModalApuItem from '../components/ModalApuItem';
import ConfirmDialog from '../components/ConfirmDialog';

// Tipos
interface ApuItem {
  id: number;
  codigo: string;
  descripcion: string;
  categoria_id: number;
  categoria: {
    id: number;
    nombre: string;
  };
  unidad_id: number;
  unidad: {
    id: number;
    codigo: string;
    nombre: string;
  };
  activo: boolean;
  precio_actual: {
    id: number;
    precio_material: number;
    precio_mano_obra: number;
    precio_equipo: number;
    precio_total: number;
    rango: string;
    created_at: string;
  } | null;
  tiene_precio: boolean;
  created_at: string;
  updated_at: string;
}

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

// Componente Skeleton para filas de carga
const TableRowSkeleton = () => (
  <TableRow>
    <TableCell align="center"><Skeleton variant="text" /></TableCell>
    <TableCell><Skeleton variant="text" /></TableCell>
    <TableCell><Skeleton variant="text" /></TableCell>
    <TableCell><Skeleton variant="text" /></TableCell>
    <TableCell><Skeleton variant="text" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" /></TableCell>
    <TableCell align="right"><Skeleton variant="text" /></TableCell>
    <TableCell align="center"><Skeleton variant="rectangular" width={70} height={24} /></TableCell>
    <TableCell align="center"><Skeleton variant="rectangular" width={120} height={32} /></TableCell>
  </TableRow>
);

const ApuItems: React.FC = () => {
  // Hooks personalizados
  const apuItems = useApuItems();
  const apuFilters = useApuFilters();
  const apuData = useApuData();

  // Estados del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [itemEdit, setItemEdit] = useState<any>(null);

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
    apuItems.loadItems({
      buscar: apuFilters.filters.buscar || undefined,
      categoria_id: apuFilters.filters.categoria_id || undefined,
      unidad_id: apuFilters.filters.unidad_id || undefined,
      rango_precio: apuFilters.filters.rango_precio !== '' ? apuFilters.filters.rango_precio : undefined,
      activo: apuFilters.filters.activo !== '' ? apuFilters.filters.activo : undefined,
      order_by: apuItems.orderBy,
      order_dir: apuItems.orderDir,
      page: apuItems.page,
      per_page: apuItems.perPage,
    });
  }, [apuFilters.filters, apuItems.page, apuItems.perPage, apuItems.orderBy, apuItems.orderDir]);


  const getPrecioColor = (precio: number): string => {
    if (precio <= 100) return '#2e7d32';
    if (precio <= 500) return '#ed6c02';
    return '#d32f2f';
  };

  // Handlers del modal
  const handleOpenModal = (item?: ApuItem) => {
    if (item) {
      const itemData: any = {
        id: item.id,
        codigo: item.codigo,
        descripcion: item.descripcion,
        unidad_id: item.unidad_id ?? item.unidad?.id,
        categoria_id: item.categoria_id ?? item.categoria?.id,
        activo: item.activo,
        created_at: item.created_at,
        updated_at: item.updated_at,
        precio: {
          precio_material: item.precio_actual?.precio_material || 0,
          precio_mano_obra: item.precio_actual?.precio_mano_obra || 0,
          precio_equipo: item.precio_actual?.precio_equipo || 0,
          precio_total: item.precio_actual?.precio_total || 0,
        },
      };
      setItemEdit(itemData);
    } else {
      setItemEdit(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setItemEdit(null);
  };

  const handleSave = async (data: ApuItemFormData) => {
    setModalLoading(true);
    
    try {
      if (itemEdit) {
        await apuItems.updateItem(itemEdit.id, data);
      } else {
        await apuItems.createItem(data);
      }
      handleCloseModal();
      apuItems.loadItems({
        buscar: apuFilters.filters.buscar || undefined,
        categoria_id: apuFilters.filters.categoria_id || undefined,
        unidad_id: apuFilters.filters.unidad_id || undefined,
        rango_precio: apuFilters.filters.rango_precio !== '' ? apuFilters.filters.rango_precio : undefined,
        activo: apuFilters.filters.activo !== '' ? apuFilters.filters.activo : undefined,
        order_by: apuItems.orderBy,
        order_dir: apuItems.orderDir,
        page: apuItems.page,
        per_page: apuItems.perPage,
      });
    } catch (err: any) {
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleEstado = (item: ApuItem) => {
    const esActivar = !item.activo;
    setConfirmTitle(esActivar ? 'Activar Item' : 'Inactivar Item');
    setConfirmSeverity(esActivar ? 'success' : 'warning');
    setConfirmText(esActivar ? 'Activar' : 'Inactivar');
    
    setConfirmDescription(
      `¿Está seguro que desea ${item.activo ? 'inactivar' : 'activar'} el ítem "${item.codigo}"?`
    );
    setConfirmAction(() => async () => {
      const success = await apuItems.toggleEstado(item.id, item.codigo, item.activo);
      if (success) {
        await apuItems.loadItems({
          buscar: apuFilters.filters.buscar || undefined,
          categoria_id: apuFilters.filters.categoria_id || undefined,
          unidad_id: apuFilters.filters.unidad_id || undefined,
          rango_precio: apuFilters.filters.rango_precio !== '' ? apuFilters.filters.rango_precio : undefined,
          activo: apuFilters.filters.activo !== '' ? apuFilters.filters.activo : undefined,
          order_by: apuItems.orderBy,
          order_dir: apuItems.orderDir,
          page: apuItems.page,
          per_page: apuItems.perPage,
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

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
  apuItems.setPage(value);
  };

  const handleSearch = () => {
    apuItems.setPage(1);
    apuItems.loadItems({
      buscar: apuFilters.filters.buscar || undefined,
      categoria_id: apuFilters.filters.categoria_id || undefined,
      unidad_id: apuFilters.filters.unidad_id || undefined,
      rango_precio: apuFilters.filters.rango_precio !== '' ? apuFilters.filters.rango_precio : undefined,
      activo: apuFilters.filters.activo !== '' ? apuFilters.filters.activo : undefined,
      order_by: apuItems.orderBy,
      order_dir: apuItems.orderDir,
      page: 1,
      per_page: apuItems.perPage,
    });
  };

  const handleReset = () => {
    apuFilters.resetFilters();
    apuItems.setPage(1);
    apuItems.setPerPage(10);
    apuItems.setOrderBy('codigo');
    apuItems.setOrderDir('asc');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid size="grow">
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión Items
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
            Nuevo Ítem APU
          </Button>
        </Grid>
      </Grid>

      {/* Alertas */}
      {apuItems.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => apuItems.setError('')}>
          {apuItems.error}
        </Alert>
      )}
      {apuItems.success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => apuItems.setSuccess('')}>
          {apuItems.success}
        </Alert>
      )}

      {/* Filtros en 3 filas */}
      <ApuItemsFilters
        filters={apuFilters.filters}
        categorias={apuData.categorias}
        unidades={apuData.unidades}
        perPage={apuItems.perPage}
        onFilterChange={apuFilters.handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
        onPerPageChange={(value) => {
          apuItems.setPerPage(value);
          apuItems.setPage(1);
        }}
        loading={apuItems.loading}
      />

      {/* Tabla */}
      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Unidad</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Precio Material</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Precio M.O.</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Precio Equipo</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Precio Total</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apuItems.loading ? (
              Array.from({ length: apuItems.perPage }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))
            ) : apuItems.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  No se encontraron ítems APU
                </TableCell>
              </TableRow>
            ) : (
              apuItems.items.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell align="center">
                    {(apuItems.page - 1) * apuItems.perPage + index + 1}
                  </TableCell>
                  <TableCell>{item.codigo}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300 }}>
                      {item.descripcion}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.categoria?.nombre || '-'}</TableCell>
                  <TableCell>{item.unidad?.codigo || '-'}</TableCell>
                  <TableCell align="right">
                    Bs {(item.precio_actual?.precio_material || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    Bs {(item.precio_actual?.precio_mano_obra || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    Bs {(item.precio_actual?.precio_equipo || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end', 
                        gap: 1 
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: getPrecioColor(item.precio_actual?.precio_total || 0),
                          boxShadow: `0 0 8px ${getPrecioColor(item.precio_actual?.precio_total || 0)}40`,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontFamily: 'monospace',
                        }}
                      >
                        Bs {(item.precio_actual?.precio_total || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.activo ? 'Activo' : 'Inactivo'}
                      color={item.activo ? 'success' : 'default'}
                      size="small"
                      sx={{ minWidth: 70 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <Tooltip title={item.activo ? 'Editar ítem' : 'No se puede editar un ítem inactivo'}>
                      <span> 
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleOpenModal(item)}
                          disabled={!item.activo}
                          sx={{
                            '&:hover': {
                            backgroundColor: item.activo ? 'warning.light' : undefined,
                            color: item.activo ? 'white' : undefined,
                            },
                              '&.Mui-disabled': {
                                color: 'action.disabled',
                              },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                      <Tooltip title={item.activo ? 'Inactivar ítem' : 'Activar ítem'}>
                        <IconButton
                          size="small"
                          color={item.activo ? 'success' : 'default'}
                          onClick={() => handleToggleEstado(item)}
                          sx={{
                            '&:hover': {
                              backgroundColor: item.activo ? '#e8f5e9' : '#f5f5f5',
                            },
                          }}
                        >
                          {item.activo ? (
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
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Mostrando {apuItems.items.length === 0 ? 0 : (apuItems.page - 1) * apuItems.perPage + 1} -{' '}
          {Math.min(apuItems.page * apuItems.perPage, apuItems.totalRecords)} de{' '}
          <strong>{apuItems.totalRecords}</strong> ítems APU
        </Typography>

        {apuItems.totalPages > 1 && (
          <Pagination
            count={apuItems.totalPages}
            page={apuItems.page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        )}
      </Box>

      {/* Modal */}
      <ModalApuItem
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        itemEdit={itemEdit}
        loading={modalLoading}
        categorias={apuData.categorias}
        unidades={apuData.unidades}
      />


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

export default ApuItems;