import client from '../config/client';

interface CategoriaFilters {
  buscar?: string;
   activo?: boolean | string;
  fecha_desde?: string;
  fecha_hasta?: string;
  order_by?: string;
  order_dir?: string;
  per_page?: number;
  page?: number;
  all?: boolean;
}

interface CreateCategoriaData {
    nombre: string;
}

interface UpdateCategoriaData {
    nombre: string;
}

// Listar categorías con filtros
export const getCategorias = (filters?: CategoriaFilters) => {
  // Construir params manualmente para tener control sobre los valores
  const params: Record<string, any> = {};

  if (filters) {
    // Búsqueda
    if (filters.buscar) {
      params.buscar = filters.buscar;
    }

    // Activo: convertir boolean a '1' o '0'
    if (filters.activo !== undefined && filters.activo !== '' && filters.activo !== true) {
      if (typeof filters.activo === 'string') {
        params.activo = filters.activo === 'true' ? '1' : '0';
      } else if (typeof filters.activo === 'boolean') {
        params.activo = filters.activo ? '1' : '0';
      }
    }

    // Fechas
    if (filters.fecha_desde) {
      params.fecha_desde = filters.fecha_desde;
    }
    if (filters.fecha_hasta) {
      params.fecha_hasta = filters.fecha_hasta;
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
  return client.get('/construccion/categorias', { params });
};

export const getCategoriasActivas = () => {
  return client.get('/construccion/categorias', {
    params: {
      all: '1',
      activo: '1',
      order_by: 'nombre',
      order_dir: 'asc',
    },
  });
};
// Obtener categoría por ID
export const getCategoriaById = (id: number) => {
  return client.get(`/construccion/categorias/${id}`);
};

// Crear nueva categoría
export const createCategoria = (data: CreateCategoriaData) => {
  return client.post('/construccion/categorias', data);
};

// Actualizar categoría
export const updateCategoria = (id: number, data: UpdateCategoriaData) => {
  return client.put(`/construccion/categorias/${id}`, data);
};

// Activar/Inactivar categoría
export const toggleCategoriaEstado = (id: number) => {
  return client.patch(`/construccion/categorias/${id}/toggle-estado`);
};
