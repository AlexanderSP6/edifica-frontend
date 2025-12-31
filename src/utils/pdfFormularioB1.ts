import jsPDF from 'jspdf';

// ==========================================
// CONFIGURACIÓN DEL FORMULARIO B-1
// ==========================================

export const PDF_B1_CONFIG = {
  margins: {
    top: 10,
    left: 10,
    right: 10,
    bottom: 25,
  },
  fontSize: {
    title: 11,
    subtitle: 9,
    normal: 8,
    small: 7,
  },
  colors: {
    titleBrown: [153, 51, 0] as [number, number, number],    
    subtitleBrown: [153, 102, 51] as [number, number, number], 
    blue: [0, 0, 255] as [number, number, number],             
    headerBg: [242, 220, 219] as [number, number, number],     
    tableBorder: [0, 0, 0] as [number, number, number],       
    text: [0, 0, 0] as [number, number, number],               
  },
  pageWidth: 297,   
  pageHeight: 210,  
  
  columnWidths: {
    item: 12,
    descripcion: 95,
    unidad: 15,
    cantidad: 20,
    precioUnit: 22,
    literal: 65,
    precioTotal: 22,
  },
};

/**
 * Formatea número a moneda boliviana
 */
export const formatearMonedaBoliviana = (numero: number): string => {
  // Separar parte entera y decimal
  const partes = numero.toFixed(2).split('.');
  const parteEntera = partes[0];
  const parteDecimal = partes[1];
  
  // Agregar separador de miles (punto)
  const enteraFormateada = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Retornar con formato boliviano
  return `Bs ${enteraFormateada},${parteDecimal}`;
};

/**
 * Agrega el pie de página con nota legal y numeración
 */
export const agregarPieB1 = (
  doc: jsPDF,
  pageNumber: number,
  totalPages: number
): void => {
  const { pageHeight, margins, fontSize } = PDF_B1_CONFIG;
  const pageWidth = PDF_B1_CONFIG.pageWidth;

  doc.setFontSize(fontSize.small);
  doc.setFont('helvetica', 'italic'); 

  const nota1 = 'NOTA. La empresa proponente declara de forma expresa que el presente Formulario contiene los mismos precios unitarios que los';
  const nota2 = 'señalados en el Formulario B-2. El Precio Total se calcula como: Cantidad × Precio Unitario.';
  
  doc.text(nota1, margins.left, pageHeight - 15);
  doc.text(nota2, margins.left, pageHeight - 12);

  // Firma
  doc.setFont('helvetica', 'normal');
  doc.setLineWidth(0.3);
  doc.line(margins.left, pageHeight - 5, margins.left + 60, pageHeight - 5);
  doc.text('Firma del representante legal del proponente', margins.left, pageHeight - 2);

  // Numeración de página
  doc.text(
    `Pag. ${pageNumber} de ${totalPages}`,
    pageWidth - margins.right - 20,
    pageHeight - 2
  );
};