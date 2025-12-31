import jsPDF from 'jspdf';
import { agregarPieDePagina } from '../../utils/pdfFormularioB2';

/**
 * Wrapper para agregar pie de página
 * Mantiene consistencia con el resto de módulos
 */
export const generarPiePagina = (
  doc: jsPDF,
  pageNumber: number,
  totalPages: number
): void => {
  agregarPieDePagina(doc, pageNumber, totalPages);
};