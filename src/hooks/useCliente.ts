import { useState } from 'react';
import clienteService from '../services/clienteService';

// INTERFACES
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

interface LoadItemsParams {
  buscar?: string;
  tipo_cliente?: string;
  activo?: string;
  page?: number;
  per_page?: number;
  all?: boolean;
}

// ==========================================
// HOOK
// ==========================================

export const useCliente = () => {
  // Estados principales
  const [items, setItems] = useState<Cliente[]>([]);
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
      const response = await clienteService.getAll({
        buscar: params?.buscar,
        tipo_cliente: params?.tipo_cliente,
        activo: params?.activo,
        page: params?.page || page,
        perPage: params?.per_page || perPage,
        all: params?.all,
      });

      setItems(response.data);

      if (!params?.all && response.meta) {
        setTotalPages(response.meta.last_page || 1);
        setTotalRecords(response.meta.total || 0);
      } else {
        // Si all=true, todos los items están cargados
        setTotalPages(1);
        setTotalRecords(response.data.length);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar los clientes';
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
  const createItem = async (data: ClienteFormData) => {
    try {
      const response = await clienteService.create(data);
      setSuccess('Cliente creado exitosamente');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear el cliente';
      setError(errorMessage);
      throw err;
    }
  };

  // ==========================================
  // ACTUALIZAR ITEM
  // ==========================================
  const updateItem = async (id: number, data: ClienteFormData) => {
    try {
      const response = await clienteService.update(id, data);
      setSuccess('Cliente actualizado exitosamente');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar el cliente';
      setError(errorMessage);
      throw err;
    }
  };

  // TOGGLE ESTADO
  const toggleEstado = async (id: number, nombreCompleto?: string, estadoActual?: boolean): Promise<boolean> => {
    try {
      await clienteService.toggleEstado(id);
      const accion = estadoActual ? 'inactivado' : 'activado';
      setSuccess(`Cliente "${nombreCompleto || id}" ${accion} exitosamente`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cambiar el estado';
      setError(errorMessage);
      return false;
    }
  };

  // ELIMINAR
  const deleteItem = async (id: number, nombreCompleto?: string): Promise<boolean> => {
    try {
      await clienteService.delete(id);
      setSuccess(`Cliente "${nombreCompleto || id}" eliminado exitosamente`);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar el cliente';
      setError(errorMessage);
      return false;
    }
  };

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

    // Métodos
    loadItems,
    createItem,
    updateItem,
    toggleEstado,
    deleteItem,
  };
};