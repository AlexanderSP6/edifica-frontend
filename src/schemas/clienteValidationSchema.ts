import * as Yup from 'yup';

// ==========================================
// SCHEMA DE VALIDACIÓN - CLIENTE
// ==========================================

export const clienteValidationSchema = Yup.object().shape({
  // Tipo de Cliente
  tipo_cliente: Yup.string()
    .required('El tipo de cliente es obligatorio')
    .oneOf(['persona', 'empresa'], 'El tipo de cliente debe ser persona o empresa'),

  // CI
  ci: Yup.string()
    .required('El CI es obligatorio')
    .max(20, 'El CI no puede exceder 20 caracteres')
    .trim(),

  // Nombre Completo
  nombre_completo: Yup.string()
    .required('El nombre completo es obligatorio')
    .max(255, 'El nombre completo no puede exceder 255 caracteres')
    .trim(),

  // Teléfono (opcional)
  telefono: Yup.string()
    .nullable()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .trim(),

  // Email (opcional)
  email: Yup.string()
    .nullable()
    .email('Debe ingresar un email válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .trim(),
});

// ==========================================
// VALORES INICIALES
// ==========================================

export const getInitialValues = (itemEdit: any = null) => {
  if (itemEdit) {
    // Modo edición
    return {
      tipo_cliente: itemEdit.tipo_cliente || 'persona',
      ci: itemEdit.ci || '',
      nombre_completo: itemEdit.nombre_completo || '',
      telefono: itemEdit.telefono || '',
      email: itemEdit.email || '',
    };
  }

  // Modo creación
  return {
    tipo_cliente: 'persona',
    ci: '',
    nombre_completo: '',
    telefono: '',
    email: '',
  };
};