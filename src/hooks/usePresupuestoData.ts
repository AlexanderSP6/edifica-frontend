import { useState, useEffect, useCallback } from 'react';
import { getApuItemsActivos } from '../services/apuItemService';
import { getCategoriasActivas } from '../services/categoriaService';

// ==========================================
// INTERFACES
// ==========================================

interface ApuItem {
  id: number;
  codigo: string;
  descripcion: string;
  unidad: {
    id: number;
    codigo: string;
    nombre: string;
  };
  categoria: {
    id: number;
    nombre: string;
  };
  precio_actual: {
    precio_material: number;
    precio_mano_obra: number;
    precio_equipo: number;
    precio_total: number;
  } | null;
  activo: boolean;
}

interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
}

// ==========================================
// HOOK
// ==========================================

export const usePresupuestoData = () => {
  const [apuItems, setApuItems] = useState<ApuItem[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Cargar datos de APU Items y Categorías
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [apuItemsRes, categoriasRes] = await Promise.all([
        getApuItemsActivos(),
        getCategoriasActivas(),
      ]);

      setApuItems(apuItemsRes.data.data || []);
      setCategorias(categoriasRes.data.data || []);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Error al cargar datos del presupuesto';
      setError(errorMessage);
      console.error('Error al cargar datos:', err);
      
      setApuItems([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Limpiar mensaje de error
   */
  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    apuItems,
    categorias,
    loading,
    error,
    reload: loadData,
    clearError,
  };
};