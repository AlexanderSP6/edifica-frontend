import client from '../config/client';

interface ApuItemFilters {
  buscar?: string;
  categoria_id?: number | string;
  unidad_id?: number | string;
  rango_precio?: 'bajo' | 'medio' | 'elevado';
  activo?: boolean | string;
  order_by?: string;
  order_dir?: string;
  per_page?: number;
  page?: number;
  all?: boolean;
}

interface CreateApuItemData {
  codigo: string;
  descripcion: string;
  unidad_id: number;
  categoria_id: number;
  precio: {
    precio_material: number;
    precio_mano_obra: number;
    precio_equipo: number;
    precio_total: number;
  };
}

interface UpdateApuItemData {
  codigo: string;
  descripcion: string;
  unidad_id: number;
  categoria_id: number;
  precio?: {
    precio_material: number;
    precio_mano_obra: number;
    precio_equipo: number;
    precio_total: number;
  };
}

// Listar items con filtros
export const getApuItems = (filters?: ApuItemFilters) => {
  const params: Record<string, any> = {};

  if (filters) {
    // Búsqueda
    if (filters.buscar) {
      params.buscar = filters.buscar;
    }

    // Categoría
    if (filters.categoria_id) {
      params.categoria_id = filters.categoria_id;
    }

    // Unidad
    if (filters.unidad_id) {
      params.unidad_id = filters.unidad_id;
    }

    // Rango precio
    if (filters.rango_precio) {
      params.rango_precio = filters.rango_precio;
    }

    // Activo: convertir boolean a '1' o '0'
    if (filters.activo !== undefined && filters.activo !== 'all') {
      if (typeof filters.activo === 'string') {
        params.activo = filters.activo === 'true' ? '1' : '0';
      } else if (typeof filters.activo === 'boolean') {
        params.activo = filters.activo ? '1' : '0';
      }
    }

    // Ordenamiento
    if (filters.order_by) {
      params.order_by = filters.order_by;
    }
    if (filters.order_dir) {
      params.order_dir = filters.order_dir;
    }

    // Paginación
    if (filters.page) {
      params.page = filters.page;
    }
    if (filters.per_page) {
      params.per_page = filters.per_page;
    }

    // All
    if (filters.all) {
      params.all = filters.all;
    }
  }

  return client.get('/construccion/apu-items', { params });
};

export const getApuItemsActivos = () => {
  return client.get('/construccion/apu-items', {
    params: {
      activo: '1',
      all: '1',
      order_by: 'codigo',
      order_dir: 'asc',
    },
  });
};

/**
 * Obtener  Items activos filtrados por categoría
*/
export const getApuItemsPorCategoria = (categoriaId: number) => {
  return client.get('/construccion/apu-items', {
    params: {
      activo: '1',
      all: '1',
      categoria_id: categoriaId, 
      order_by: 'codigo',
      order_dir: 'asc',
    },
  });
};

// Obtener item por ID
export const getApuItemById = (id: number) => {
  return client.get(`/construccion/apu-items/${id}`);
};

// Crear nuevo item
export const createApuItem = (data: CreateApuItemData) => {
  return client.post('/construccion/apu-items', data);
};

// Actualizar item
export const updateApuItem = (id: number, data: UpdateApuItemData) => {
  return client.put(`/construccion/apu-items/${id}`, data);
};

// Activar/Inactivar item
export const toggleApuItemEstado = (id: number) => {
  return client.patch(`/construccion/apu-items/${id}/toggle-estado`);
};

// Eliminar item
export const deleteApuItem = (id: number) => {
  return client.delete(`/construccion/apu-items/${id}`);
};