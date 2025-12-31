// ==========================================
// TIPOS COMPARTIDOS DE PRESUPUESTO
// ==========================================

export interface Cliente {
  id: number;
  tipo_cliente: string;
  ci: string;
  nombre_completo: string;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}

export interface ApuItemSelect {
  id: number;
  codigo: string;
  descripcion: string;
  unidad: {
    id: number;
    codigo: string;
    nombre: string;
  };
  categoria: {
    id: number;
    nombre: string;
  };
  precio_actual: {
    precio_material: number;
    precio_mano_obra: number;
    precio_equipo: number;
    precio_total: number;
  } | null;
  activo: boolean;
}

export interface DetalleItem {
  apu_item_id: number;
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}


// ==========================================
// INTERFACES PARA FORMULARIO B-1
// ==========================================

export interface ItemB1 {
  numero: number;
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
}

export interface DatosReporteB1 {
  datos_generales: {
    numero_presupuesto: string;
    nombre_proyecto: string;
    cliente: string;
    modulo: string;
    moneda: string;
  };
  items: ItemB1[];
  total_presupuesto: number;
}

// ==========================================
// FORMULARIO B-2
// ==========================================

export interface DesgloseB2 {
  materiales: {
    total: number;
    porcentaje: number;
  };
  mano_obra: {
    subtotal: number;
    cargas_sociales: number;
    iva: number;
    total: number;
    porcentaje: number;
  };
  equipo: {
    base: number;
    herramientas: number;
    total: number;
    porcentaje: number;
  };
  gastos_generales: {
    monto: number;
    porcentaje: number;
  };
  utilidad: {
    monto: number;
    porcentaje: number;
  };
  impuestos_it: {
    monto: number;
    porcentaje: number;
  };
  total: number;
}

// ==========================================
// FORM-VALUES (Para Formik)
// ==========================================

export interface PresupuestoFormValues {
  cliente_id: number | '';
  nombre_proyecto: string;
  ubicacion_obra: string;
  tipo: 'cotizacion' | 'contrato' | '';
  fecha_emision: string;
  
  // Porcentajes B-2 (opcionales en create)
  porcentaje_cargas_sociales: number;
  porcentaje_iva_mano_obra: number;
  porcentaje_herramientas: number;
  porcentaje_gastos_generales: number;
  porcentaje_utilidad: number;
  porcentaje_impuestos_it: number;
}

// ==========================================
// PRESUPUESTO (Lista)
// ==========================================

export interface Presupuesto {
  id: number;
  cliente: Cliente;
  nombre_proyecto: string;
  ubicacion_obra: string | null;
  tipo: 'cotizacion' | 'contrato';
  tipo_formateado: string;
  fecha_emision: string;
  
  // Porcentajes B-2
  porcentaje_cargas_sociales: number;
  porcentaje_iva_mano_obra: number;
  porcentaje_herramientas: number;
  porcentaje_gastos_generales: number;
  porcentaje_utilidad: number;
  porcentaje_impuestos_it: number;
  
  // Totales calculados B-2
  total_materiales: number;
  subtotal_mano_obra: number;
  monto_cargas_sociales: number;
  monto_iva_mano_obra: number;
  total_mano_obra: number;
  total_equipo_base: number;
  monto_herramientas: number;
  total_equipo: number;
  monto_gastos_generales: number;
  monto_utilidad: number;
  monto_impuestos_it: number;
  total_presupuesto: number;
  
  items_count: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// PRESUPUESTO COMPLETO (Con detalles)
// ==========================================

export interface PresupuestoCompleto extends Omit<Presupuesto, 'items_count'> {
  detalles: PresupuestoDetalle[];
  desglose?: DesgloseB2;
}

export interface PresupuestoDetalle {
  id: number;
  apu_item: ApuItemDetalle;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface ApuItemDetalle {
  id: number;
  codigo: string;
  descripcion: string;
  unidad: {
    id: number;
    codigo: string;
    nombre: string;
  };
}

// ==========================================
// FORM DATA (Para enviar al backend)
// ==========================================

export interface DetalleFormData {
  apu_item_id: number;
  cantidad: number;
  precio_unitario: number;
}

export interface PresupuestoFormData {
  cliente_id: number;
  nombre_proyecto: string;
  ubicacion_obra?: string;
  tipo: 'cotizacion' | 'contrato';
  fecha_emision: string;
  
