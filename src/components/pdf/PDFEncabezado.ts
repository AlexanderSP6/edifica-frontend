import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_CONFIG } from '../../utils/pdfFormularioB2';
import { DatosReportePDF, ItemDetalladoB2 } from '../../types/presupuesto.types';

/**
 * Genera el encabezado del Formulario B-2
 * Incluye: título, subtítulo y tabla de datos generales
 */
export const generarEncabezado = (
  doc: jsPDF,
  datos: DatosReportePDF,
  item: ItemDetalladoB2,
  pageNumber: number
): number => {
  let yPos = PDF_CONFIG.margins.top;

  // ==========================================
  // TÍTULO PRINCIPAL
  // ==========================================
  doc.setFontSize(PDF_CONFIG.fontSize.title);
  doc.setFont('helvetica', 'bold');
  doc.text('FORMULARIO B-2', PDF_CONFIG.pageWidth / 2, yPos, { align: 'center' });

  yPos += 5;

  // ==========================================
  // SUBTÍTULO
  // ==========================================
  doc.setFontSize(PDF_CONFIG.fontSize.subtitle);
  doc.text('ANALISIS DE PRECIOS UNITARIOS', PDF_CONFIG.pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;

  // ==========================================
  // TABLA DE DATOS GENERALES
  // ==========================================
  const datosGeneralesData = [
    ['DATOS GENERALES', 'Proyecto:', datos.datos_generales.nombre_proyecto],
    ['', 'Actividad:', item.descripcion],
    ['', 'Cantidad:', item.cantidad_presupuesto.toFixed(2)],
    ['', 'Unidad:', item.unidad],
    ['', 'Moneda:', 'Bs'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: datosGeneralesData,
    theme: 'grid',
    styles: {
      fontSize: PDF_CONFIG.fontSize.sectionTitle,
      cellPadding: 1.5,
      textColor: PDF_CONFIG.colors.text,
      lineColor: PDF_CONFIG.colors.border,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: {
        cellWidth: 35,
        fontStyle: 'bold',
        fillColor: [240, 240, 240],
      },
      1: {
        cellWidth: 25,
        fontStyle: 'bold',
      },
      2: {
        cellWidth: 135,
      },
    },
    margin: { 
      left: PDF_CONFIG.margins.left, 
      right: PDF_CONFIG.margins.right 
    },
    didDrawCell: (data) => {
      // Merge de la primera celda "DATOS GENERALES" verticalmente
      if (data.column.index === 0 && data.row.index > 0) {
        data.cell.text = [];
      }
    },
  });

  return (doc as any).lastAutoTable.finalY + 5;
};