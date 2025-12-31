import { useState } from 'react';

// ==========================================
// INTERFACE
// ==========================================

interface MaterialFilters {
  buscar: string;
  apu_item_id: number | '';
  categoria_id: number | ''; 
  unidad_id: number | '';
  estado_vigencia: string | '';
  activo: string | '';
}

// ==========================================
// HOOK
// ==========================================

export const useMaterialFilters = () => {
  const [filters, setFilters] = useState<MaterialFilters>({
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