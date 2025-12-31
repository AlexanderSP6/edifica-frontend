import { useState } from 'react';
import equipoService from '../services/equipoService';

// INTERFACES
interface Equipo {
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

interface EquipoFormData {
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

export const useEquipo = () => {
  // Estados principales
  const [items, setItems] = useState<Equipo[]>([]);
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
      const response = await equipoService.getAll({
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
      const errorMessage = err.response?.data?.message || 'Error al cargar los equipos';
      setError(errorMessage);
      setItems([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  //  Cargar TODOS los equipos con filtros (sin paginación)
const loadAllItems = async (params?: LoadItemsParams): Promise<Equipo[]> => {
  setLoading(true);
  setError('');
  
  try {
    const response = await equipoService.getAll({
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
    const errorMessage = err.response?.data?.message || 'Error al cargar todos los equipos';
    setError(errorMessage);
    return [];
  } finally {
    setLoading(false);
  }
};

  // ==========================================
  // CREAR ITEM
  // ==========================================
  const createItem = async (data: EquipoFormData) => {
    try {
      const response = await equipoService.create(data);
      setSuccess('Equipo creado exitosamente');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear el equipo';
      setError(errorMessage);
      throw err;
    }
  };

  // ==========================================
  // ACTUALIZAR ITEM
  // ==========================================
  const updateItem = async (id: number, data: EquipoFormData) => {
    try {
      const response = await equipoService.update(id, data);
      setSuccess('Equipo actualizado exitosamente');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar el equipo';
      setError(errorMessage);
      throw err;
    }
  };

  // ==========================================
  // TOGGLE ESTADO
  // ==========================================
  const toggleEstado = async (id: number, descripcion?: string, estadoActual?: boolean): Promise<boolean> => {
    try {
      await equipoService.toggleEstado(id);
      const accion = estadoActual ? 'inactivado' : 'activado';
      setSuccess(`Equipo "${descripcion || id}" ${accion} exitosamente`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cambiar el estado';
      setError(errorMessage);
      return false;
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