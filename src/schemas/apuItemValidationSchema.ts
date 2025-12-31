import * as Yup from 'yup';
import { checkCodigoUnicoApuItem } from '../services/validationServices';

// ==========================================
// VALIDACIÓN - APU ITEMS
// ==========================================

export const apuItemValidationSchema = Yup.object().shape({
  // PASO 1: Datos Básicos
  codigo: Yup.string()
    .required('El código es obligatorio')
    .max(50, 'El código no puede exceder 50 caracteres')
    .trim()
    .matches(
      /^[A-Za-z0-9-_]+$/,
      'Solo letras, números, guiones (-) y guiones bajos (_)'
    )
    .test(
      'unique-codigo',
      'Este código ya existe. Por favor, usa otro código.',
      async function (value) {
        if (!value) return true;
        const { parent } = this;
        const currentId = parent?.id;
        const isUnique = await checkCodigoUnicoApuItem(value, currentId);
        return isUnique;
      }
    ),

  descripcion: Yup.string()
    .required('La descripción es obligatoria')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim(),

  categoria_id: Yup.mixed()
    .test('required', 'La categoría es obligatoria', (value) => {
      return value !== '' && value !== null && value !== undefined;
    })
    .test('valid-number', 'Debe seleccionar una categoría válida', (value) => {
      if (value === '' || value === null || value === undefined) return false;
      const num = Number(value);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    }),

  unidad_id: Yup.mixed()
    .test('required', 'La unidad es obligatoria', (value) => {
      return value !== '' && value !== null && value !== undefined;
    })
    .test('valid-number', 'Debe seleccionar una unidad válida', (value) => {
      if (value === '' || value === null || value === undefined) return false;
      const num = Number(value);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    }),

  // PASO 2: Precios (estructura anidada)
  precio: Yup.object().shape({
    precio_material: Yup.number()
      .min(0, 'El precio no puede ser negativo')
      .max(9999999.99, 'El precio no puede exceder 9,999,999.99')
      .test('max-decimals', 'Máximo 2 decimales', (value) => {
        if (value === undefined || value === null) return true;
        const decimals = (value.toString().split('.')[1] || '').length;
        return decimals <= 2;
      })
      .transform((value, originalValue) => {
        if (originalValue === '' || originalValue === null || originalValue === undefined) {
          return 0;
        }
        return value;
      }),

    precio_mano_obra: Yup.number()
      .min(0, 'El precio no puede ser negativo')
      .max(9999999.99, 'El precio no puede exceder 9,999,999.99')
      .test('max-decimals', 'Máximo 2 decimales', (value) => {
        if (value === undefined || value === null) return true;
        const decimals = (value.toString().split('.')[1] || '').length;
        return decimals <= 2;
      })
      .transform((value, originalValue) => {
        if (originalValue === '' || originalValue === null || originalValue === undefined) {
          return 0;
        }
        return value;
      }),

    precio_equipo: Yup.number()
      .min(0, 'El precio no puede ser negativo')
      .max(9999999.99, 'El precio no puede exceder 9,999,999.99')
      .test('max-decimals', 'Máximo 2 decimales', (value) => {
        if (value === undefined || value === null) return true;
        const decimals = (value.toString().split('.')[1] || '').length;
        return decimals <= 2;
      })
      .transform((value, originalValue) => {
        if (originalValue === '' || originalValue === null || originalValue === undefined) {
          return 0;
        }
        return value;
      }),

    precio_total: Yup.number()
      .min(0, 'El precio total no puede ser negativo'),
  }),
});

// ==========================================
// SCHEMAS POR PASO (para validación incremental)
// ==========================================

// Schema solo para PASO 1
export const apuItemStep1Schema = Yup.object().shape({
  codigo: Yup.string()
    .required('El código es obligatorio')
    .max(50, 'El código no puede exceder 50 caracteres')
    .trim()
    .matches(
      /^[A-Za-z0-9-_]+$/,
      'Solo letras, números, guiones (-) y guiones bajos (_)'
    )
    .test(
      'unique-codigo',
      'Este código ya existe. Por favor, usa otro código.',
      async function (value) {
        if (!value) return true;
        const { parent } = this;
        const currentId = parent?.id;
        const isUnique = await checkCodigoUnicoApuItem(value, currentId);
        return isUnique;
      }
    ),

  descripcion: Yup.string()
    .required('La descripción es obligatoria')
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim(),

  categoria_id: Yup.mixed()
    .test('required', 'La categoría es obligatoria', (value) => {
      return value !== '' && value !== null && value !== undefined;
    })
    .test('valid-number', 'Debe seleccionar una categoría válida', (value) => {
      if (value === '' || value === null || value === undefined) return false;
      const num = Number(value);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    }),

  unidad_id: Yup.mixed()
    .test('required', 'La unidad es obligatoria', (value) => {
      return value !== '' && value !== null && value !== undefined;
    })
    .test('valid-number', 'Debe seleccionar una unidad válida', (value) => {
      if (value === '' || value === null || value === undefined) return false;
      const num = Number(value);
      return !isNaN(num) && num > 0 && Number.isInteger(num);
    }),
});

// ==========================================
// VALORES INICIALES
// ==========================================

export const getInitialValues = (itemEdit: any = null) => {
  if (itemEdit) {
    // Modo edición
    return {
      id: itemEdit.id,
      codigo: itemEdit.codigo || '',
      descripcion: itemEdit.descripcion || '',
      categoria_id: itemEdit.categoria_id || '',
      unidad_id: itemEdit.unidad_id || '',
      precio: {
        precio_material: itemEdit.precio?.precio_material ?? '',
        precio_mano_obra: itemEdit.precio?.precio_mano_obra ?? '',
        precio_equipo: itemEdit.precio?.precio_equipo ?? '',
        precio_total: itemEdit.precio?.precio_total ?? 0,
      },
    };
  }

  // Modo creación
  return {
    codigo: '',
    descripcion: '',
    categoria_id: '',
    unidad_id: '',
    precio: {
      precio_material: '',
      precio_mano_obra: '',
      precio_equipo: '',
      precio_total: 0,
    },
  };
};