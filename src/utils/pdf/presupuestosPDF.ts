import { PDFModuleConfig } from './pdfConfig';

// ==========================================
// CONFIGURACIÓN PDF PARA LISTA DE PRESUPUESTOS
// ==========================================
export const presupuestosPDFConfig: PDFModuleConfig = {
  title: 'Listado de Presupuestos',
  subtitle: 'Proyectos de Construcción',
  fileName: 'presupuestos_edifica',
  
  columns: [
    {
      header: 'N°',
      dataKey: 'index',
      width: 10,
      align: 'center',
    },
    {
      header: 'Proyecto',
      dataKey: 'nombre_proyecto',
      width: 55,
      align: 'left',
    },
    {
      header: 'Cliente',
      dataKey: 'cliente_nombre',
      width: 45,
      align: 'left',
    },
    {
      header: 'CI Cliente',
      dataKey: 'cliente_ci',
      width: 25,
      align: 'center',
    },
    {
      header: 'Tipo',
      dataKey: 'tipo_formateado',
      width: 25,
      align: 'center',
    },
    {
      header: 'Fecha Emisión',
      dataKey: 'fecha_emision',
      width: 28,
      align: 'center',
      format: (value: string) => {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('es-BO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      },
    },
    {
      header: 'Total',
      dataKey: 'total_presupuesto',
      width: 30,
      align: 'right',
      format: (value: number) => `Bs ${value.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      header: 'Items',
      dataKey: 'items_count',
      width: 15,
      align: 'center',
    },
    {
      header: 'Última Act.',
      dataKey: 'updated_at',
      width: 25,
      align: 'center',
      format: (value: string | Date) => {
        if (!value) return '-';
        
        const date = typeof value === 'string' ? new Date(value) : value;
        
        return date.toLocaleDateString('es-BO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      },
    },
    {
      header: 'Estado',
      dataKey: 'activo',
      width: 18,
      align: 'center',
      format: (value: boolean) => value ? 'Activo' : 'Inactivo',
    },
  ],
};

// ==========================================
// FUNCIÓN AUXILIAR PARA TRANSFORMAR DATOS
// ==========================================
export const transformPresupuestosForPDF = (presupuestos: any[]): any[] => {
  return presupuestos.map((item, index) => ({
    index: index + 1,
    nombre_proyecto: item.nombre_proyecto || '-',
    cliente_nombre: item.cliente?.nombre_completo || '-',
    cliente_ci: item.cliente?.ci || '-',
    tipo_formateado: item.tipo_formateado || '-',
    fecha_emision: item.fecha_emision || null,
    total_presupuesto: item.total_presupuesto || 0,
    items_count: item.items_count || 0,
    updated_at: item.updated_at || null,
    activo: item.activo,
  }));
};