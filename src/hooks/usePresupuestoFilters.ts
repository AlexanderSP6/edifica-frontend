import { useState, useCallback } from 'react';

// ==========================================
// INTERFACE
// ==========================================

interface PresupuestoFilters {
  buscar: string;
  cliente_id: number | '';
  tipo: 'cotizacion' | 'contrato' | '';
  fecha_desde: string;
  fecha_hasta: string;
  activo: 'true' | 'false' | '';
}

// ==========================================
// HOOK
// ==========================================

export const usePresupuestoFilters = () => {
  const [filters, setFilters] = useState<PresupuestoFilters>({
    buscar: '',
    cliente_id: '',
    tipo: '',
    fecha_desde: '',
    fecha_hasta: '',
    activo: '',
  });

  /**
   * Actualizar un campo específico del filtro
   */
  const handleFilterChange = useCallback((field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * Resetear todos los filtros a sus valores iniciales
   */
  const resetFilters = useCallback(() => {
    setFilters({
      buscar: '',
      cliente_id: '',
      tipo: '',
      fecha_desde: '',
      fecha_hasta: '',
      activo: '',
    });
  }, []);

  /**
   * Verificar si hay filtros activos
   */
  const hasActiveFilters = useCallback(() => {
    return (
      filters.buscar !== '' ||
      filters.cliente_id !== '' ||
      filters.tipo !== '' ||
      filters.fecha_desde !== '' ||
      filters.fecha_hasta !== '' ||
      filters.activo !== ''
    );
  }, [filters]);

  return {
    filters,
    handleFilterChange,
    resetFilters,
    hasActiveFilters,
  };
};