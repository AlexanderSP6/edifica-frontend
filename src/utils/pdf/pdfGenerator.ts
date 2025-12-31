import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PDF_CONFIG,
  PDFModuleConfig,
  UserInfo,
  ExportOptions,
} from './pdfConfig';


export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private config: PDFModuleConfig;
  private userInfo?: UserInfo;
  private options: ExportOptions;

  constructor(
    config: PDFModuleConfig,
    userInfo?: UserInfo,
    options?: ExportOptions
  ) {
    this.doc = new jsPDF({
      orientation: PDF_CONFIG.orientation,
      unit: PDF_CONFIG.unit,
      format: PDF_CONFIG.format,
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.config = config;
    this.userInfo = userInfo;
    this.options = {
      includeFilters: true,
      includeTimestamp: true,
      ...options,
    };
  }

  // FORMATEAR FECHA ACTUAL
  private getCurrentDateTime(): string {
    return new Date().toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  // OBTENER NOMBRE COMPLETO DEL USUARIO
  private getUserFullName(): string {
    if (!this.userInfo) {
      return 'Sistema';
    }

    const nombre = this.userInfo.nombre || '';
    const apellido = this.userInfo.apellido || '';
    
    return `${nombre} ${apellido}`.trim() || 'Sistema';
  }


  // HEADER Y FOOTER

  private drawHeaderFooter(totalRecords: number): void {
    const { margins, colors, fonts, app } = PDF_CONFIG;

    // Título principal
    this.doc.setFontSize(fonts.title.size);
    this.doc.setFont('helvetica', fonts.title.style);
    this.doc.setTextColor(colors.primary);
    this.doc.text(
      `${app.name} - ${app.description}`,
      this.pageWidth / 2,
      20,
      { align: 'center' }
    );

    // Subtítulo
    this.doc.setFontSize(fonts.subtitle.size);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(
      this.config.title,
      this.pageWidth / 2,
      27,
      { align: 'center' }
    );

    // Información contextual
    this.doc.setFontSize(fonts.header.size);
    this.doc.setFont('helvetica', fonts.header.style);
    this.doc.setTextColor(colors.textLight);

    let yPos = 35;

    // Fecha y usuario
    if (this.options.includeTimestamp) {
      this.doc.text(`Fecha: ${this.getCurrentDateTime()}`, margins.left, yPos);
      yPos += 5;
    }

    this.doc.text(`Usuario: ${this.getUserFullName()}`, margins.left, yPos);
    yPos += 5;

    this.doc.text(`Total de registros: ${totalRecords}`, margins.left, yPos);
    yPos += 5;
    
    // Línea separadora
    this.doc.setDrawColor(colors.accent);
    this.doc.setLineWidth(0.3);
    this.doc.line(
      margins.left,
      margins.top - 6,
      this.pageWidth - margins.right,
      margins.top - 6
    );

    // FOOTER
    
    const currentPage = (this.doc as any).internal.getCurrentPageInfo().pageNumber;
    const pageCount = (this.doc as any).internal.getNumberOfPages();

    // Línea superior del footer
    this.doc.setDrawColor(colors.border);
    this.doc.setLineWidth(0.2);
    this.doc.line(
      margins.left,
      this.pageHeight - margins.bottom + 3,
      this.pageWidth - margins.right,
      this.pageHeight - margins.bottom + 3
    );

    // Texto del footer
    this.doc.setFontSize(fonts.footer.size);
    this.doc.setTextColor(colors.textLight);
    
    // Paginación (derecha)
    this.doc.text(
      `Página ${currentPage} de ${pageCount}`,
      this.pageWidth - margins.right,
      this.pageHeight - 10,
      { align: 'right' }
    );

    // Nombre del sistema (izquierda)
    const footerText = this.options.customFooter || `Sistema ${app.name}`;
    this.doc.text(
      footerText,
      margins.left,
      this.pageHeight - 10,
      { align: 'left' }
    );
  }

  // FORMATEAR DATOS PARA LA TABLA
  private formatTableData(data: any[]): any[][] {
    return data.map((item) => {
      return this.config.columns.map((col) => {
        let value = item[col.dataKey];

        // Aplicar formato personalizado si existe
        if (col.format && value !== null && value !== undefined) {
          return col.format(value);
        }

        // Formatear valores nulos/undefined
        if (value === null || value === undefined) {
          return '-';
        }

        // Formatear booleanos
        if (typeof value === 'boolean') {
          return value ? 'Sí' : 'No';
        }

        return String(value);
      });
    });
  }

  // GENERAR PDF
  public generate(data: any[]): void {
    const { margins, colors, table } = PDF_CONFIG;

    // Preparar headers
    const headers = [this.config.columns.map((col) => col.header)];

    // Preparar body
    const body = this.formatTableData(data);

    // Generar tabla
    autoTable(this.doc, {
      margin: {
        top: margins.top,
        bottom: margins.bottom,
        left: margins.left,
        right: margins.right,
      },

      head: headers,
      body: body,

      // Estilos generales
      styles: {
        fontSize: table.bodyFontSize,
        cellPadding: table.cellPadding,
        overflow: 'linebreak',
        valign: 'middle',
        halign: 'left',
        lineColor: colors.border,
        lineWidth: table.lineWidth,
      },

      // Estilos del header
      headStyles: {
        fillColor: colors.primary,
        textColor: '#ffffff',
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: table.headerFontSize,
        cellPadding: table.headerPadding,
      },

      // Estilos del body
      bodyStyles: {
        textColor: colors.text,
      },

      // Filas alternadas
      alternateRowStyles: {
        fillColor: colors.alternate,
      },

      // Estilos por columna
      columnStyles: this.getColumnStyles(),

      // Dibujar header/footer en cada página
      didDrawPage: () => {
        this.drawHeaderFooter(data.length);
      },

      // Personalizar celdas
      didParseCell: (hookData) => {
        this.customizeCells(hookData);
      },
    });
  }

  // OBTENER ESTILOS POR COLUMNA
  private getColumnStyles(): { [key: number]: any } {
    const styles: { [key: number]: any } = {};

    this.config.columns.forEach((col, index) => {
      styles[index] = {};

      if (col.width) {
        styles[index].cellWidth = col.width;
      }

      if (col.align) {
        styles[index].halign = col.align;
      }
    });

    return styles;
  }

  // PERSONALIZAR CELDAS
  private customizeCells(data: any): void {
    const { colors } = PDF_CONFIG;

    // Solo aplicar estilos en el body
    if (data.section !== 'body') return;

    const cellText = data.cell.text[0];

    // Colorear estados
    if (cellText === 'Activo' || cellText === 'Sí') {
      data.cell.styles.textColor = colors.success;
      data.cell.styles.fontStyle = 'bold';
    } else if (cellText === 'Inactivo' || cellText === 'No') {
      data.cell.styles.textColor = colors.error;
      data.cell.styles.fontStyle = 'bold';
    }

    // Colorear estado de vigencia
    if (cellText === 'Vigente') {
      data.cell.styles.textColor = colors.success;
      data.cell.styles.fontStyle = 'bold';
    } else if (cellText === 'Próximo') {
      data.cell.styles.textColor = colors.warning;
      data.cell.styles.fontStyle = 'bold';
    } else if (cellText === 'Vencido') {
      data.cell.styles.textColor = colors.error;
      data.cell.styles.fontStyle = 'bold';
    }
  }

  // GUARDAR PDF
  public save(): void {
    const fecha = new Date().toISOString().split('T')[0];
    const fileName = `${this.config.fileName}_${fecha}.pdf`;
    this.doc.save(fileName);
  }


  // GENERAR Y GUARDAR PDF
  public generateAndSave(data: any[]): boolean {
    try {
      this.generate(data);
      this.save();
      return true;
    } catch (error) {
      console.error('Error al generar PDF:', error);
      return false;
    }
  }
}

// FUNCIÓN  PARA EXPORTACIÓN 
export const exportToPDF = (
  config: PDFModuleConfig,
  data: any[],
  userInfo?: UserInfo,
  options?: ExportOptions
): boolean => {
  const generator = new PDFGenerator(config, userInfo, options);
  return generator.generateAndSave(data);
};