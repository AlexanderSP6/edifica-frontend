import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { exportToPDF } from '../utils/pdf/pdfGenerator';
import {
  PDFModuleConfig,
  ExportOptions,
  UserInfo,
} from '../utils/pdf/pdfConfig';

// ==========================================
// HOOK PARA EXPORTACIÓN DE PDFs
// ==========================================
export const usePDFExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string>('');
  const { user } = useAuth();

  /**
   * Obtener información del usuario desde AuthContext
   */
  const getUserInfo = (): UserInfo => {
    if (!user) {
      return {};
    }

    return {
      nombre: user.nombres || '',
      apellido: `${user.appaterno || ''} ${user.apmaterno || ''}`.trim(),
      email: user.email || '',
    };
  };

  /**
   * Exportar datos a PDF
   */
  const exportData = async (
    config: PDFModuleConfig,
    data: any[],
    options?: ExportOptions
  ): Promise<boolean> => {
    if (!data || data.length === 0) {
      setExportError('No hay datos para exportar');
      return false;
    }

    setIsExporting(true);
    setExportError('');

    try {
      const userInfo = getUserInfo();
      
      const success = exportToPDF(
        config,
        data,
        userInfo,
        options
      );

      if (!success) {
        setExportError('Error al generar el PDF');
        return false;
      }

      return true;
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al exportar PDF';
      setExportError(errorMessage);
      console.error('Error en exportación PDF:', error);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Limpiar error
   */
  const clearError = () => {
    setExportError('');
  };

  return {
    isExporting,
    exportError,
    exportData,
    clearError,
  };
};