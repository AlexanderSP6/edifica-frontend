import jsPDF from 'jspdf';
import { PDF_CONFIG, checkPageSpace } from '../../utils/pdfFormularioB2';
import { ItemDetalladoB2 } from '../../types/presupuesto.types';

/**
 * Genera las secciones 4, 5 y 6 del Formulario B-2
 * (Gastos Generales, Utilidad, Impuestos)
 */
export const generarSeccionesFinales = (
  doc: jsPDF,
  item: ItemDetalladoB2,
  yPos: number
): number => {
  const seccionGG = item.formulario_b2.seccion_4_gastos_generales;
  const seccionUtilidad = item.formulario_b2.seccion_5_utilidad;
  const seccionIT = item.formulario_b2.seccion_6_impuestos;

  yPos = checkPageSpace(doc, yPos, 40);

  const valorX = PDF_CONFIG.pageWidth - PDF_CONFIG.margins.right;
  doc.setFontSize(PDF_CONFIG.fontSize.sectionTitle);

  // ==========================================
  // SECCIÓN 4: GASTOS GENERALES
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.text('4.- GASTOS GENERALES Y ADMINISTRATIVOS', PDF_CONFIG.margins.left, yPos);
  yPos += 4;

  doc.setFont('helvetica', 'normal');
  doc.text(seccionGG.descripcion, PDF_CONFIG.margins.left, yPos);
  doc.text(seccionGG.monto.toFixed(4), valorX, yPos, { align: 'right' });
  yPos += 4;

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL GASTOS GENERALES Y ADMINISTRATIVOS:', valorX - 65, yPos);
  doc.text(seccionGG.monto.toFixed(4), valorX, yPos, { align: 'right' });
  yPos += 6;

  // ==========================================
  // SECCIÓN 5: UTILIDAD
  // ==========================================
  doc.text('5.- UTILIDAD', PDF_CONFIG.margins.left, yPos);
  yPos += 4;

  doc.setFont('helvetica', 'normal');
  doc.text(seccionUtilidad.descripcion, PDF_CONFIG.margins.left, yPos);
  doc.text(seccionUtilidad.monto.toFixed(4), valorX, yPos, { align: 'right' });
  yPos += 4;

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL UTILIDAD:', valorX - 30, yPos);
  doc.text(seccionUtilidad.monto.toFixed(4), valorX, yPos, { align: 'right' });
  yPos += 6;

  // ==========================================
  // SECCIÓN 6: IMPUESTOS
  // ==========================================
  doc.text('6.- IMPUESTOS', PDF_CONFIG.margins.left, yPos);
  yPos += 4;

  doc.setFont('helvetica', 'normal');
  doc.text(seccionIT.descripcion, PDF_CONFIG.margins.left, yPos);
  doc.text(seccionIT.monto.toFixed(4), valorX, yPos, { align: 'right' });
  yPos += 4;

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL IMPUESTOS:', valorX - 30, yPos);
  doc.text(seccionIT.monto.toFixed(4), valorX, yPos, { align: 'right' });

  return yPos + 5;
};

/**
 * Genera los totales finales y cálculo del presupuesto
 */
export const generarTotalesFinales = (
  doc: jsPDF, 
  item: ItemDetalladoB2, 
  yPos: number
): number => {
  yPos = checkPageSpace(doc, yPos, 30);

  const valorX = PDF_CONFIG.pageWidth - PDF_CONFIG.margins.right;

  doc.setFontSize(PDF_CONFIG.fontSize.sectionTitle);
  doc.setFont('helvetica', 'bold');

  // Línea separadora
  doc.setLineWidth(0.1);
  doc.setDrawColor(0, 0, 0);
  doc.line(
    PDF_CONFIG.margins.left, 
    yPos, 
    PDF_CONFIG.pageWidth - PDF_CONFIG.margins.right, 
    yPos
  );
  yPos += 4;

  // Total Precio Unitario
  doc.text('TOTAL PRECIO UNITARIO (1+2+3+4+5+6):', valorX - 60, yPos);
  doc.text(
    item.formulario_b2.total_precio_unitario.toFixed(4),
    valorX,
    yPos,
    { align: 'right' }
  );
  yPos += 5;

  // Precio Unitario Adoptado
  doc.text('PRECIO UNITARIO ADOPTADO:', valorX - 50, yPos);
  doc.text(
    item.formulario_b2.precio_unitario_adoptado.toFixed(2),
    valorX,
    yPos,
    { align: 'right' }
  );
  yPos += 8;

  // ==========================================
  // CÁLCULO DEL PRESUPUESTO TOTAL
  // ==========================================
  const aplicacion = item.formulario_b2.aplicacion_presupuesto;

  doc.setFontSize(PDF_CONFIG.fontSize.subtitle);
  doc.text('CALCULO DEL PRESUPUESTO TOTAL:', PDF_CONFIG.margins.left, yPos);
  yPos += 6;

  doc.setFontSize(PDF_CONFIG.fontSize.sectionTitle);
  doc.setFont('helvetica', 'normal');

  const operacion = `${aplicacion.cantidad.toFixed(2)} ${item.unidad}  ×  ${aplicacion.precio_unitario_adoptado.toFixed(2)} Bs/${item.unidad}  =  ${aplicacion.total_presupuesto.toFixed(2)} Bs`;

  doc.text(operacion, PDF_CONFIG.margins.left + 5, yPos);
  yPos += 5;

  // Línea separadora final
  doc.setLineWidth(0.1);
  doc.line(
    PDF_CONFIG.margins.left, 
    yPos, 
    PDF_CONFIG.pageWidth - PDF_CONFIG.margins.right, 
    yPos
  );

  return yPos + 10;
};