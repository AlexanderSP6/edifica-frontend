import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable, { DataTableColumn } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import ModalMaterial from '../components/ModalMaterial';
import ComponenteFilters from '../components/ComponenteFilters';


import { useMaterial } from '../hooks/useMaterial';
import { useMaterialFilters } from '../hooks/useMaterialFilters';
import { useMaterialData } from '../hooks/useMaterialData';

import { usePDFExport } from '../hooks/usePDFExport';
import { materialesPDFConfig, transformMaterialesForPDF } from '../utils/pdf/materialesPDF';
import { FileDownload } from '@mui/icons-material';

// Interfaces
interface Material {
  id: number;
  descripcion: string;
  unidad_id?: number;
  unidad: {
    id: number;
    codigo: string;
    nombre: string;
  };
  apu_item_id?: number;
  apu_item: {
    id: number;
    codigo: string;
    descripcion: string;
    categoria?: {
      id: number;
      codigo: string;
      nombre: string;
    };
  };
  rendimiento: number;                  
  precio_unitario: number;              
  total: number; 
  moneda: string;
  vigente_desde: string;
  vigente_hasta: string | null;
  estado_vigencia: string; 
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface MaterialFormData {
  descripcion: string;
  unidad_id: number | '';
  apu_item_id: number | '';
  rendimiento: number | '';             
  precio_unitario: number | '';
  vigente_desde: string;
  vigente_hasta?: string;
}

// Funcion CHIPS de Estado Vigencia
const getEstadoVigenciaChip = (estado: string) => {
  switch (estado) {
    case 'vigente':
      return (
        <Chip
          label="Vigente"
          size="small"
          sx={{
            backgroundColor: '#e8f5e9',   
            color: '#2e7d32',              
            fontWeight: 600,
            border: '1px solid #a5d6a7',   
            minWidth: 80,
          }}
        />
      );
    case 'proximo':
      return (
        <Chip
          label="Próximo"
          size="small"
          sx={{
            backgroundColor: '#fff3e0',   
            color: '#e65100',              
            fontWeight: 600,
            border: '1px solid #ffcc80',   
            minWidth: 80,
          }}
        />
      );
    case 'vencido':
      return (
        <Chip
          label="Vencido"
          size="small"
          sx={{
            backgroundColor: '#fce4ec',   
            color: '#c62828',              
            fontWeight: 600,
            border: '1px solid #f8bbd0',   
            minWidth: 80,
          }}
        />
      );
    default:
      return (
        <Chip 
          label="Sin definir" 
          size="small"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#757575',
            fontWeight: 600,
            border: '1px solid #e0e0e0',
          }}
        />
      );
  }
};

