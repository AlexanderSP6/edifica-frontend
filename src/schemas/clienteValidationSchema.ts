import * as Yup from 'yup';

// ==========================================
// SCHEMA DE VALIDACIÓN - CLIENTE
// ==========================================

export const clienteValidationSchema = Yup.object().shape({
  // Tipo de Cliente
  tipo_cliente: Yup.string()
    .required('El tipo de cliente es obligatorio')
    .oneOf(['persona', 'empresa'], 'El tipo de cliente debe ser persona o empresa'),

  // CI / NIT según tipo de cliente
  ci: Yup.string()
    .required('Este campo es obligatorio')
    .max(20, 'No puede exceder 20 caracteres')
    .trim()
    .test('ci-nit-format', function(value) {
      const { tipo_cliente } = this.parent;
      
      if (!value) return true; 
      
      // Validación para Persona Natural (CI)
      if (tipo_cliente === 'persona') {
        // CI debe tener entre 5-10 dígitos seguidos opcionalmente por un espacio y 1-5 caracteres alfanuméricos
        // Ejemplos válidos: 1234567 LP, 1234567890A
        const ciRegex = /^[0-9]{5,10}(\s?[A-Z0-9-]{1,5})?$/i;
        
        if (!ciRegex.test(value.trim())) {
          return this.createError({
            message: 'CI inválido. Formato: 1234567 LP',
          });
        }
      }
      
      // Validación para Empresa (NIT)
      if (tipo_cliente === 'empresa') {
        // NIT debe ser solo números (puede tener guiones)
        // Ejemplos válidos: 1234567890, 123456789-0
        const nitRegex = /^[0-9]{7,12}(-?[0-9])?$/;
        
        if (!nitRegex.test(value.trim())) {
          return this.createError({
            message: 'NIT inválido. Debe contener entre 7-12 dígitos',
          });
        }
      }
      
      return true;
    }),

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