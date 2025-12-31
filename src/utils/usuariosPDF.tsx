import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Cookies from 'js-cookie';

interface User {
  iduser: number;
  ci: string;
  grado: string;
  nombres: string;
  appaterno: string;
  apmaterno: string;
  email: string;
  celular: string;
  usuario: string;
  status: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  password_reset_required?: boolean;
  password_expires_at?: string | null;
  roles: Array<{ idrol: number; rol: string; status: boolean }>;
}

const getImageBase64FromUrl = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('No se pudo obtener el contexto del canvas'));
      }
    };
    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = url;
  });
};

export const exportarUsuariosPDF = async (
  usuarios: User[],
  filtros?: {
    searchTerm?: string;
    statusFilter?: string;
    rolFilter?: string;
  }
): Promise<boolean> => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const MARGIN_TOP = 48;
    const MARGIN_BOTTOM = 18;

    let logoBase64 = '';
    try {
      logoBase64 = await getImageBase64FromUrl('/minlogo.png');
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error);
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const cookieUser = Cookies.get('user');
    let usuarioNombre = '';
    let usuarioGrado = '';

    if (cookieUser) {
      try {
        const u = JSON.parse(cookieUser);
        usuarioNombre = `${u.nombres || ''} ${u.appaterno || ''} ${u.apmaterno || ''}`.trim();
        usuarioGrado = u.grado || '';
      } catch (error) {
        console.warn('Error al parsear usuario:', error);
      }
    }

    const fechaActual = new Date().toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    let textoFiltros = '';
    if (filtros) {
        const filtrosAplicados = [];
        if (filtros.searchTerm) filtrosAplicados.push('Búsqueda');
        if (filtros.statusFilter) filtrosAplicados.push('Estado');
        if (filtros.rolFilter) filtrosAplicados.push('Rol');
  
        if (filtrosAplicados.length > 0) {
        textoFiltros = `Filtro por: ${filtrosAplicados.join(', ')}`;
        }
    }

    const drawHeaderFooter = () => {
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 10, 8, 70, 0);
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 26, 26);
      doc.text(' Usuarios del Sistema EDIFICA', pageWidth / 2, 20, {
        align: 'center',
      });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);

      doc.text(`Fecha: ${fechaActual}`, 14, 28);
      doc.text(
        `Usuario: ${usuarioGrado ? usuarioGrado + ' ' : ''}${usuarioNombre || 'Sistema'}`,
        14,
        34
      );
      doc.text(`Total de usuarios: ${usuarios.length}`, 14, 40);

      if (textoFiltros) {
        doc.setTextColor(25, 118, 210);
        doc.text(textoFiltros, 14, 46);
      }

      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(0.3);
      doc.line(14, MARGIN_TOP - 6, pageWidth - 14, MARGIN_TOP - 6);

      const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
      const pageCount = (doc as any).internal.getNumberOfPages();

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(14, pageHeight - MARGIN_BOTTOM + 3, pageWidth - 14, pageHeight - MARGIN_BOTTOM + 3);

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Página ${currentPage} de ${pageCount}`, pageWidth - 14, pageHeight - 10, {
        align: 'right',
      });
      doc.text('Sistema EDIFICA - Gestión de Usuarios', 14, pageHeight - 10, {
        align: 'left',
      });
    };

    autoTable(doc, {
      margin: {
        top: MARGIN_TOP,
        bottom: MARGIN_BOTTOM,
        left: 14,
        right: 14,
      },

      head: [
        [
          'N°',
          'Usuario',
          'CI',
          'Grado',
          'Nombre Completo',
          'Email',
          'Celular',
          'Roles',
          'Estado',
          'Último Login',
        ],
      ],

      body: usuarios.map((user, index) => {
        const nombreCompleto = [user.nombres, user.appaterno, user.apmaterno]
          .filter(Boolean)
          .join(' ')
          .trim() || '-';

        let rolesTexto = '-';
        if (user.roles && user.roles.length > 0) {
          rolesTexto = user.roles.map((r) => r.rol).join(', ');
        }

        let lastLoginTexto = 'Nunca';
        if (user.last_login) {
          try {
            lastLoginTexto = new Date(user.last_login).toLocaleString('es-BO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          } catch {
            lastLoginTexto = '-';
          }
        }

        return [
          index + 1,
          user.usuario || '-',
          user.ci || '-',
          user.grado || '-',
          nombreCompleto,
          user.email || '-',
          user.celular || '-',
          rolesTexto,
          user.status ? 'Activo' : 'Inactivo',
          lastLoginTexto,
        ];
      }),

      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        overflow: 'linebreak',
        valign: 'middle',
        halign: 'left',
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },

      headStyles: {
        fillColor: [26, 26, 26],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 8,
        cellPadding: 3,
      },

      bodyStyles: {
        textColor: [50, 50, 50],
      },

      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },

      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 20 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 22 },
        4: { cellWidth: 45 },
        5: { cellWidth: 40 },
        6: { cellWidth: 18, halign: 'center' },
        7: { cellWidth: 35 },
        8: { cellWidth: 16, halign: 'center' },
        9: { cellWidth: 30, halign: 'center' },
      },

      didDrawPage: () => {
        drawHeaderFooter();
      },

      didParseCell: (data) => {
        if (data.column.index === 8 && data.section === 'body') {
          const estadoTexto = data.cell.text[0];
          if (estadoTexto === 'Activo') {
            data.cell.styles.textColor = [46, 125, 50];
            data.cell.styles.fontStyle = 'bold';
          } else if (estadoTexto === 'Inactivo') {
            data.cell.styles.textColor = [198, 40, 40];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `usuarios_edifica_${fecha}.pdf`;
    doc.save(nombreArchivo);

    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return false;
  }
};
