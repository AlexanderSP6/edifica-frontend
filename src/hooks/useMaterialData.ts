import { useState, useEffect } from 'react';
import { getApuItemsActivos } from '../services/apuItemService';
import { getUnidadesActivas } from '../services/unidadService';
import { getCategoriasActivas } from '../services/categoriaService';

// ==========================================
// INTERFACES
// ==========================================

interface ApuItem {
  id: number;
  codigo: string;
  descripcion: string;
  categoria?: {            
    id: number;
    codigo: string;
    nombre: string;
  };
}

interface Unidad {
  id: number;
  codigo: string;
  nombre: string;
}

interface Categoria {      
  id: number;
  codigo: string;
  nombre: string;
}

// ==========================================
// HOOK
// ==========================================

export const useMaterialData = () => {
  const [apuItems, setApuItems] = useState<ApuItem[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apuItemsRes, unidadesRes, categoriasRes] = await Promise.all([
        getApuItemsActivos(),
        getUnidadesActivas(),
        getCategoriasActivas(), 
      ]);

      setApuItems(apuItemsRes.data.data || []);
      setUnidades(unidadesRes.data.data || []);
      setCategorias(categoriasRes.data.data || []);

    } catch (error) {
      console.error('Error al cargar datos:', error); 
      setApuItems([]);
      setUnidades([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    apuItems,
    unidades,
    categorias,
    loading,
    reload: loadData,
  };
};