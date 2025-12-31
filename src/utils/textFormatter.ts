
/**
 * Convierte texto a Title Case (Primer Letra Mayúscula)
 */
export const toTitleCase = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
};

/**
 * Convierte a minúsculas
 */
export const toLowerCase = (text: string): string => {
  return text ? text.toLowerCase().trim() : '';
};

/**
 * Limpia y formatea número de teléfono
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remover todo excepto números y +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Asegurar que + solo esté al inicio
  if (cleaned.includes('+')) {
    const hasLeadingPlus = cleaned.startsWith('+');
    cleaned = cleaned.replace(/\+/g, '');
    if (hasLeadingPlus) {
      cleaned = '+' + cleaned;
    }
  }
  
  return cleaned;
};

/**
 * CI (Cédula de Identidad)
 * Mantiene solo números,
 */
export const formatCI = (ci: string): string => {
  if (!ci) return '';
  
  // Remover todo excepto números
  const cleaned = ci.replace(/\D/g, '');
  
  // Limitar a 10 dígitos máximo
  return cleaned;
};

/**
 * Sanitizacion de texto 
 */
export const sanitize = (text: string): string => {
  if (!text) return '';
  
  let clean = text;
  
  // Remover tags HTML
  clean = clean.replace(/<[^>]*>/g, '');
  
  // Remover caracteres de control
  clean = clean.replace(/[\u0000-\u001F\u007F]/g, '');
  
  // Remover caracteres de ancho cero
  clean = clean.replace(/[\u200B-\u200D\uFEFF\u180E\u2060]/g, '');
  
  // Normalizar a NFC
  if (typeof clean.normalize === 'function') {
    clean = clean.normalize('NFC');
  }
  
  // Normalizar espacios múltiples
  clean = clean.replace(/\s+/g, ' ');
  
  return clean.trim();
};

/**
 * Función combinada: sanitiza Y formatea
 */
export const sanitizeAndTitleCase = (text: string): string => {
  return toTitleCase(sanitize(text));
};

/**
 * Función combinada: sanitiza Y convierte a minúsculas
 */
export const sanitizeAndLowerCase = (text: string): string => {
  return toLowerCase(sanitize(text));
};

/**
 * Formatea los campos opcionales (los campos puede ser null)
 */
export const formatOptional = (text: string | null | undefined, formatter: (s: string) => string): string | null => {
  if (!text) return null;
  
  const formatted = formatter(text);
  return formatted.length > 0 ? formatted : null;
};