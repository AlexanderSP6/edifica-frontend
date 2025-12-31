import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_B1_CONFIG, agregarPieB1,formatearMonedaBoliviana } from '../../utils/pdfFormularioB1';
import { numeroALetrasBoliviano, totalPresupuestoALetras } from '../../utils/numeroALetras';
import { DatosReporteB1 } from '../../types/presupuesto.types';

/**
 * Genera el PDF completo del Formulario B-1
 * Con formato idéntico al modelo boliviano
 */
export const generarPDFFormularioB1 = (datos: DatosReporteB1): jsPDF => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const { margins, fontSize, columnWidths, colors } = PDF_B1_CONFIG;
  let yPos = margins.top;

  // ==========================================
  // TÍTULO PRINCIPAL (café oscuro, centrado)
  // ==========================================
  doc.setFontSize(fontSize.title);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.titleBrown[0], colors.titleBrown[1], colors.titleBrown[2]);
  doc.text('FORMULARIO B-1', PDF_B1_CONFIG.pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;

  // ==========================================
  // ENCABEZADO EN DOS COLUMNAS
  // ==========================================
  const colIzqX = margins.left;
  const colDerX = PDF_B1_CONFIG.pageWidth / 2 + 20;

  // COLUMNA IZQUIERDA (café claro)
  doc.setFontSize(fontSize.subtitle);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.subtitleBrown[0], colors.subtitleBrown[1], colors.subtitleBrown[2]);
  
  doc.text('PRESUPUESTO POR ÍTEMES Y GENERAL DE LA OBRA', colIzqX, yPos);
  yPos += 4;
  doc.text('(en Bolivianos)', colIzqX, yPos);

  // COLUMNA DERECHA (café claro, alineada a la derecha)
  let yPosDer = yPos - 4; // Volver a la altura del título
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Proyecto: ${datos.datos_generales.nombre_proyecto}`, colDerX, yPosDer);
  yPosDer += 4;
  doc.text(`Módulo: ${datos.datos_generales.modulo}`, colDerX, yPosDer);
  yPosDer += 4;
  doc.text(`Cliente: ${datos.datos_generales.cliente}`, colDerX, yPosDer);

  yPos += 6;

  // ==========================================
  // TABLA DE ÍTEMS
  // ==========================================
  
  const tableHead = [[
    'Item',
    'Descripción',
    'Unidad',
    'Cantidad',
    'Prec.Unit.',
    'Literal',
    'Prec. Total'
  ]];

  const tableBody = datos.items.map(item => [
    item.numero.toString(),
    item.descripcion,
    item.unidad,
    item.cantidad.toFixed(4),
    formatearMonedaBoliviana(item.precio_unitario),  
    numeroALetrasBoliviano(item.precio_unitario),
    formatearMonedaBoliviana(item.precio_total)
  ]);

  autoTable(doc, {
    startY: yPos,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: fontSize.normal,
      cellPadding: 1,
      lineColor: colors.tableBorder,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: colors.headerBg, 
      textColor: colors.text,
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.3,
    },
    columnStyles: {
      //   Item (AZUL)
      0: { 
        cellWidth: columnWidths.item, 
        halign: 'center',
        textColor: colors.blue,
      },
      //  Descripción (AZUL)
      1: { 
        cellWidth: columnWidths.descripcion, 
        halign: 'left',
        textColor: colors.blue,
      },
      // Unidad (NEGRO)
      2: { 
        cellWidth: columnWidths.unidad, 
        halign: 'center',
        textColor: colors.text,
      },
      // Cantidad (NEGRO)
      3: { 
        cellWidth: columnWidths.cantidad, 
        halign: 'right',
        textColor: colors.text,
      },
      // Prec.Unit. (NEGRO)
      4: { 
        cellWidth: columnWidths.precioUnit, 
        halign: 'right',
        textColor: colors.text,
      },
      // Literal (AZUL)
      5: { 
        cellWidth: columnWidths.literal, 
        halign: 'left',
        textColor: colors.blue,
      },
      // Prec. Total (NEGRO)
      6: { 
        cellWidth: columnWidths.precioTotal, 
        halign: 'right',
        textColor: colors.text,
      },
    },
    margin: { 
      left: margins.left, 
      right: margins.right 
    },
  });

  yPos = (doc as any).lastAutoTable.finalY;

  // ==========================================
  // TOTALES
  // ==========================================
  
  // Total presupuesto
  autoTable(doc, {
    startY: yPos,
    body: [
      [
        '',
        '',
        '',
        '',
        '',
        'Total presupuesto:',
        formatearMonedaBoliviana(datos.total_presupuesto)
      ]
    ],
    theme: 'grid',
    styles: {
      fontSize: fontSize.normal,
      cellPadding: 1,
      textColor: colors.text,
      lineColor: colors.tableBorder,
      lineWidth: 0.2,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: columnWidths.item },
      1: { cellWidth: columnWidths.descripcion },
      2: { cellWidth: columnWidths.unidad },
      3: { cellWidth: columnWidths.cantidad },
      4: { cellWidth: columnWidths.precioUnit },
      5: { cellWidth: columnWidths.literal, halign: 'right' },
      6: { cellWidth: columnWidths.precioTotal, halign: 'right' },
    },
    margin: { 
      left: margins.left, 
      right: margins.right 
    },
  });

  yPos = (doc as any).lastAutoTable.finalY;

  // Son (en letras)
  autoTable(doc, {
    startY: yPos,
    body: [
      [`Son: ${totalPresupuestoALetras(datos.total_presupuesto)}`]
    ],
    theme: 'grid',
    styles: {
      fontSize: fontSize.normal,
      cellPadding: 1,
      textColor: colors.text,
      lineColor: colors.tableBorder,
      lineWidth: 0.2,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { 
        cellWidth: columnWidths.item + 
                   columnWidths.descripcion + 
                   columnWidths.unidad + 
                   columnWidths.cantidad + 
                   columnWidths.precioUnit + 
                   columnWidths.literal + 
                   columnWidths.precioTotal 
      },
    },
    margin: { 
      left: margins.left, 
      right: margins.right 
    },
  });

  // ==========================================
  // PIE DE PÁGINA EN TODAS LAS PÁGINAS
  // ==========================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    agregarPieB1(doc, i, totalPages);
  }

  return doc;
};