import * as Yup from 'yup';

// ==========================================
// VALIDAR DECIMALES 
// ==========================================

const validarDecimales = (maxDecimales: number, nombreCampo: string) => {
  return Yup.number().test(
    'max-decimals',
    `${nombreCampo} puede tener hasta ${maxDecimales} decimales`,
    (value) => {
      if (value === undefined || value === null) return true;
      const decimals = (value.toString().split('.')[1] || '').length;
      return decimals <= maxDecimales;
    }
  );
};

// ==========================================
// VALIDACIÓN DATOS GENERALES
// ==========================================

export const ValidateDatosGenerales = Yup.object().shape({
  cliente_id: Yup.number()
    .required('El cliente es obligatorio')
    .positive('Debe seleccionar un cliente válido')
    .integer('Debe seleccionar un cliente válido'),

  nombre_proyecto: Yup.string()
    .required('El nombre del proyecto es obligatorio')
    .max(255, 'El nombre del proyecto no puede exceder 255 caracteres')
    .trim(),

  ubicacion_obra: Yup.string()
    .max(255, 'La ubicación no puede exceder 255 caracteres')
    .trim()
    .nullable(),

  tipo: Yup.string()
    .required('El tipo de presupuesto es obligatorio')
    .oneOf(['cotizacion', 'contrato'], 'El tipo debe ser cotización o contrato'),

  fecha_emision: Yup.date()
    .required('La fecha de emisión es obligatoria')
    .typeError('Debe ingresar una fecha válida'),

  // Porcentajes presupuestos (opcionales)
  porcentaje_cargas_sociales: validarDecimales(2, 'El porcentaje de cargas sociales')
    .min(0, 'El porcentaje no puede ser negativo')
    .max(100, 'El porcentaje no puede exceder 100')
    .nullable(),

  porcentaje_iva_mano_obra: validarDecimales(2, 'El porcentaje de IVA mano de obra')
    .min(0, 'El porcentaje no puede ser negativo')
    .max(100, 'El porcentaje no puede exceder 100')
    .nullable(),

  porcentaje_herramientas: validarDecimales(2, 'El porcentaje de herramientas')
    .min(0, 'El porcentaje no puede ser negativo')
    .max(100, 'El porcentaje no puede exceder 100')
    .nullable(),

  porcentaje_gastos_generales: validarDecimales(2, 'El porcentaje de gastos generales')
    .min(0, 'El porcentaje no puede ser negativo')
    .max(100, 'El porcentaje no puede exceder 100')
    .nullable(),

  porcentaje_utilidad: validarDecimales(2, 'El porcentaje de utilidad')
    .min(0, 'El porcentaje no puede ser negativo')
    .max(100, 'El porcentaje no puede exceder 100')
    .nullable(),

  porcentaje_impuestos_it: validarDecimales(2, 'El porcentaje de impuestos IT')
    .min(0, 'El porcentaje no puede ser negativo')
    .max(100, 'El porcentaje no puede exceder 100')
    .nullable(),
});

// ==========================================
// SCHEMA: VALIDACIÓN DE UN ITEM
// ==========================================

const itemValidationSchema = Yup.object().shape({
  apu_item_id: Yup.number()
    .required('El ítem APU es obligatorio')
    .positive('Debe seleccionar un ítem APU válido')
    .integer('Debe seleccionar un ítem APU válido'),

  cantidad: validarDecimales(4, 'La cantidad')
    .required('La cantidad es obligatoria')
    .min(0.0001, 'La cantidad debe ser mayor a 0')
    .max(99999.9999, 'La cantidad excede el límite permitido'),

  precio_unitario: validarDecimales(4, 'El precio unitario')
    .required('El precio unitario es obligatorio')
    .min(0, 'El precio unitario no puede ser negativo')
    .max(999999999.9999, 'El precio unitario excede el límite permitido'),
});

