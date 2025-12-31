import client from '../config/client';

interface UnidadFilters {
  
  buscar?: string; 
  activo?: boolean | string; 
  order_by?: string;
  order_dir?: string;
  per_page?: number;
  page?: number;
  all?: boolean;
}

interface CreateUnidadData {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

interface UpdateUnidadData {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

// Listar unidades con filtros
export const getUnidades = (filters?: UnidadFilters) => {
  const params: Record<string, any> = {};

  if (filters) {

    // Búsqueda
    if (filters.buscar) {
      params.buscar = filters.buscar;
    }

    //  Activo
    if (filters.activo !== undefined && filters.activo !== '') {
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
      params.all = '1';
    }
  }

  return client.get('/construccion/unidades', { params });
};

export const getUnidadesActivas = () => {
  return client.get('/construccion/unidades', {
    params: {
      all: '1',
      activo: '1',
      order_by: 'codigo',
      order_dir: 'asc',
    },
  });
};

// Obtener unidad por ID
export const getUnidadById = (id: number) => {
  return client.get(`/construccion/unidades/${id}`);
};

// Crear nueva unidad
export const createUnidad = (data: CreateUnidadData) => {
  return client.post('/construccion/unidades', data);
};

// Actualizar unidad
export const updateUnidad = (id: number, data: UpdateUnidadData) => {
  return client.put(`/construccion/unidades/${id}`, data);
};
