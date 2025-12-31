import client from '../config/client';

// ==========================================
// INTERFACES
// ==========================================

interface Material {
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

interface MaterialFormData {
  descripcion: string;
  unidad_id: number | '';
  apu_item_id: number | '';
  rendimiento: number | '';             
  precio_unitario: number | '';         
  vigente_desde: string;
  vigente_hasta?: string;
}

interface GetAllParams {
  buscar?: string;
  categoria_id?: number;
  apu_item_id?: number;
  unidad_id?: number;
  moneda?: string;
  estado_vigencia?: string;
  activo?: string;
  page?: number;
  perPage?: number;
  order_by?: string;
  order_dir?: 'asc' | 'desc';
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

const materialService = {
  /**
   * Obtener lista de materiales con filtros y paginación
   */
  async getAll(params?: GetAllParams): Promise<ApiResponse<Material[]>> {
    const queryParams: Record<string, any> = {};

    if (params?.buscar) queryParams.buscar = params.buscar;
    if (params?.categoria_id) queryParams.categoria_id = params.categoria_id;
    if (params?.apu_item_id) queryParams.apu_item_id = params.apu_item_id;
    if (params?.unidad_id) queryParams.unidad_id = params.unidad_id;
    if (params?.moneda) queryParams.moneda = params.moneda;
    if (params?.estado_vigencia) queryParams.estado_vigencia = params.estado_vigencia;
    if (params?.activo !== '' && params?.activo !== undefined) {
      queryParams.activo = params.activo;
    }
    if (params?.page) queryParams.page = params.page;
    if (params?.perPage) queryParams.perPage = params.perPage;
    if (params?.all) queryParams.all = params.all;
    const response = await client.get<ApiResponse<Material[]>>('/construccion/materiales', {
      params: queryParams,
    });

    return response.data;
  },

  /**
   * Obtener un registro específico por ID
   */
  async getById(id: number): Promise<ApiResponse<Material>> {
    const response = await client.get<ApiResponse<Material>>(`/construccion/materiales/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo material
   */
  async create(data: MaterialFormData): Promise<ApiResponse<Material>> {
    const payload = {
      descripcion: data.descripcion,
      unidad_id: data.unidad_id,
      apu_item_id: data.apu_item_id,
      rendimiento: data.rendimiento,              
      precio_unitario: data.precio_unitario,      
      vigente_desde: data.vigente_desde,
      vigente_hasta: data.vigente_hasta || null,
    };

    const response = await client.post<ApiResponse<Material>>('/construccion/materiales', payload);
    return response.data;
  },

  /**
   * Actualizar material existente
   */
  async update(id: number, data: MaterialFormData): Promise<ApiResponse<Material>> {
    const payload = {
      descripcion: data.descripcion,
      unidad_id: data.unidad_id,
      apu_item_id: data.apu_item_id,
      rendimiento: data.rendimiento,           
      precio_unitario: data.precio_unitario,
      vigente_desde: data.vigente_desde,
      vigente_hasta: data.vigente_hasta || null,
    };

    const response = await client.put<ApiResponse<Material>>(`/construccion/materiales/${id}`, payload);
    return response.data;
  },

  /**
   * Cambiar estado activo/inactivo
   */
  async toggleEstado(id: number): Promise<ApiResponse<{ id: number; descripcion: string; activo: boolean }>> {
    const response = await client.patch<ApiResponse<{ id: number; descripcion: string; activo: boolean }>>(
      `/construccion/materiales/${id}/toggle-estado`
    );
    return response.data;
  },
};

export default materialService;