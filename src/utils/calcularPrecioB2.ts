/**
 * Utilidades para calcular precios usando porcentajes del Formulario B-2
 */

interface PrecioAPU {
  precio_material: number;
  precio_mano_obra: number;
  precio_equipo: number;
  precio_total: number;
}

interface PorcentajesB2 {
  porcentaje_cargas_sociales: number;
  porcentaje_iva_mano_obra: number;
  porcentaje_herramientas: number;
  porcentaje_gastos_generales: number;
  porcentaje_utilidad: number;
  porcentaje_impuestos_it: number;
}

/**
 * Calcula el precio unitario de un item aplicando el Formulario B-2
 */
export const calcularPrecioConB2 = (
  precioAPU: PrecioAPU,
  porcentajes: PorcentajesB2
): number => {
  // ==========================================
  // PRECIOS BASE (UNITARIOS, SIN B-2)
  // ==========================================
  const totalMateriales = precioAPU.precio_material;
  const totalManoObraBase = precioAPU.precio_mano_obra;
  const totalEquipoBase = precioAPU.precio_equipo;

  // ==========================================
  // SECCIÓN 2: MANO DE OBRA
  // ==========================================
  const subtotalManoObra = totalManoObraBase;
  
  // Cargas sociales 
  const montoCargas = subtotalManoObra * (porcentajes.porcentaje_cargas_sociales / 100);
  
  // IVA 
  const baseIva = subtotalManoObra + montoCargas;
  const montoIva = baseIva * (porcentajes.porcentaje_iva_mano_obra / 100);
  
  // Total mano de obra final
  const totalManoObraFinal = subtotalManoObra + montoCargas + montoIva;

  // ==========================================
  // SECCIÓN 3: EQUIPO Y HERRAMIENTAS
  // ==========================================
  // Herramientas 
  const montoHerramientas = totalManoObraFinal * (porcentajes.porcentaje_herramientas / 100);
  
  // Total equipo final
  const totalEquipoFinal = totalEquipoBase + montoHerramientas;

  // ==========================================
  // SECCIÓN 4: GASTOS GENERALES
  // ==========================================
  const baseGG = totalMateriales + totalManoObraFinal + totalEquipoFinal;
  const montoGastosGenerales = baseGG * (porcentajes.porcentaje_gastos_generales / 100);

  // ==========================================
  // SECCIÓN 5: UTILIDAD
  // ==========================================
  const baseUtilidad = baseGG + montoGastosGenerales;
  const montoUtilidad = baseUtilidad * (porcentajes.porcentaje_utilidad / 100);

  // ==========================================
  // SECCIÓN 6: IMPUESTOS IT
  // ==========================================
  const baseIT = baseUtilidad + montoUtilidad;
  const montoImpuestosIT = baseIT * (porcentajes.porcentaje_impuestos_it / 100);

  // ==========================================
  // PRECIO UNITARIO CON B-2
  // ==========================================
  const precioUnitarioConB2 =
    totalMateriales +
    totalManoObraFinal +
    totalEquipoFinal +
    montoGastosGenerales +
    montoUtilidad +
    montoImpuestosIT;

  return Math.round(precioUnitarioConB2 * 100) / 100;
};

/**
 * Obtiene los porcentajes B-2 con valores por defecto segun el formulario
 */
export const obtenerPorcentajesB2 = (formValues: any): PorcentajesB2 => {
  return {
    porcentaje_cargas_sociales: formValues.porcentaje_cargas_sociales || 55.0,
    porcentaje_iva_mano_obra: formValues.porcentaje_iva_mano_obra || 14.94,
    porcentaje_herramientas: formValues.porcentaje_herramientas || 5.0,
    porcentaje_gastos_generales: formValues.porcentaje_gastos_generales || 10.0,
    porcentaje_utilidad: formValues.porcentaje_utilidad || 10.0,
    porcentaje_impuestos_it: formValues.porcentaje_impuestos_it || 3.09,
  };
};

/**
 * Calcula el desglose completo del B-2 
 */
export const calcularDesgloseB2 = (
  precioAPU: PrecioAPU,
  porcentajes: PorcentajesB2
) => {
  const totalMateriales = precioAPU.precio_material;
  const totalManoObraBase = precioAPU.precio_mano_obra;
  const totalEquipoBase = precioAPU.precio_equipo;

  // Mano de obra
  const montoCargas = totalManoObraBase * (porcentajes.porcentaje_cargas_sociales / 100);
  const baseIva = totalManoObraBase + montoCargas;
  const montoIva = baseIva * (porcentajes.porcentaje_iva_mano_obra / 100);
  const totalManoObraFinal = totalManoObraBase + montoCargas + montoIva;

  // Equipo
  const montoHerramientas = totalManoObraFinal * (porcentajes.porcentaje_herramientas / 100);
  const totalEquipoFinal = totalEquipoBase + montoHerramientas;

  // Gastos generales
  const baseGG = totalMateriales + totalManoObraFinal + totalEquipoFinal;
  const montoGastosGenerales = baseGG * (porcentajes.porcentaje_gastos_generales / 100);

  // Utilidad
  const baseUtilidad = baseGG + montoGastosGenerales;
  const montoUtilidad = baseUtilidad * (porcentajes.porcentaje_utilidad / 100);

  // Impuestos IT
  const baseIT = baseUtilidad + montoUtilidad;
  const montoImpuestosIT = baseIT * (porcentajes.porcentaje_impuestos_it / 100);

  // Total
  const precioUnitarioConB2 =
    totalMateriales +
    totalManoObraFinal +
    totalEquipoFinal +
    montoGastosGenerales +
    montoUtilidad +
    montoImpuestosIT;

  return {
    materiales: totalMateriales,
    mano_obra: {
      subtotal: totalManoObraBase,
      cargas_sociales: montoCargas,
      iva: montoIva,
      total: totalManoObraFinal,
    },
    equipo: {
      subtotal: totalEquipoBase,
      herramientas: montoHerramientas,
      total: totalEquipoFinal,
    },
    gastos_generales: montoGastosGenerales,
    utilidad: montoUtilidad,
    impuestos_it: montoImpuestosIT,
    precio_total: Math.round(precioUnitarioConB2 * 100) / 100,
  };
};