  // Porcentajes B-2 
  porcentaje_cargas_sociales?: number;
  porcentaje_iva_mano_obra?: number;
  porcentaje_herramientas?: number;
  porcentaje_gastos_generales?: number;
  porcentaje_utilidad?: number;
  porcentaje_impuestos_it?: number;
  
  detalles: DetalleFormData[];
}

// ==========================================
// PARAMETROS PARA API
// ==========================================

export interface GetAllParams {
  buscar?: string;
  cliente_id?: number;
  tipo?: 'cotizacion' | 'contrato' | '';
  fecha_desde?: string;
  fecha_hasta?: string;
  activo?: string;
  page?: number;
  perPage?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  all?: boolean;
}

export interface ApiResponse<T> {
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

// Interface para composición de ítems (materiales, MO, equipos)
export interface ItemComposicion {
  numero: number;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_productivo: number;
  costo_unitario: number;  
  costo_total?: number;
}

// Interface para ítem detallado con Formulario B-2
export interface ItemDetalladoB2 {
  numero?: number;
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad_presupuesto: number;

  composicion_detallada: {
    materiales: ItemComposicion[];
    mano_obra: ItemComposicion[];
    equipos: ItemComposicion[];
  };

  formulario_b2: {
    seccion_1_materiales: {
      items: ItemComposicion[];
      total: number;
    };
    seccion_2_mano_obra: {
      items: ItemComposicion[];
      subtotal: number;
      cargas_sociales: {
        porcentaje: number;
        monto: number;
        descripcion: string;
      };
      iva: {
        porcentaje: number;
        base: number;
        monto: number;
        descripcion: string;
      };
      total: number;
    };
    seccion_3_equipo: {
      items_equipo: ItemComposicion[];
      subtotal_equipo: number;
      herramientas: {
        porcentaje: number;
        monto: number;
        descripcion: string;
      };
      total: number;
    };
    seccion_4_gastos_generales: {
      porcentaje: number;
      base: number;
      monto: number;
      descripcion: string;
    };
    seccion_5_utilidad: {
      porcentaje: number;
      base: number;
      monto: number;
      descripcion: string;
    };
    seccion_6_impuestos: {
      porcentaje: number;
      base: number;
      monto: number;
      descripcion: string;
    };
    total_precio_unitario: number;
    precio_unitario_adoptado: number;
    aplicacion_presupuesto: AplicacionPresupuesto;
  };
}

// Interface para datos del reporte PDF
export interface DatosReportePDF {
  datos_generales: {
    id: number;
    numero_presupuesto: string;
    nombre_proyecto: string;
    ubicacion_obra?: string;
    tipo: string;
    tipo_formateado: string;
    fecha_emision: string;
    activo: boolean;
  };
  cliente: {
    nombre_completo: string;
    ci: string;
    tipo_cliente: string;
    telefono?: string;
    email?: string;
  };
  porcentajes_b2: {
    cargas_sociales: number;
    iva_mano_obra: number;
    herramientas: number;
    gastos_generales: number;
    utilidad: number;
    impuestos_it: number;
  };
  items_detallados: ItemDetalladoB2[];
  resumen_final: {
    desglose_bd: any;
    total_bd: number;
    suma_items_con_b2: number;
    diferencia: number;
  };
}

// Agregar esta interface
export interface AplicacionPresupuesto {
  cantidad: number;
  precio_unitario_adoptado: number;
  total_presupuesto: number;
}
