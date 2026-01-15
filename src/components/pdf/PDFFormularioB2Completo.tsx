import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDF_CONFIG, agregarPieDePagina } from '../../utils/pdfFormularioB2';
import { DatosReportePDF, ItemDetalladoB2, ItemComposicion } from '../../types/presupuesto.types';

export const generarFormularioB2Completo = (
  doc: jsPDF,
  datos: DatosReportePDF,
  item: ItemDetalladoB2,
  pageNumber: number,
  totalPages: number
): void => {
  let yPos = PDF_CONFIG.margins.top;

  // ENCABEZADO
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FORMULARIO B-2', PDF_CONFIG.pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;

  doc.setFontSize(10);
  doc.text('ANALISIS DE PRECIOS UNITARIOS', PDF_CONFIG.pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  const tableBody: any[][] = [];

  // DATOS GENERALES
  tableBody.push([
    { content: 'DATOS GENERALES', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
    { content: 'Proyecto:', styles: { fontStyle: 'bold' } },
    { content: datos.datos_generales.nombre_proyecto, colSpan: 3 }
  ]);
  tableBody.push([
    '',
    { content: 'Actividad:', styles: { fontStyle: 'bold' } },
    { content: item.descripcion, colSpan: 3 }
  ]);
  tableBody.push([
    '',
    { content: 'Cantidad:', styles: { fontStyle: 'bold' } },
    { content: item.cantidad_presupuesto.toFixed(2), colSpan: 3 }
  ]);
  tableBody.push([
    '',
    { content: 'Unidad:', styles: { fontStyle: 'bold' } },
    { content: item.unidad, colSpan: 3 }
  ]);
  tableBody.push([
    '',
    { content: 'Moneda:', styles: { fontStyle: 'bold' } },
    { content: 'Bs', colSpan: 3 }
  ]);

  // SECCIÓN 1: MATERIALES
  tableBody.push([
    { content: '1.- MATERIALES', styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } },
    { content: 'Unid.', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } },
    { content: 'Cantidad', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } },
    { content: 'Precio Productivo', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } },
    { content: 'Costo Total', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } }
  ]);

  item.formulario_b2.seccion_1_materiales.items.forEach((mat: ItemComposicion) => {
    tableBody.push([
      `${mat.numero} ${mat.descripcion}`,
      { content: mat.unidad, styles: { halign: 'center' } },
      { content: mat.cantidad.toFixed(4), styles: { halign: 'right' } },
      { content: mat.precio_productivo.toFixed(4), styles: { halign: 'right' } },
      { content: mat.costo_unitario.toFixed(4), styles: { halign: 'right' } }
    ]);
  });

  //  TOTAL MATERIALES 
  tableBody.push([
    '',
    { content: 'TOTAL MATERIALES:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: item.formulario_b2.seccion_1_materiales.total.toFixed(4), styles: { fontStyle: 'bold', halign: 'right' } }
  ]);

  // SECCIÓN 2: MANO DE OBRA
  tableBody.push([
    { content: '2.- MANO DE OBRA', styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } },
    { content: 'Unid.', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } },
    { content: 'Cantidad', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } },
    { content: 'Precio Productivo', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } },
    { content: 'Costo Total', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } }
  ]);

  item.formulario_b2.seccion_2_mano_obra.items.forEach((mo: ItemComposicion) => {
    tableBody.push([
      `${mo.numero} ${mo.descripcion}`,
      { content: mo.unidad, styles: { halign: 'center' } },
      { content: mo.cantidad.toFixed(4), styles: { halign: 'right' } },
      { content: mo.precio_productivo.toFixed(4), styles: { halign: 'right' } },
      { content: mo.costo_unitario.toFixed(4), styles: { halign: 'right' } }
    ]);
  });

  const seccionMO = item.formulario_b2.seccion_2_mano_obra;

  // SUBTOTAL MANO DE OBRA 
  tableBody.push([
    '',
    { content: 'SUBTOTAL MANO DE OBRA:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: seccionMO.subtotal.toFixed(4), styles: { fontStyle: 'bold', halign: 'right' } }
  ]);

  // Cargas sociales y IVA
  tableBody.push([
    { content: seccionMO.cargas_sociales.descripcion, colSpan: 4 },
    { content: seccionMO.cargas_sociales.monto.toFixed(4), styles: { halign: 'right' } }
  ]);
  tableBody.push([
    { content: seccionMO.iva.descripcion, colSpan: 4 },
    { content: seccionMO.iva.monto.toFixed(4), styles: { halign: 'right' } }
  ]);

  // TOTAL MANO DE OBRA 
  tableBody.push([
    '',
    { content: 'TOTAL MANO DE OBRA:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: seccionMO.total.toFixed(4), styles: { fontStyle: 'bold', halign: 'right' } }
  ]);

  // SECCIÓN 3: EQUIPOS
  tableBody.push([
    { content: '3.- EQUIPO, MAQUINARIA Y HERRAMIENTAS', styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } },
    { content: 'Unid.', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } },
    { content: 'Cantidad', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } },
    { content: 'Precio Productivo', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } },
    { content: 'Costo Total', styles: { fontStyle: 'bold', fillColor: [220, 220, 220], halign: 'center' } }
  ]);

  item.formulario_b2.seccion_3_equipo.items_equipo.forEach((eq: ItemComposicion) => {
    tableBody.push([
      `${eq.numero} ${eq.descripcion}`,
      { content: eq.unidad, styles: { halign: 'center' } },
      { content: eq.cantidad.toFixed(4), styles: { halign: 'right' } },
      { content: eq.precio_productivo.toFixed(4), styles: { halign: 'right' } },
      { content: eq.costo_unitario.toFixed(4), styles: { halign: 'right' } }
    ]);
  });

  const seccionEq = item.formulario_b2.seccion_3_equipo;
  tableBody.push([
    { content: seccionEq.herramientas.descripcion, colSpan: 4 },
    { content: seccionEq.herramientas.monto.toFixed(4), styles: { halign: 'right' } }
  ]);

  // TOTAL EQUIPO 
  tableBody.push([
    '',
    { content: 'TOTAL EQUIPO, MAQUINARIA Y HERRAMIENTAS:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: seccionEq.total.toFixed(4), styles: { fontStyle: 'bold', halign: 'right' } }
  ]);

  // SECCIÓN 4: GASTOS GENERALES
  const seccionGG = item.formulario_b2.seccion_4_gastos_generales;
  tableBody.push([
    { content: '4.- GASTOS GENERALES Y ADMINISTRATIVOS', styles: { fontStyle: 'bold' }, colSpan: 5 }
  ]);
  tableBody.push([
    { content: seccionGG.descripcion, colSpan: 4 },
    { content: seccionGG.monto.toFixed(4), styles: { halign: 'right' } }
  ]);

  // TOTAL GASTOS GENERALES 
  tableBody.push([
    '',
    { content: 'TOTAL GASTOS GENERALES Y ADMINISTRATIVOS:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: seccionGG.monto.toFixed(4), styles: { fontStyle: 'bold', halign: 'right' } }
  ]);

  // SECCIÓN 5: UTILIDAD
  const seccionUtil = item.formulario_b2.seccion_5_utilidad;
  tableBody.push([
    { content: '5.- UTILIDAD', styles: { fontStyle: 'bold' }, colSpan: 5 }
  ]);
  tableBody.push([
    { content: seccionUtil.descripcion, colSpan: 4 },
    { content: seccionUtil.monto.toFixed(4), styles: { halign: 'right' } }
  ]);

  // TOTAL UTILIDAD 
  tableBody.push([
    '',
    { content: 'TOTAL UTILIDAD:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: seccionUtil.monto.toFixed(4), styles: { fontStyle: 'bold', halign: 'right' } }
  ]);

  // SECCIÓN 6: IMPUESTOS
  const seccionIT = item.formulario_b2.seccion_6_impuestos;
  tableBody.push([
    { content: '6.- IMPUESTOS', styles: { fontStyle: 'bold' }, colSpan: 5 }
  ]);
  tableBody.push([
    { content: seccionIT.descripcion, colSpan: 4 },
    { content: seccionIT.monto.toFixed(4), styles: { halign: 'right' } }
  ]);

  // TOTAL IMPUESTOS 
  tableBody.push([
    '',
    { content: 'TOTAL IMPUESTOS:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: seccionIT.monto.toFixed(4), styles: { fontStyle: 'bold', halign: 'right' } }
  ]);

  // TOTALES FINALES 
  tableBody.push([
    '',
    { content: 'TOTAL PRECIO UNITARIO (1+2+3+4+5+6):', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: item.formulario_b2.total_precio_unitario.toFixed(4), styles: { fontStyle: 'bold', halign: 'right' } }
  ]);
  tableBody.push([
    '',
    { content: 'PRECIO UNITARIO ADOPTADO:', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
    { content: item.formulario_b2.precio_unitario_adoptado.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } }
  ]);

  // CÁLCULO PRESUPUESTO
  const aplicacion = item.formulario_b2.aplicacion_presupuesto;
  tableBody.push([
    { content: 'CALCULO DEL PRESUPUESTO TOTAL:', styles: { fontStyle: 'bold' }, colSpan: 5 }
  ]);
  tableBody.push([
    { 
      content: `${aplicacion.cantidad.toFixed(2)} ${item.unidad}  ×  ${aplicacion.precio_unitario_adoptado.toFixed(2)} Bs/${item.unidad}  =  ${aplicacion.total_presupuesto.toFixed(2)} Bs`, 
      colSpan: 5,
      styles: { halign: 'center' }
    }
  ]);

  // GENERAR TABLA
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25 },
    },
    margin: { 
      left: PDF_CONFIG.margins.left, 
      right: PDF_CONFIG.margins.right 
    },
  });

  agregarPieDePagina(doc, pageNumber, totalPages);
};