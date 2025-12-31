import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import presupuestoService, { DatosReportePDF } from '../services/presupuestoService';
import { generarFormularioB2Completo } from './pdf/PDFFormularioB2Completo';

// ==========================================
// INTERFACES
// ==========================================

interface GenerarPDFFormularioB2Props {
  presupuestoId: number;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const GenerarPDFFormularioB2: React.FC<GenerarPDFFormularioB2Props> = ({
  presupuestoId,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGenerarPDF = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const datos: DatosReportePDF = await presupuestoService.getDatosReportePDF(presupuestoId);

      if (!datos || !datos.items_detallados || datos.items_detallados.length === 0) {
        throw new Error('El presupuesto no tiene ítems para generar el PDF');
      }

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const totalPages = datos.items_detallados.length;

      // GENERA UNA TABLA POR PÁGINA
      datos.items_detallados.forEach((item, index) => {
        if (index > 0) {
          doc.addPage();
        }

        generarFormularioB2Completo(doc, datos, item, index + 1, totalPages);
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `Formulario_B2_${datos.datos_generales.numero_presupuesto}_${timestamp}.pdf`;
      
      doc.save(fileName);

      setSuccess(true);
    } catch (err: any) {
      console.error('Error al generar PDF del Formulario B-2:', err);
      setError(err.response?.data?.message || err.message || 'Error al generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        color="error"
        fullWidth={fullWidth}
        startIcon={
          loading ? (
            <CircularProgress size={20} sx={{ color: 'white' }} />
          ) : (
            <PictureAsPdfIcon />
          )
        }
        onClick={handleGenerarPDF}
        disabled={loading}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        {loading ? 'Generando PDF...' : 'Descargar Formulario B-2 (PDF)'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          PDF del Formulario B-2 generado exitosamente
        </Alert>
      </Snackbar>
    </>
  );
};

export default GenerarPDFFormularioB2;