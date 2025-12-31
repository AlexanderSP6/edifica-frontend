import * as Yup from 'yup';

// ==========================================
// SCHEMA DE VALIDACIÓN - material
// ==========================================

// Fecha máxima permitida
const maxFutureDate = new Date();
maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 10);

export const materialValidationSchema = Yup.object().shape({
  // Descripción
  descripcion: Yup.string()
    .required('La descripción es obligatoria')
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .trim(),

  // Unidad
  unidad_id: Yup.number()
    .required('La unidad es obligatoria')
    .positive('Debe seleccionar una unidad válida')
    .integer('Debe seleccionar una unidad válida'),

  // APU Item
  apu_item_id: Yup.number()
    .required('El APU Item es obligatorio')
    .positive('Debe seleccionar un APU Item válido')
    .integer('Debe seleccionar un APU Item válido'),

  // Rendimiento
  rendimiento: Yup.number()
    .required('El rendimiento es obligatorio')
    .min(0, 'El rendimiento debe ser un número positivo')
    .max(9999.9999, 'El rendimiento no puede exceder 9999.9999')
    .test(
      'max-decimals',
      'El rendimiento puede tener hasta 4 decimales',
      (value) => {
        if (value === undefined || value === null) return true;
        const decimals = (value.toString().split('.')[1] || '').length;
        return decimals <= 4;
      }
    ),

  // Precio Unitario
  precio_unitario: Yup.number()
    .required('El precio unitario es obligatorio')
    .min(0, 'El precio debe ser un número positivo')
    .max(9999999.99, 'El precio no puede exceder 9,999,999.99')
    .test(
      'max-decimals',
      'El precio puede tener hasta 2 decimales',
      (value) => {
        if (value === undefined || value === null) return true;
        const decimals = (value.toString().split('.')[1] || '').length;
        return decimals <= 2;
      }
    ),

  // Vigente Desde
  vigente_desde: Yup.date()
    .required('La fecha de vigencia desde es obligatoria')
    .typeError('Debe ingresar una fecha válida')
    .min(
      new Date('2000-01-01'),
      'La fecha no puede ser anterior al año 2000'
    ),

  // Vigente Hasta (opcional)
  vigente_hasta: Yup.date()
    .nullable()
    .min(
      Yup.ref('vigente_desde'),
      'La fecha hasta debe ser posterior a la fecha desde'
    )
    .max(
      maxFutureDate,
      'La fecha no puede ser más de 10 años en el futuro'
    )
    .typeError('Debe ingresar una fecha válida'),

  // Categoría (solo para filtro)
  categoria_id: Yup.number()
    .nullable()
    .transform((value, originalValue) => 
      originalValue === '' ? null : value
    ),
});

// ==========================================
// VALORES INICIALES
// ==========================================

export const getInitialValues = (itemEdit: any = null) => {
  const today = new Date().toISOString().split('T')[0];

  if (itemEdit) {
    // Modo edición
    return {
      descripcion: itemEdit.descripcion || '',
      categoria_id: itemEdit.apu_item?.categoria?.id || null,
      unidad_id: itemEdit.unidad_id || '',
      apu_item_id: itemEdit.apu_item_id || '',
      rendimiento: itemEdit.rendimiento || '',
      precio_unitario: itemEdit.precio_unitario || '',
      vigente_desde: itemEdit.vigente_desde || today,
      vigente_hasta: itemEdit.vigente_hasta || '',
    };
  }

  // Modo creación
  return {
    descripcion: '',
    categoria_id: null,
    unidad_id: '',
    apu_item_id: '',
    rendimiento: '',
    precio_unitario: '',
    vigente_desde: today,
    vigente_hasta: '',
  };
};