// COMPONENTE
const Material: React.FC = () => {
  // Hooks personalizados
  const material = useMaterial();
  const filters = useMaterialFilters();
  const data = useMaterialData();

  // Exportación PDF
  const { isExporting, exportError, exportData } = usePDFExport();

  // Estados del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [itemEdit, setItemEdit] = useState<Material | null>(null);

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
    material.loadItems({
      buscar: filters.filters.buscar || undefined,
      categoria_id: filters.filters.categoria_id || undefined,
      apu_item_id: filters.filters.apu_item_id || undefined,
      unidad_id: filters.filters.unidad_id || undefined,
      estado_vigencia: filters.filters.estado_vigencia || undefined,
      activo: filters.filters.activo || undefined,
      page: material.page,
      per_page: material.perPage,
    });
  }, [material.page, material.perPage]);

  // Definir columnas de la tabla
  const columns: DataTableColumn<Material>[] = [
    {
      id: 'descripcion',
      label: 'Descripción',
      minWidth: 200,
      format: (value) => (
        <Typography variant="body2" sx={{ maxWidth: 300 }}>
          {value}
        </Typography>
      ),
    },
    {
      id: 'apu_item',
      label: 'APU Item',
      minWidth: 70,
      format: (value) => (
        <Typography variant="body2" noWrap>
          {value?.codigo || '-'}
        </Typography>
      ),
    },
    {
      id: 'unidad',
      label: 'Unidad',
      align: 'center',
      format: (value) => value?.codigo || '-',
    },
    {
      id: 'rendimiento',
      label: 'Rendimiento',
      align: 'right',
      format: (value) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {value?.toFixed(4) || '-'}
        </Typography>
      ),
    },
    {
      id: 'precio_unitario',
      label: 'Precio Unit.',
      align: 'right',
      format: (value) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
          Bs {value.toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'total',
      label: 'Total',
      align: 'right',
      format: (value) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
          Bs {value.toFixed(4)}
        </Typography>
      ),
    },
    {
      id: 'estado_vigencia',
      label: 'Vigencia',
      align: 'center',
      format: (value) => getEstadoVigenciaChip(value),
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

  const handleOpenModal = (item?: Material) => {
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

  const handleSave = async (data: MaterialFormData) => {
    setModalLoading(true);

    try {
      if (itemEdit) {
        await material.updateItem(itemEdit.id, data);
      } else {
        await material.createItem(data);
      }
      handleCloseModal();
      await material.loadItems({
        buscar: filters.filters.buscar || undefined,
        categoria_id: filters.filters.categoria_id || undefined,
        apu_item_id: filters.filters.apu_item_id || undefined,
        unidad_id: filters.filters.unidad_id || undefined,
        estado_vigencia: filters.filters.estado_vigencia || undefined,
        activo: filters.filters.activo || undefined,
        page: material.page,
        per_page: material.perPage,
      });
    } catch (err: any) {
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  // HANDLERS DE ACCIONES
  const handleEdit = (item: Material) => {
    const itemForEdit = {
      ...item,
      unidad_id: item.unidad?.id || item.unidad_id,
      apu_item_id: item.apu_item?.id || item.apu_item_id,
      
    };

    handleOpenModal(itemForEdit as Material);
  };

  const handleToggleEstado = (item: Material) => {
    const esActivar = !item.activo;
    setConfirmTitle(esActivar ? 'Activar Material' : 'Inactivar Material');
    setConfirmSeverity(esActivar ? 'success' : 'warning');
    setConfirmText(esActivar ? 'Activar' : 'Inactivar');
    setConfirmDescription(
      `¿Está seguro que desea ${item.activo ? 'inactivar' : 'activar'} el material "${item.descripcion}"?`
    );
    setConfirmAction(() => async () => {
      const success = await material.toggleEstado(item.id, item.descripcion, item.activo);
      if (success) {
        await material.loadItems({
          buscar: filters.filters.buscar || undefined,
          categoria_id: filters.filters.categoria_id || undefined,
          apu_item_id: filters.filters.apu_item_id || undefined,
          unidad_id: filters.filters.unidad_id || undefined,
          estado_vigencia: filters.filters.estado_vigencia || undefined,
          activo: filters.filters.activo !== '' ? filters.filters.activo : undefined,
          page: material.page,
          per_page: material.perPage,
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

  // HANDLERS DE FILTROS

  const handleSearch = () => {
    material.setPage(1);
    material.loadItems({
      buscar: filters.filters.buscar || undefined,
      categoria_id: filters.filters.categoria_id || undefined,
      apu_item_id: filters.filters.apu_item_id || undefined,
      unidad_id: filters.filters.unidad_id || undefined,
      estado_vigencia: filters.filters.estado_vigencia || undefined,
      activo: filters.filters.activo || undefined,
      page: 1,
      per_page: material.perPage,
    });
  };

  const handleReset = () => {
    filters.resetFilters();
    material.setPage(1);
    material.setPerPage(10);
  };

  const handleExportPDF = async () => {
    // Cargar todos los datos con filtros aplicados
    const allItems = await material.loadAllItems({
    buscar: filters.filters.buscar || undefined,
    categoria_id: filters.filters.categoria_id || undefined,
    apu_item_id: filters.filters.apu_item_id || undefined,
    unidad_id: filters.filters.unidad_id || undefined,
    estado_vigencia: filters.filters.estado_vigencia || undefined,
    activo: filters.filters.activo || undefined,
  });

  // Validar que hay datos
  if (allItems.length === 0) {
    material.setError('No hay datos para exportar');
    return;
  }

  // Transformar datos
  const dataForPDF = transformMaterialesForPDF(allItems);
  
  // Preparar filtros aplicados
  const appliedFilters: Record<string, string> = {};
  
  // Búsqueda
  if (filters.filters.buscar) {
    appliedFilters.buscar = filters.filters.buscar;
  }
  
  // Categoría
  if (filters.filters.categoria_id) {
    const categoria = data.categorias.find(c => c.id === filters.filters.categoria_id);
    appliedFilters.categoria = categoria?.nombre || `ID: ${filters.filters.categoria_id}`;
  }
  
  // APU Item
  if (filters.filters.apu_item_id) {
    const apuItem = data.apuItems.find(a => a.id === filters.filters.apu_item_id);
    appliedFilters['apu_item'] = apuItem?.codigo || `ID: ${filters.filters.apu_item_id}`;
  }
  
  // Unidad
  if (filters.filters.unidad_id) {
    const unidad = data.unidades.find(u => u.id === filters.filters.unidad_id);
    appliedFilters.unidad = unidad?.codigo || `ID: ${filters.filters.unidad_id}`;
  }
  
  // Estado vigencia
  if (filters.filters.estado_vigencia) {
    const estadosMap: Record<string, string> = {
      vigente: 'Vigente',
      proximo: 'Próximo',
      vencido: 'Vencido'
    };
    appliedFilters.vigencia = estadosMap[filters.filters.estado_vigencia] || filters.filters.estado_vigencia;
  }
  
  // Activo
  if (filters.filters.activo) {
    appliedFilters.estado = filters.filters.activo === 'true' ? 'Activos' : 'Inactivos';
  }

  // Exportar
  const success = await exportData(
    materialesPDFConfig,
    dataForPDF,
    appliedFilters
  );

  if (success) {
    material.setSuccess(`PDF generado exitosamente con ${allItems.length} registros`);
  } else {
    material.setError(exportError || 'Error al generar PDF');
  }
};

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid size="grow">
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Materiales
          </Typography>
        </Grid>
        <Grid>
          <Box display="flex" gap={2}>  
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
            Nuevo Material
          </Button>
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
              disabled={isExporting || material.loading || material.items.length === 0}
              sx={{
              textTransform: 'none',
              fontWeight: 500,
              px: 2.5,
              transition: 'all 0.2s ease'
            }}
          >
            {isExporting ? 'Generando PDF...' : 'Exportar PDF'}
          </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Alertas */}
      {material.error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => material.setError('')}>
          {material.error}
        </Alert>
      )}
      {material.success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => material.setSuccess('')}>
          {material.success}
        </Alert>
      )}

      {/* Filtros */}
      <ComponenteFilters
        filters={filters.filters}
        categorias={data.categorias}
        apuItems={data.apuItems}
        unidades={data.unidades}
        perPage={material.perPage}
        loading={material.loading}
        searchPlaceholder="Buscar materiales por descripción..."
        onFilterChange={filters.handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
        onPerPageChange={(value) => {
          material.setPerPage(value);
          material.setPage(1);
        }}
      />

      {/* Tabla */}
      <DataTable<Material>
        columns={columns}
        data={material.items}
        loading={material.loading}
        page={material.page}
        totalPages={material.totalPages}
        totalRecords={material.totalRecords}
        perPage={material.perPage}
        onPageChange={material.setPage}
        onEdit={handleEdit}
        onToggle={handleToggleEstado}
        getRowId={(row) => row.id}
        getRowActive={(row) => row.activo}
        emptyMessage="No se encontraron registros de materiales"
        showIndex={true}
        showEdit={true}
        showToggle={true}
      />

      {/* Modal de Formulario */}
      <ModalMaterial
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        itemEdit={itemEdit}
        loading={modalLoading}
        categorias={data.categorias}
        apuItems={data.apuItems}
        unidades={data.unidades}
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

export default Material;