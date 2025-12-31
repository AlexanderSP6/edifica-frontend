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
 * Genera la sección 2.- MANO DE OBRA del Formulario B-2
 */
export const generarSeccionManoObra = (
  doc: jsPDF,
  item: ItemDetalladoB2,
  yPos: number
): number => {
  yPos = checkPageSpace(doc, yPos, 30);

  const manoObra = item.formulario_b2.seccion_2_mano_obra.items;

  // ==========================================
  // TABLA DE MANO DE OBRA
  // ==========================================
  const tableData = manoObra.length > 0
    ? manoObra.map((mo: ItemComposicion) => [
        `${mo.numero} ${mo.descripcion}`,
        mo.unidad,
        mo.cantidad.toFixed(4),
        mo.precio_productivo.toFixed(4),
        mo.costo_unitario.toFixed(4),
      ])
    : [];

  autoTable(doc, {
    startY: yPos,
    head: [['2.- MANO DE OBRA', 'Unid.', 'Cantidad', 'Precio Productivo', 'Costo Total']],
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

  const seccionMO = item.formulario_b2.seccion_2_mano_obra;
  const valorX = PDF_CONFIG.pageWidth - PDF_CONFIG.margins.right;

  // ==========================================
  // SUBTOTALES Y TOTALES 
  // ==========================================
  doc.setFontSize(PDF_CONFIG.fontSize.sectionTitle);

  // Subtotal Mano de Obra
  doc.setFont('helvetica', 'bold');
  doc.text('SUBTOTAL MANO DE OBRA:', valorX - 30, yPos);
  doc.text(seccionMO.subtotal.toFixed(4), valorX, yPos, { align: 'right' });
  yPos += 4;

  // Cargas Sociales
  doc.setFont('helvetica', 'normal');
  doc.text(seccionMO.cargas_sociales.descripcion, PDF_CONFIG.margins.left, yPos);
  doc.text(seccionMO.cargas_sociales.monto.toFixed(4), valorX, yPos, { align: 'right' });
  yPos += 4;

  // IVA
  doc.text(seccionMO.iva.descripcion, PDF_CONFIG.margins.left, yPos);
  doc.text(seccionMO.iva.monto.toFixed(4), valorX, yPos, { align: 'right' });
  yPos += 4;

  // Total Mano de Obra
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL MANO DE OBRA:', valorX - 30, yPos);
  doc.text(seccionMO.total.toFixed(4), valorX, yPos, { align: 'right' });

  return yPos + 5;
};