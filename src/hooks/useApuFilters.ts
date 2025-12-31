// src/hooks/useApuFilters.ts
import { useState, useCallback } from 'react';

interface Filters {
  buscar: string;
  categoria_id: string;
  unidad_id: string;
  rango_precio: '' | 'bajo' | 'medio' | 'elevado';
  activo: string;
}

export const useApuFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    buscar: '',
    categoria_id: '',
    unidad_id: '',
    rango_precio: '',
    activo: '',
  });

  /**
   * Cambiar un filtro individual
   */
  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Resetear todos los filtros
   */
  const resetFilters = useCallback(() => {
    setFilters({
      buscar: '',
      categoria_id: '',
      unidad_id: '',
      rango_precio: '',
      activo: '',
    });
  }, []);

  /**
   * Verificar si hay filtros activos
   */
  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(value => value !== '');
  }, [filters]);

  return {
    filters,
    setFilters,
    handleFilterChange,
    resetFilters,
    hasActiveFilters,
  };
};