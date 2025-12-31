import client from '../config/client';

// ==========================================
// INTERFACES
// ==========================================

interface Equipo {
  id: number;
  descripcion: string;
  unidad_id: number;
  unidad: {
    id: number;
    codigo: string;
    nombre: string;
  };
  apu_item_id: number;
  apu_item: {
    id: number;
    codigo: string;
    descripcion: string;
    categoria?: {
      id: number;
      codigo: string;
      nombre: string;
    };
  };
  rendimiento: number;
  precio_unitario: number;
  total: number;
  moneda: string;
  vigente_desde: string;
  vigente_hasta: string | null;
  estado_vigencia: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface EquipoFormData {
  descripcion: string;
  unidad_id: number | '';
  apu_item_id: number | '';
  rendimiento: number | '';
  precio_unitario: number | '';
  moneda?: string;
  vigente_desde: string;
  vigente_hasta?: string;
}

interface GetAllParams {
  buscar?: string;
  categoria_id?: number;
  apu_item_id?: number;
  unidad_id?: number;
  estado_vigencia?: string;
  activo?: string;
  page?: number;
  perPage?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  all?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// ==========================================
// SERVICE
// ==========================================

const equipoService = {
  /**
   * Obtener lista de equipos con filtros y paginación
   */
  async getAll(params?: GetAllParams): Promise<ApiResponse<Equipo[]>> {
    const queryParams: Record<string, any> = {};

    if (params?.buscar) queryParams.buscar = params.buscar;
    if (params?.categoria_id) queryParams.categoria_id = params.categoria_id;
    if (params?.apu_item_id) queryParams.apu_item_id = params.apu_item_id;
    if (params?.unidad_id) queryParams.unidad_id = params.unidad_id;
    if (params?.estado_vigencia) queryParams.estado_vigencia = params.estado_vigencia;
    if (params?.activo !== '' && params?.activo !== undefined) {
      queryParams.activo = params.activo;
    }
    if (params?.page) queryParams.page = params.page;
    if (params?.perPage) queryParams.perPage = params.perPage;
    if (params?.orderBy) queryParams.orderBy = params.orderBy;
    if (params?.orderDirection) queryParams.orderDirection = params.orderDirection;
    if (params?.all) queryParams.all = params.all;

    const response = await client.get<ApiResponse<Equipo[]>>('/construccion/equipos', {
      params: queryParams,
    });

    return response.data;
  },

  /**
   * Obtener un registro específico por ID
   */
  async getById(id: number): Promise<ApiResponse<Equipo>> {
    const response = await client.get<ApiResponse<Equipo>>(`/construccion/equipos/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo equipo
   */
  async create(data: EquipoFormData): Promise<ApiResponse<Equipo>> {
    const payload = {
      descripcion: data.descripcion,
      unidad_id: data.unidad_id,
      apu_item_id: data.apu_item_id,
      rendimiento: data.rendimiento,
      precio_unitario: data.precio_unitario,
      moneda: data.moneda || 'BOB',
      vigente_desde: data.vigente_desde,
      vigente_hasta: data.vigente_hasta || null,
    };

    const response = await client.post<ApiResponse<Equipo>>('/construccion/equipos', payload);
    return response.data;
  },

  /**
   * Actualizar equipo existente
   */
  async update(id: number, data: EquipoFormData): Promise<ApiResponse<Equipo>> {
    const payload = {
      descripcion: data.descripcion,
      unidad_id: data.unidad_id,
      apu_item_id: data.apu_item_id,
      rendimiento: data.rendimiento,
      precio_unitario: data.precio_unitario,
      moneda: data.moneda || 'BOB',
      vigente_desde: data.vigente_desde,
      vigente_hasta: data.vigente_hasta || null,
    };

    const response = await client.put<ApiResponse<Equipo>>(`/construccion/equipos/${id}`, payload);
    return response.data;
  },

  /**
   * Cambiar estado activo/inactivo
   */
  async toggleEstado(id: number): Promise<ApiResponse<{ id: number; descripcion: string; activo: boolean }>> {
    const response = await client.patch<ApiResponse<{ id: number; descripcion: string; activo: boolean }>>(
      `/construccion/equipos/${id}/toggle-estado`
    );
    return response.data;
  },
};

export default equipoService;