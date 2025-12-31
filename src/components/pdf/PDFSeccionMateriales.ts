import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  PDF_CONFIG, 
  TABLA_ENCABEZADO_STYLES, 
  TABLA_BODY_STYLES,
  checkPageSpace 
} from '../../utils/pdfFormularioB2';
import { ItemDetalladoB2, ItemComposicion } from '../../types/presupuesto.types';

/**
 * Genera la sección 1.- MATERIALES del Formulario B-2
 */
export const generarSeccionMateriales = (
  doc: jsPDF,
  item: ItemDetalladoB2,
  yPos: number
): number => {
  yPos = checkPageSpace(doc, yPos, 30);

  const materiales = item.formulario_b2.seccion_1_materiales.items;

  // ==========================================
  // TABLA DE MATERIALES
  // ==========================================
  const tableData = materiales.length > 0
    ? materiales.map((mat: ItemComposicion) => [
        `${mat.numero} ${mat.descripcion}`,
        mat.unidad,
        mat.cantidad.toFixed(4),
        mat.precio_productivo.toFixed(4),
        mat.costo_unitario.toFixed(4),
      ])
    : []; // Tabla vacía si no hay materiales

  autoTable(doc, {
    startY: yPos,
    head: [['1.- MATERIALES', 'Unid.', 'Cantidad', 'Precio Productivo', 'Costo Total']],
    body: tableData,
    theme: 'grid',
    styles: TABLA_BODY_STYLES,
    headStyles: TABLA_ENCABEZADO_STYLES,
    columnStyles: {
      0: { cellWidth: PDF_CONFIG.columnWidths.descripcion },
      1: { cellWidth: PDF_CONFIG.columnWidths.unidad, halign: 'center' },
      2: { cellWidth: PDF_CONFIG.columnWidths.cantidad, halign: 'right' },
      3: { cellWidth: PDF_CONFIG.columnWidths.precioProductivo, halign: 'right' },
      4: { cellWidth: PDF_CONFIG.columnWidths.costoTotal, halign: 'right' },
    },
    margin: { 
      left: PDF_CONFIG.margins.left, 
      right: PDF_CONFIG.margins.right 
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 2;

  // ==========================================
  // TOTAL MATERIALES (sin borde)
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(PDF_CONFIG.fontSize.sectionTitle);
  
  const labelX = PDF_CONFIG.pageWidth - PDF_CONFIG.margins.right - 30;
  const valorX = PDF_CONFIG.pageWidth - PDF_CONFIG.margins.right;
  
  doc.text('TOTAL MATERIALES:', labelX, yPos);
  doc.text(
    item.formulario_b2.seccion_1_materiales.total.toFixed(4),
    valorX,
    yPos,
    { align: 'right' }
  );

  return yPos + 5;
};