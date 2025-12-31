import { useState } from 'react';
import manoObraService from '../services/manoObraService';

// INTERFACES
interface ManoObra {
  id: number;
  descripcion: string;
  unidad_id: number;
  unidad: {
    id: number;
    codigo: string;
    nombre: string;
  };
  apu_item_id: number;
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

interface ManoObraFormData {
  descripcion: string;
  unidad_id: number | '';
  apu_item_id: number | '';
  rendimiento: number | '';
  precio_unitario: number | '';
  moneda?: string;
  vigente_desde: string;
  vigente_hasta?: string;
}

interface LoadItemsParams {
  buscar?: string;
  categoria_id?: number;
  apu_item_id?: number;
  unidad_id?: number;
  estado_vigencia?: string;
  activo?: string;
  page?: number;
  per_page?: number;
}

// ==========================================
// HOOK
// ==========================================

export const useManoObra = () => {
  // Estados principales
  const [items, setItems] = useState<ManoObra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados de paginación
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // ==========================================
  // CARGAR ITEMS
  // ==========================================
  const loadItems = async (params?: LoadItemsParams) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await manoObraService.getAll({
        buscar: params?.buscar,
        categoria_id: params?.categoria_id,
        apu_item_id: params?.apu_item_id,
        unidad_id: params?.unidad_id,
        estado_vigencia: params?.estado_vigencia,
        activo: params?.activo,
        page: params?.page || page,
        perPage: params?.per_page || perPage,
      });

      setItems(response.data);
      setTotalPages(response.meta?.last_page || 1);
      setTotalRecords(response.meta?.total || 0);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar la mano de obra';
      setError(errorMessage);
      setItems([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREAR ITEM
  // ==========================================
  const createItem = async (data: ManoObraFormData) => {
    try {
      const response = await manoObraService.create(data);
      setSuccess('Mano de obra creada exitosamente');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear la mano de obra';
      setError(errorMessage);
      throw err;
    }
  };

  // ==========================================
  // ACTUALIZAR ITEM
  // ==========================================
  const updateItem = async (id: number, data: ManoObraFormData) => {
    try {
      const response = await manoObraService.update(id, data);
      setSuccess('Mano de obra actualizada exitosamente');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar la mano de obra';
      setError(errorMessage);
      throw err;
    }
  };

  // ==========================================
  // TOGGLE ESTADO
  // ==========================================
  const toggleEstado = async (id: number, descripcion?: string, estadoActual?: boolean): Promise<boolean> => {
    try {
      await manoObraService.toggleEstado(id);
      const accion = estadoActual ? 'inactivada' : 'activada';
      setSuccess(`Mano de obra "${descripcion || id}" ${accion} exitosamente`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cambiar el estado';
      setError(errorMessage);
      return false;
    }
  };

  // ==========================================
// CARGAR TODOS LOS ITEMS (SIN PAGINACIÓN)
// ==========================================
const loadAllItems = async (params?: LoadItemsParams): Promise<ManoObra[]> => {
  setLoading(true);
  setError('');
  
  try {
    const response = await manoObraService.getAll({
      buscar: params?.buscar,
      categoria_id: params?.categoria_id,
      apu_item_id: params?.apu_item_id,
      unidad_id: params?.unidad_id,
      estado_vigencia: params?.estado_vigencia,
      activo: params?.activo,
      all: true,  
    });

    return response.data;
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Error al cargar toda la mano de obra';
    setError(errorMessage);
    return [];
  } finally {
    setLoading(false);
  }
};

  // ==========================================
  // RETORNO DEL HOOK
  // ==========================================
  return {
    // Estados
    items,
    loading,
    error,
    success,
    page,
    perPage,
    totalPages,
    totalRecords,

    // Setters
    setError,
    setSuccess,
    setPage,
    setPerPage,

    // Métodos
    loadItems,
    loadAllItems, 
    createItem,
    updateItem,
    toggleEstado,
  };
};