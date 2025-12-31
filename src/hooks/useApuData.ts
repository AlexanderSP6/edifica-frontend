// src/hooks/useApuData.ts
import { useState, useEffect } from 'react';
import { getCategoriasActivas } from '../services/categoriaService';
import { getUnidadesActivas } from '../services/unidadService';

interface Categoria {
  id: number;
  nombre: string;
}

interface Unidad {
  id: number;
  codigo: string;
  nombre: string;
}

export const useApuData = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Cargar categorías y unidades en paralelo
   */
  const loadData = async () => {
    setLoading(true);
    
    try {
      const [categoriasRes, unidadesRes] = await Promise.all([
        getCategoriasActivas(),
        getUnidadesActivas(),
      ]);

      setCategorias(categoriasRes.data.data || []);
      setUnidades(unidadesRes.data.data || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setCategorias([]);
      setUnidades([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    categorias,
    unidades,
    loading,
    reload: loadData,
  };
};