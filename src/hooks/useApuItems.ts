// src/hooks/useApuItems.ts
import { useState, useCallback } from 'react';
import {
  getApuItems,
  createApuItem,
  updateApuItem,
  toggleApuItemEstado,
  deleteApuItem,
} from '../services/apuItemService';

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

interface ApuItemFilters {
  buscar?: string;
  categoria_id?: number | string;
  unidad_id?: number | string;
  rango_precio?: 'bajo' | 'medio' | 'elevado';
  activo?: boolean | string;
  order_by?: string;
  order_dir?: string;
  per_page?: number;
  page?: number;
  all?: boolean;
}

export const useApuItems = () => {
  // Estados
  const [items, setItems] = useState<ApuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Paginación
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Ordenamiento
  const [orderBy, setOrderBy] = useState('codigo');
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('asc');

  /**
   * Cargar items con filtros
   */
  const loadItems = useCallback(async (filters: ApuItemFilters) => {
  setLoading(true);
  setError('');
  
  try {
    const response = await getApuItems(filters);
    const data = response.data;
    

    if (filters.all === true) {
      
      setItems(data.data || []);
      setTotalRecords(data.total || 0);
      setTotalPages(1);
    } else if (data.pagination) {
      // Paginación normal
      setItems(data.data || []);
      setTotalRecords(data.pagination.total || 0);
      setTotalPages(data.pagination.last_page || 0);
    } else {
      // Fallback
      setItems(data.data || []);
      setTotalRecords(data.total || 0);
      setTotalPages(1);
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Error al cargar los ítems APU');
    setItems([]);
    setTotalRecords(0);
    setTotalPages(0);
  } finally {
    setLoading(false);
  }
}, []);

  /**
   * Crear nuevo item
   */
  const createItem = useCallback(async (data: ApuItemFormData) => {
    try {
      const payload = {
        codigo: data.codigo,
        descripcion: data.descripcion,
        unidad_id: Number(data.unidad_id),
        categoria_id: Number(data.categoria_id),
        precio: data.precio,
      };
      
      await createApuItem(payload);
      setSuccess('Ítem APU creado exitosamente');
      return true;
    } catch (err: any) {
      throw err;
    }
  }, []);

  /**
   * Actualizar item existente
   */
  const updateItem = useCallback(async (id: number, data: ApuItemFormData) => {
    try {
      const payload = {
        codigo: data.codigo,
        descripcion: data.descripcion,
        unidad_id: Number(data.unidad_id),
        categoria_id: Number(data.categoria_id),
        precio: data.precio,
      };
      
      await updateApuItem(id, payload);
      setSuccess('Ítem APU actualizado exitosamente');
      return true;
    } catch (err: any) {
      throw err;
    }
  }, []);

  /**
   * Activar/Inactivar item
   */
  const toggleEstado = useCallback(async (id: number, codigo: string, activo: boolean) => {
    try {
      await toggleApuItemEstado(id);
      const accion = activo ? 'inactivado' : 'activado';
      setSuccess(`Ítem "${codigo}" ${accion} correctamente`);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar el estado del ítem');
      return false;
    }
  }, []);

  /**
   * Eliminar item
   */
  const deleteItem = useCallback(async (id: number, codigo: string) => {
    try {
      await deleteApuItem(id);
      setSuccess(`Ítem "${codigo}" eliminado correctamente`);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el ítem');
      return false;
    }
  }, []);

  return {
    // Estado
    items,
    loading,
    error,
    success,
    
    // Paginación
    page,
    perPage,
    totalRecords,
    totalPages,
    
    // Ordenamiento
    orderBy,
    orderDir,
    
    // Setters
    setError,
    setSuccess,
    setPage,
    setPerPage,
    setOrderBy,
    setOrderDir,
    
    // Acciones
    loadItems,
    createItem,
    updateItem,
    toggleEstado,
    deleteItem,
  };
};