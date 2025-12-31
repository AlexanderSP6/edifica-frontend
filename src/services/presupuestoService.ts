import client from '../config/client';
import type {
  Presupuesto,
  PresupuestoCompleto,
  PresupuestoFormData,
  GetAllParams,
  ApiResponse,
  DatosReportePDF,
  DatosReporteB1
} from '../types/presupuesto.types';

// ==========================================
// SERVICE
// ==========================================

const presupuestoService = {
  /**
   * Obtener lista de presupuestos con filtros y paginación
   */
  async getAll(params?: GetAllParams): Promise<ApiResponse<Presupuesto[]>> {
    const queryParams: Record<string, any> = {};

    if (params?.buscar) queryParams.buscar = params.buscar;
    if (params?.cliente_id) queryParams.cliente_id = params.cliente_id;
    if (params?.tipo) queryParams.tipo = params.tipo;
    if (params?.fecha_desde) queryParams.fecha_desde = params.fecha_desde;
    if (params?.fecha_hasta) queryParams.fecha_hasta = params.fecha_hasta;
    if (params?.activo !== '' && params?.activo !== undefined) {
      queryParams.activo = params.activo;
    }
    if (params?.page) queryParams.page = params.page;
    if (params?.perPage) queryParams.perPage = params.perPage;
    if (params?.orderBy) queryParams.orderBy = params.orderBy;
    if (params?.orderDirection) queryParams.orderDirection = params.orderDirection;
    if (params?.all) queryParams.all = params.all;

    const response = await client.get<ApiResponse<Presupuesto[]>>('/construccion/presupuestos', {
      params: queryParams,
    });

    return response.data;
  },

  /**
   * Obtener un presupuesto específico con detalles completos
   */
  async getById(id: number): Promise<ApiResponse<PresupuestoCompleto>> {
    const response = await client.get<ApiResponse<PresupuestoCompleto>>(
      `/construccion/presupuestos/${id}`
    );
    return response.data;
  },

  /**
   * Crear nuevo presupuesto con detalles
   */
  async create(data: PresupuestoFormData): Promise<ApiResponse<PresupuestoCompleto>> {
    const response = await client.post<ApiResponse<PresupuestoCompleto>>(
      '/construccion/presupuestos',
      data
    );
    return response.data;
  },

  /**
   * Actualizar presupuesto existente
   */
  async update(id: number, data: PresupuestoFormData): Promise<ApiResponse<PresupuestoCompleto>> {
    const response = await client.put<ApiResponse<PresupuestoCompleto>>(
      `/construccion/presupuestos/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Cambiar estado activo/inactivo
   */
  async toggleEstado(
    id: number
  ): Promise<ApiResponse<{ id: number; nombre_proyecto: string; activo: boolean }>> {
    const response = await client.patch
      <ApiResponse<{ id: number; nombre_proyecto: string; activo: boolean }>
    >(`/construccion/presupuestos/${id}/toggle-estado`);
    return response.data;
  },

  /**
   * Eliminar presupuesto
   */
  async delete(id: number): Promise<ApiResponse<null>> {
    const response = await client.delete<ApiResponse<null>>(`/construccion/presupuestos/${id}`);
    return response.data;
  },

  async getDatosReportePDF(id: number): Promise<DatosReportePDF> {
    const response = await client.get<ApiResponse<DatosReportePDF>>(
      `/construccion/presupuestos/${id}/reporte-pdf-datos`
    );
    return response.data.data;
  },

   async getDatosFormularioB1(id: number): Promise<DatosReporteB1> {
    const response = await client.get<ApiResponse<DatosReporteB1>>(
      `/construccion/presupuestos/${id}/formulario-b1-datos`
    );
    return response.data.data;
  },
};

export default presupuestoService;

export type { DatosReportePDF,DatosReporteB1};