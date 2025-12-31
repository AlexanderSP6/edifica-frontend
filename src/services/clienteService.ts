import client from '../config/client';

// ==========================================
// INTERFACES
// ==========================================

interface Cliente {
  id: number;
  tipo_cliente: string;
  tipo_cliente_formateado: string;
  ci: string;
  nombre_completo: string;
  telefono: string | null;
  email: string | null;
  activo: boolean;
  presupuestos_count: number;
  created_at: string;
  updated_at: string;
}

interface ClienteFormData {
  tipo_cliente: string;
  ci: string;
  nombre_completo: string;
  telefono?: string;
  email?: string;
}

interface GetAllParams {
  buscar?: string;
  tipo_cliente?: string;
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

const clienteService = {
  /**
   * Obtener lista de clientes con filtros y paginación
   */
  async getAll(params?: GetAllParams): Promise<ApiResponse<Cliente[]>> {
    const queryParams: Record<string, any> = {};

    if (params?.buscar) queryParams.buscar = params.buscar;
    if (params?.tipo_cliente) queryParams.tipo_cliente = params.tipo_cliente;
    if (params?.activo !== '' && params?.activo !== undefined) {
      queryParams.activo = params.activo;
    }
    if (params?.page) queryParams.page = params.page;
    if (params?.perPage) queryParams.perPage = params.perPage;
    if (params?.orderBy) queryParams.orderBy = params.orderBy;
    if (params?.orderDirection) queryParams.orderDirection = params.orderDirection;
    if (params?.all) queryParams.all = params.all;

    const response = await client.get<ApiResponse<Cliente[]>>('/construccion/clientes', {
      params: queryParams,
    });

    return response.data;
  },

  /**
   * Obtener un cliente específico por ID
   */
  async getById(id: number): Promise<ApiResponse<Cliente>> {
    const response = await client.get<ApiResponse<Cliente>>(`/construccion/clientes/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo cliente
   */
  async create(data: ClienteFormData): Promise<ApiResponse<Cliente>> {
    const response = await client.post<ApiResponse<Cliente>>('/construccion/clientes', data);
    return response.data;
  },

  /**
   * Actualizar cliente existente
   */
  async update(id: number, data: ClienteFormData): Promise<ApiResponse<Cliente>> {
    const response = await client.put<ApiResponse<Cliente>>(`/construccion/clientes/${id}`, data);
    return response.data;
  },

  /**
   * Cambiar estado activo/inactivo
   */
  async toggleEstado(id: number): Promise<ApiResponse<{ id: number; nombre_completo: string; activo: boolean }>> {
    const response = await client.patch<ApiResponse<{ id: number; nombre_completo: string; activo: boolean }>>(
      `/construccion/clientes/${id}/toggle-estado`
    );
    return response.data;
  },

  /**
   * Eliminar cliente
   */
  async delete(id: number): Promise<ApiResponse<null>> {
    const response = await client.delete<ApiResponse<null>>(`/construccion/clientes/${id}`);
    return response.data;
  },
};

export default clienteService;