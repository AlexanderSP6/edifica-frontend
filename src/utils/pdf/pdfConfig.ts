// ==========================================
// CONFIGURACIÓN GLOBAL PARA GENERACIÓN DE PDFs
// ==========================================

export const PDF_CONFIG = {
  // Orientación y formato
  orientation: 'landscape' as const,
  unit: 'mm' as const,
  format: 'a4' as const,

  // Márgenes
  margins: {
    top: 48,
    bottom: 18,
    left: 14,
    right: 14,
  },

  // Colores corporativos (paleta neutra profesional)
  colors: {
    primary: '#1a1a1a',       
    accent: '#1976d2',         
    text: '#323232',           
    textLight: '#646464',      
    success: '#2e7d32',        
    error: '#c62828',          
    warning: '#f57c00',        
    border: '#dcdcdc',         
    alternate: '#f8f8f8',      
  },

  // Estilos de fuente
  fonts: {
    title: {
      size: 14,
      style: 'bold' as const,
    },
    subtitle: {
      size: 10,
      style: 'normal' as const,
    },
    header: {
      size: 9,
      style: 'normal' as const,
    },
    body: {
      size: 7.5,
      style: 'normal' as const,
    },
    footer: {
      size: 8,
      style: 'normal' as const,
    },
  },

  // Configuración de tabla
  table: {
    cellPadding: 2,
    headerPadding: 3,
    lineWidth: 0.1,
    headerFontSize: 8,
    bodyFontSize: 7.5,
  },

  // Información de la aplicación
  app: {
    name: 'EDIFICA',
    description: 'Sistema de Presupuestos de Construcción',
    version: '1.0.0',
  },
};

// ==========================================
// TIPOS DE ALINEACIÓN
// ==========================================
export type Alignment = 'left' | 'center' | 'right';

// ==========================================
// DEFINICIÓN DE COLUMNA
// ==========================================
export interface ColumnDef {
  header: string;
  dataKey: string;
  width?: number;
  align?: Alignment;
  format?: (value: any) => string;
}

// ==========================================
// CONFIGURACIÓN DE PDF POR MÓDULO
// ==========================================
export interface PDFModuleConfig {
  title: string;
  subtitle?: string;
  columns: ColumnDef[];
  fileName: string;
}

// ==========================================
// INFORMACIÓN DEL USUARIO
// ==========================================
export interface UserInfo {
  nombre?: string;
  apellido?: string;
  email?: string;
}

// ==========================================
// OPCIONES DE EXPORTACIÓN
// ==========================================
export interface ExportOptions {
  includeFilters?: boolean;
  includeTimestamp?: boolean;
  customFooter?: string;
}