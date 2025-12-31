import { useState } from 'react';

// ==========================================
// INTERFACES
// ==========================================

export interface EquipoFilters {
  buscar: string;
  categoria_id: number | '';
  apu_item_id: number | '';
  unidad_id: number | '';
  estado_vigencia: string | '';
  activo: string | '';
}

// ==========================================
// HOOK
// ==========================================

export const useEquipoFilters = () => {
  const [filters, setFilters] = useState<EquipoFilters>({
    buscar: '',
    categoria_id: '',
    apu_item_id: '',
    unidad_id: '',
    estado_vigencia: '',
    activo: '',
  });

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      buscar: '',
      categoria_id: '',
      apu_item_id: '',
      unidad_id: '',
      estado_vigencia: '',
      activo: '',
    });
  };

  return {
    filters,
    handleFilterChange,
    resetFilters,
  };
};