import jsPDF from 'jspdf';

// ==========================================
// EXTENDER jsPDF CON autoTable
// ==========================================

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// ==========================================
// CONFIGURACIÓN GLOBAL DEL FORMULARIO B-2
// ==========================================

export const PDF_CONFIG = {
  // Márgenes del documento (en mm)
  margins: {
    top: 10,
    left: 10,
    right: 10,
    bottom: 25, 
  },
  
  // Tamaños de fuente estandarizados
  fontSize: {
    title: 12,        
    subtitle: 10,     
    sectionTitle: 9,  
    normal: 8,        
    small: 7,         
  },
  
  // Paleta de colores
  colors: {
    headerBg: [220, 220, 220] as [number, number, number], 
    text: [0, 0, 0] as [number, number, number],          
    border: [0, 0, 0] as [number, number, number],         
  },
  
  // Dimensiones de página A4
  pageWidth: 210,
  pageHeight: 297,
  
  // Anchos de columnas estandarizados (en mm)
  columnWidths: {
    descripcion: 90,
    unidad: 20,
    cantidad: 25,
    precioProductivo: 35,
    costoTotal: 25,
  },
};

// ==========================================
// UTILIDADES DE FORMATO
// ==========================================

/**
 * Formatea números a 4 decimales 
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.0000';
  }
  return amount.toFixed(4);
};

/**
 * Formatea números con decimales personalizados
 */
export const formatDecimal = (value: number | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return (0).toFixed(decimals);
  }
  return value.toFixed(decimals);
};

// ==========================================
// GESTIÓN DE ESPACIO EN PÁGINA
// ==========================================

/**
 * Verifica si hay suficiente espacio en la página actual
 */
export const checkPageSpace = (doc: jsPDF, currentY: number, requiredSpace: number): number => {
  if (currentY + requiredSpace > PDF_CONFIG.pageHeight - PDF_CONFIG.margins.bottom) {
    doc.addPage();
    return PDF_CONFIG.margins.top;
  }
  return currentY;
};

// ==========================================
// PIE DE PÁGINA
// ==========================================

/**
 * Agrega pie de página con nota legal, firma y numeración
 * @param doc - Documento jsPDF
 * @param pageNumber - Número de página actual
 * @param totalPages - Total de páginas
 */
export const agregarPieDePagina = (
  doc: jsPDF, 
  pageNumber: number, 
  totalPages: number
): void => {
  const { pageHeight, margins, fontSize } = PDF_CONFIG;
  const pageWidth = PDF_CONFIG.pageWidth;

  // Línea separadora superior
  doc.setLineWidth(0.1);
  doc.setDrawColor(0, 0, 0);
  doc.line(margins.left, pageHeight - 20, pageWidth - margins.right, pageHeight - 20);

  // Nota legal (texto en cursiva)
  doc.setFontSize(fontSize.small);
  doc.setFont('helvetica', 'italic');
  
  const notaLegal1 = 'Nota: El Proponente declara que el presente Formulario ha sido llenado de acuerdo con las especificaciones técnicas, aplicando las';
  const notaLegal2 = 'leyes sociales y tributarias vigentes, y es consistente con el Formulario B-1.';
  
  doc.text(notaLegal1, margins.left, pageHeight - 15);
  doc.text(notaLegal2, margins.left, pageHeight - 12);

  // Línea de firma
  doc.setFont('helvetica', 'normal');
  doc.line(margins.left, pageHeight - 5, margins.left + 60, pageHeight - 5);
  doc.text('Firma del representante legal del proponente', margins.left, pageHeight - 2);

  // Numeración de página (derecha)
  doc.text(
    `Pag. ${pageNumber} de ${totalPages}`,
    pageWidth - margins.right,
    pageHeight - 2,
    { align: 'right' }
  );
};

// ==========================================
// ESTILOS PREDEFINIDOS PARA autoTable
// ==========================================

/**
 * Configuración de estilos para tablas de materiales/MO/equipos
 */
export const TABLA_ENCABEZADO_STYLES = {
  fillColor: PDF_CONFIG.colors.headerBg,
  textColor: PDF_CONFIG.colors.text,
  fontStyle: 'bold' as const,
  halign: 'center' as const,
  fontSize: PDF_CONFIG.fontSize.sectionTitle,
  cellPadding: 2,
  lineColor: PDF_CONFIG.colors.border,
  lineWidth: 0.1,
};

export const TABLA_BODY_STYLES = {
  fontSize: PDF_CONFIG.fontSize.normal,
  cellPadding: 1.5,
  textColor: PDF_CONFIG.colors.text,
  lineColor: PDF_CONFIG.colors.border,
  lineWidth: 0.1,
};

export const TABLA_COLUMN_STYLES = {
  0: { 
    cellWidth: PDF_CONFIG.columnWidths.descripcion 
  },
  1: { 
    cellWidth: PDF_CONFIG.columnWidths.unidad, 
    halign: 'center' as const 
  },
  2: { 
    cellWidth: PDF_CONFIG.columnWidths.cantidad, 
    halign: 'right' as const 
  },
  3: { 
    cellWidth: PDF_CONFIG.columnWidths.precioProductivo, 
    halign: 'right' as const 
  },
  4: { 
    cellWidth: PDF_CONFIG.columnWidths.costoTotal, 
    halign: 'right' as const 
  },
};

// ==========================================
// UTILIDADES PARA TEXTO
// ==========================================

/**
 * Escribe texto con alineación derecha para totales y subtotales
 */
export const escribirTotal = (
  doc: jsPDF,
  label: string,
  valor: number,
  yPos: number,
  bold: boolean = true
): void => {
  const { pageWidth, margins, fontSize } = PDF_CONFIG;
  
  doc.setFontSize(fontSize.sectionTitle);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  
  doc.text(label, pageWidth - margins.right - 50, yPos);
  doc.text(
    formatCurrency(valor),
    pageWidth - margins.right,
    yPos,
    { align: 'right' }
  );
};