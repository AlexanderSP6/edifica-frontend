import { useState } from 'react';
import materialService from '../services/materialService';


// INTERFACES
interface Material {
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

interface MaterialFormData {
  descripcion: string;
  unidad_id: number | '';
  apu_item_id: number | '';
  rendimiento: number | '';         
  precio_unitario: number | '';
  vigente_desde: string;
  vigente_hasta?: string;
}

interface LoadItemsParams {
  buscar?: string;
  categoria_id?: number;
  apu_item_id?: number;
  unidad_id?: number;
  moneda?: string;
  estado_vigencia?: string;
  activo?: string;
  page?: number;
  per_page?: number;
}

// ==========================================
// HOOK
// ==========================================

export const useMaterial = () => {
  // Estados principales
  const [items, setItems] = useState<Material[]>([]);
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
      const response = await materialService.getAll({
        buscar: params?.buscar,
        categoria_id: params?.categoria_id,
        apu_item_id: params?.apu_item_id,
        unidad_id: params?.unidad_id,
        moneda: params?.moneda,
        estado_vigencia: params?.estado_vigencia,
        activo: params?.activo,
        page: params?.page || page,
        perPage: params?.per_page || perPage,
      });

      setItems(response.data);
      setTotalPages(response.meta?.last_page || 1);
      setTotalRecords(response.meta?.total || 0);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar los materiales';
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
  const createItem = async (data: MaterialFormData) => {
    try {
      const response = await materialService.create(data);
      setSuccess('Material creado exitosamente');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear el material';
      setError(errorMessage);
      throw err;
    }
  };

  // ==========================================
  // ACTUALIZAR ITEM
  // ==========================================
  const updateItem = async (id: number, data: MaterialFormData) => {
    try {
      const response = await materialService.update(id, data);
      setSuccess('Material actualizado exitosamente');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar el material';
      setError(errorMessage);
      throw err;
    }
  };

  // ==========================================
  // TOGGLE ESTADO
  // ==========================================
  const toggleEstado = async (id: number, descripcion?: string, estadoActual?: boolean): Promise<boolean> => {
    try {
      await materialService.toggleEstado(id);
      const accion = estadoActual ? 'inactivado' : 'activado';
      setSuccess(`Material "${descripcion || id}" ${accion} exitosamente`);
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
const loadAllItems = async (params?: LoadItemsParams): Promise<Material[]> => {
  setLoading(true);
  setError('');
  
  try {
    const response = await materialService.getAll({
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
    const errorMessage = err.response?.data?.message || 'Error al cargar todos los materiales';
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