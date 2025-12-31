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
 * Genera la sección 3.- EQUIPO, MAQUINARIA Y HERRAMIENTAS del Formulario B-2
 */
export const generarSeccionEquipo = (
  doc: jsPDF,
  item: ItemDetalladoB2,
  yPos: number
): number => {
  yPos = checkPageSpace(doc, yPos, 30);

  const equipos = item.formulario_b2.seccion_3_equipo.items_equipo;

  // ==========================================
  // TABLA DE EQUIPOS
  // ==========================================
  const tableData = equipos.length > 0
    ? equipos.map((eq: ItemComposicion) => [
        `${eq.numero} ${eq.descripcion}`,
        eq.unidad,
        eq.cantidad.toFixed(4),
        eq.precio_productivo.toFixed(4),
        eq.costo_unitario.toFixed(4),
      ])
    : [];

  autoTable(doc, {
    startY: yPos,
    head: [['3.- EQUIPO, MAQUINARIA Y HERRAMIENTAS', 'Unid.', 'Cantidad', 'Precio Productivo', 'Costo Total']],
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

  const seccionEquipo = item.formulario_b2.seccion_3_equipo;
  const valorX = PDF_CONFIG.pageWidth - PDF_CONFIG.margins.right;

  // ==========================================
  // HERRAMIENTAS Y TOTAL (sin borde)
  // ==========================================
  doc.setFontSize(PDF_CONFIG.fontSize.sectionTitle);
  doc.setFont('helvetica', 'normal');
  
  doc.text(seccionEquipo.herramientas.descripcion, PDF_CONFIG.margins.left, yPos);
  doc.text(seccionEquipo.herramientas.monto.toFixed(4), valorX, yPos, { align: 'right' });
  yPos += 4;

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL EQUIPO, MAQUINARIA Y HERRAMIENTAS:', valorX - 60, yPos);
  doc.text(seccionEquipo.total.toFixed(4), valorX, yPos, { align: 'right' });

  return yPos + 5;
};