// ==========================================
// SCHEMA: VALIDACIÓN COMPLETA DEL PRESUPUESTO
// ==========================================

export const presupuestoValidationSchema = Yup.object().shape({
  ...ValidateDatosGenerales.fields,
  detalles: Yup.array()
    .of(itemValidationSchema)
    .min(1, 'Debe agregar al menos un ítem al presupuesto')
    .required('Debe agregar al menos un ítem al presupuesto'),
});

// ==========================================
// FUNCIÓN: VALIDAR ITEM INDIVIDUAL
// ==========================================

export const validateItem = (item: {
  apu_item_id?: number;
  cantidad?: number;
  precio_unitario?: number;
}): string | null => {
  if (!item.apu_item_id) {
    return 'Debe seleccionar un ítem APU';
  }

  if (!item.cantidad || item.cantidad <= 0) {
    return 'La cantidad debe ser mayor a 0';
  }

  if (item.cantidad > 99999.9999) {
    return 'La cantidad excede el límite permitido (máx: 99999.9999)';
  }

  const cantidadDecimals = (item.cantidad.toString().split('.')[1] || '').length;
  if (cantidadDecimals > 4) {
    return 'La cantidad puede tener hasta 4 decimales';
  }

  if (item.precio_unitario === undefined || item.precio_unitario < 0) {
    return 'El precio unitario no puede ser negativo';
  }

  if (item.precio_unitario > 999999999.9999) {
    return 'El precio unitario excede el límite permitido';
  }

  const precioDecimals = (item.precio_unitario.toString().split('.')[1] || '').length;
  if (precioDecimals > 4) {
    return 'El precio unitario puede tener hasta 4 decimales';
  }

  return null;
};

// ==========================================
// FUNCIÓN: VALIDAR LISTA DE DETALLES
// ==========================================

export const validateDetalles = (detalles: any[]): string | null => {
  if (!detalles || detalles.length === 0) {
    return 'Debe agregar al menos un ítem al presupuesto';
  }

  for (let i = 0; i < detalles.length; i++) {
    const error = validateItem(detalles[i]);
    if (error) {
      return `Ítem ${i + 1}: ${error}`;
    }
  }

  return null;
};

// ==========================================
// FUNCIÓN: VALORES INICIALES
// ==========================================

export const getInitialValues = (itemEdit: any = null) => {
  const today = new Date().toISOString().split('T')[0];

  if (itemEdit) {
    return {
      cliente_id: itemEdit.cliente?.id || '',
      nombre_proyecto: itemEdit.nombre_proyecto || '',
      ubicacion_obra: itemEdit.ubicacion_obra || '',
      tipo: itemEdit.tipo || 'cotizacion',
      fecha_emision: itemEdit.fecha_emision || today,

      // Porcentajes presupuestos
      porcentaje_cargas_sociales: itemEdit.porcentaje_cargas_sociales || 55.00,
      porcentaje_iva_mano_obra: itemEdit.porcentaje_iva_mano_obra || 14.94,
      porcentaje_herramientas: itemEdit.porcentaje_herramientas || 5.00,
      porcentaje_gastos_generales: itemEdit.porcentaje_gastos_generales || 10.00,
      porcentaje_utilidad: itemEdit.porcentaje_utilidad || 10.00,
      porcentaje_impuestos_it: itemEdit.porcentaje_impuestos_it || 3.09,
    };
  }

  return {
    cliente_id: '',
    nombre_proyecto: '',
    ubicacion_obra: '',
    tipo: 'cotizacion',
    fecha_emision: today,
    
    // Defaults porcentajes presupuestos
    porcentaje_cargas_sociales: 55.00,
    porcentaje_iva_mano_obra: 14.94,
    porcentaje_herramientas: 5.00,
    porcentaje_gastos_generales: 10.00,
    porcentaje_utilidad: 10.00,
    porcentaje_impuestos_it: 3.09,
  };
};