import { useState } from 'react';

// ==========================================
// INTERFACE
// ==========================================

interface ClienteFilters {
  buscar: string;
  tipo_cliente: string | '';
  activo: string | '';
}

// ==========================================
// HOOK
// ==========================================

export const useClienteFilters = () => {
  const [filters, setFilters] = useState<ClienteFilters>({
    buscar: '',
    tipo_cliente: '',
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
      tipo_cliente: '',
      activo: '',
    });
  };

  return {
    filters,
    handleFilterChange,
    resetFilters,
  };
};