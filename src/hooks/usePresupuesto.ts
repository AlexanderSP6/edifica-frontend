import { useState, useCallback } from 'react';
import presupuestoService from '../services/presupuestoService';
import type {
  Presupuesto,
  PresupuestoFormData,
  GetAllParams,
} from '../types/presupuesto.types';

// ==========================================
// HOOK
// ==========================================

export const usePresupuesto = () => {
  // Estados principales
  const [items, setItems] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados de paginación
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);


  // LIMPIAR MENSAJES=
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // AUTO-LIMPIAR SUCCESS DESPUÉS DE 3 SEGUNDOS
  const setSuccessWithTimeout = useCallback((message: string) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  }, []);

  // CARGAR ITEMS
  const loadItems = useCallback(
    async (params?: GetAllParams) => {
      setLoading(true);
      setError('');

      try {
        const response = await presupuestoService.getAll({
          buscar: params?.buscar,
          cliente_id: params?.cliente_id,
          tipo: params?.tipo,
          fecha_desde: params?.fecha_desde,
          fecha_hasta: params?.fecha_hasta,
          activo: params?.activo,
          page: params?.page || page,
          perPage: params?.perPage || perPage,
        });

        setItems(response.data);
        setTotalPages(response.meta?.last_page || 1);
        setTotalRecords(response.meta?.total || 0);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Error al cargar los presupuestos';
        setError(errorMessage);
        setItems([]);
        setTotalPages(1);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    [page, perPage]
  );


  // OBTENER POR ID
  const loadById = useCallback(async (id: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await presupuestoService.getById(id);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar el presupuesto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // CREAR ITEM
  // ==========================================
  const createItem = useCallback(
    async (data: PresupuestoFormData) => {
      setLoading(true);
      setError('');

      try {
        const response = await presupuestoService.create(data);
        setSuccessWithTimeout('Presupuesto creado exitosamente');
        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Error al crear el presupuesto';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setSuccessWithTimeout]
  );

  // ==========================================
  // ACTUALIZAR ITEM
  // ==========================================
  const updateItem = useCallback(
    async (id: number, data: PresupuestoFormData) => {
      setLoading(true);
      setError('');

      try {
        const response = await presupuestoService.update(id, data);
        setSuccessWithTimeout('Presupuesto actualizado exitosamente');
        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Error al actualizar el presupuesto';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setSuccessWithTimeout]
  );

  // ==========================================
  // TOGGLE ESTADO
  // ==========================================
  const toggleEstado = useCallback(
    async (presupuesto: Presupuesto): Promise<boolean> => {
      try {
        await presupuestoService.toggleEstado(presupuesto.id);
        const accion = presupuesto.activo ? 'inactivado' : 'activado';
        setSuccessWithTimeout(
          `Presupuesto "${presupuesto.nombre_proyecto}" ${accion} exitosamente`
        );
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Error al cambiar el estado';
        setError(errorMessage);
        return false;
      }
    },
    [setSuccessWithTimeout]
  );

  // ==========================================
  // ELIMINAR
  // ==========================================
  const deleteItem = useCallback(
    async (presupuesto: Presupuesto): Promise<boolean> => {
      try {
        await presupuestoService.delete(presupuesto.id);
        setSuccessWithTimeout(
          `Presupuesto "${presupuesto.nombre_proyecto}" eliminado exitosamente`
        );
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Error al eliminar el presupuesto';
        setError(errorMessage);
        return false;
      }
    },
    [setSuccessWithTimeout]
  );

  // ==========================================
// CARGAR TODOS LOS ITEMS (SIN PAGINACIÓN)
// ==========================================
const loadAllItems = useCallback(
  async (params?: GetAllParams): Promise<Presupuesto[]> => {
    setLoading(true);
    setError('');
    
    try {
      const response = await presupuestoService.getAll({
        buscar: params?.buscar,
        cliente_id: params?.cliente_id,
        tipo: params?.tipo,
        fecha_desde: params?.fecha_desde,
        fecha_hasta: params?.fecha_hasta,
        activo: params?.activo,
        all: true,  
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar todos los presupuestos';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  },
  []
);

  // RETORNO DEL HOOK
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
    clearMessages,

    // Métodos
    loadItems,
    loadAllItems, 
    loadById,
    createItem,
    updateItem,
    toggleEstado,
    deleteItem,
  };
};