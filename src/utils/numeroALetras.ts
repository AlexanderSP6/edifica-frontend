/**
 * Convierte números a letras en formato boliviano
 */

const UNIDADES = [
  '', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'
];

const DECENAS = [
  '', '', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 
  'Sesenta', 'Setenta', 'Ochenta', 'Noventa'
];

const ESPECIALES = [
  'Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince',
  'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'
];

const CENTENAS = [
  '', 'Ciento', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos',
  'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'
];

/**
 * Convierte un número de 0-99 a letras
 */
const convertirDecenas = (num: number): string => {
  if (num === 0) return '';
  if (num < 10) return UNIDADES[num];
  if (num >= 10 && num < 20) return ESPECIALES[num - 10];
  
  const decena = Math.floor(num / 10);
  const unidad = num % 10;
  
  if (num >= 20 && num < 30) {
    return unidad === 0 ? 'Veinte' : `Veinti${UNIDADES[unidad].toLowerCase()}`;
  }
  
  return unidad === 0 
    ? DECENAS[decena]
    : `${DECENAS[decena]} y ${UNIDADES[unidad]}`;
};

/**
 * Convierte un número de 0-999 a letras
 */
const convertirCentenas = (num: number): string => {
  if (num === 0) return '';
  if (num === 100) return 'Cien';
  
  const centena = Math.floor(num / 100);
  const resto = num % 100;
  
  if (centena === 0) return convertirDecenas(resto);
  if (resto === 0) return CENTENAS[centena];
  
  return `${CENTENAS[centena]} ${convertirDecenas(resto)}`;
};

/**
 * Convierte un número de 0-999999 a letras
 */
const convertirMiles = (num: number): string => {
  if (num === 0) return '';
  
  const miles = Math.floor(num / 1000);
  const resto = num % 1000;
  
  let resultado = '';
  
  if (miles > 0) {
    if (miles === 1) {
      resultado = 'Mil';
    } else {
      resultado = `${convertirCentenas(miles)} Mil`;
    }
  }
  
  if (resto > 0) {
    resultado += resultado ? ` ${convertirCentenas(resto)}` : convertirCentenas(resto);
  }
  
  return resultado;
};

/**
 * Convierte un número de 0-999999999 a letras
 */
const convertirMillones = (num: number): string => {
  if (num === 0) return 'Cero';
  
  const millones = Math.floor(num / 1000000);
  const resto = num % 1000000;
  
  let resultado = '';
  
  if (millones > 0) {
    if (millones === 1) {
      resultado = 'Un Millón';
    } else {
      resultado = `${convertirMiles(millones)} Millones`;
    }
  }
  
  if (resto > 0) {
    resultado += resultado ? ` ${convertirMiles(resto)}` : convertirMiles(resto);
  }
  
  return resultado || 'Cero';
};

/**
 * Convierte un número decimal a formato boliviano
 */
export const numeroALetrasBoliviano = (numero: number): string => {
  // Separar parte entera y decimal
  const parteEntera = Math.floor(Math.abs(numero));
  const parteDecimal = Math.round((Math.abs(numero) - parteEntera) * 100);
  
  // Convertir parte entera a letras
  const letras = convertirMillones(parteEntera);
  
  // Formatear decimales siempre con 2 dígitos
  const decimales = parteDecimal.toString().padStart(2, '0');
  
  // Retornar en formato boliviano
  return `${letras} ${decimales}/100`;
};

/**
 * Convierte el total del presupuesto a letras (para el pie de página)
 */
export const totalPresupuestoALetras = (numero: number): string => {
  const parteEntera = Math.floor(Math.abs(numero));
  const parteDecimal = Math.round((Math.abs(numero) - parteEntera) * 100);
  
  const letras = convertirMillones(parteEntera);
  const decimales = parteDecimal.toString().padStart(2, '0');
  
  return `${letras} con ${decimales}/100 Bolivianos`;
};

/**
 * Determina el módulo basado en las categorías de los ítems
 */
export const determinarModuloFrontend = (items: any[]): string => {
  if (!items || items.length === 0) return 'SIN ÍTEMS';
  
  const categorias = new Set(
    items
      .map(item => item.categoria_nombre || item.apu_item?.categoria?.nombre)
      .filter(Boolean)
  );

  if (categorias.size === 1) {
    return Array.from(categorias)[0].toUpperCase();
  }

  if (categorias.size <= 3) {
    return Array.from(categorias).slice(0, 3).join(' - ').toUpperCase();
  }

  return 'VARIOS';
};