import { PDFModuleConfig } from './pdfConfig';

// ==========================================
// CONFIGURACIÓN PDF PARA MANO DE OBRA
// ==========================================
export const manoObraPDFConfig: PDFModuleConfig = {
  title: 'Listado de Mano de Obra',
  subtitle: 'Recursos Humanos de Construcción',
  fileName: 'mano_obra_edifica',
  
  columns: [
    {
      header: 'N°',
      dataKey: 'index',
      width: 10,
      align: 'center',
    },
    {
      header: 'Descripción',
      dataKey: 'descripcion',
      width: 50,
      align: 'left',
    },
    {
      header: 'APU Item',
      dataKey: 'apu_item_codigo',
      width: 18,
      align: 'center',
    },
    {
      header: 'Categoría',
      dataKey: 'categoria_nombre',
      width: 48,
      align: 'left',
    },
    {
      header: 'Unidad',
      dataKey: 'unidad_codigo',
      width: 18,
      align: 'center',
    },
    {
      header: 'Rendimiento',
      dataKey: 'rendimiento',
      width: 22,
      align: 'right',
      format: (value: number) => value.toFixed(4),
    },
    {
      header: 'Precio Unit.',
      dataKey: 'precio_unitario',
      width: 22,
      align: 'right',
      format: (value: number) => `Bs ${value.toFixed(2)}`,
    },
    {
      header: 'Total',
      dataKey: 'total',
      width: 22,
      align: 'right',
      format: (value: number) => `Bs ${value.toFixed(2)}`,
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
      header: 'Vigencia',
      dataKey: 'estado_vigencia',
      width: 18,
      align: 'center',
      format: (value: string) => {
        const estados: Record<string, string> = {
          vigente: 'Vigente',
          proximo: 'Próximo',
          vencido: 'Vencido',
        };
        return estados[value] || value;
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
export const transformManoObraForPDF = (manoObra: any[]): any[] => {
  return manoObra.map((item, index) => ({
    index: index + 1,
    descripcion: item.descripcion || '-',
    apu_item_codigo: item.apu_item?.codigo || '-',
    categoria_nombre: item.apu_item?.categoria?.nombre || '-',
    unidad_codigo: item.unidad?.codigo || '-',
    rendimiento: item.rendimiento || 0,
    precio_unitario: item.precio_unitario || 0,
    total: item.total || 0,
    updated_at: item.updated_at || null,
    estado_vigencia: item.estado_vigencia || '-',
    activo: item.activo,
  }));
};