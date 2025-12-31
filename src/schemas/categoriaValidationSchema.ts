import * as Yup from 'yup';
import { checkNombreUnicoCategoria } from '../services/validationServices';

// ==========================================
// SCHEMA DE VALIDACIÓN - CATEGORÍA
// ==========================================

export const categoriaValidationSchema = Yup.object().shape({
  // Nombre
  nombre: Yup.string()
    .required('El nombre es obligatorio')
    .max(120, 'El nombre no puede exceder 120 caracteres')
    .trim()
    .test(
      'unique-nombre',
      'Ya existe una categoría con este nombre',
      async function (value) {
        if (!value) return true;
        const { parent } = this;
        const currentId = parent?.id;
        const isUnique = await checkNombreUnicoCategoria(value, currentId);
        return isUnique;
      }
    ),
});

// ==========================================
// VALORES INICIALES
// ==========================================

export const getInitialValues = (categoriaEdit: any = null) => {
  if (categoriaEdit) {
    // Modo edición
    return {
      id: categoriaEdit.id,
      nombre: categoriaEdit.nombre || '',
    };
  }

  // Modo creación
  return {
    nombre: '',
  };
};