import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import presupuestoService from '../services/presupuestoService';
import { generarPDFFormularioB1 } from './pdf/PDFFormularioB1';

// ==========================================
// INTERFACES
// ==========================================

interface GenerarPDFFormularioB1Props {
  presupuestoId: number;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const GenerarPDFFormularioB1: React.FC<GenerarPDFFormularioB1Props> = ({
  presupuestoId,
  variant = 'outlined',
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
      // Obtener datos del backend
      const datos = await presupuestoService.getDatosFormularioB1(presupuestoId);

      if (!datos || !datos.items || datos.items.length === 0) {
        throw new Error('El presupuesto no tiene ítems para generar el PDF');
      }

      // Generar PDF
      const doc = generarPDFFormularioB1(datos);

      // Descargar
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `Formulario_B1_${datos.datos_generales.numero_presupuesto}_${timestamp}.pdf`;
      
      doc.save(fileName);

      setSuccess(true);
    } catch (err: any) {
      console.error('Error al generar PDF del Formulario B-1:', err);
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
        color="primary"
        fullWidth={fullWidth}
        startIcon={
          loading ? (
            <CircularProgress size={20} sx={{ color: 'inherit' }} />
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
        {loading ? 'Generando PDF...' : 'Descargar Formulario B-1 (PDF)'}
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
          PDF del Formulario B-1 generado exitosamente
        </Alert>
      </Snackbar>
    </>
  );
};

export default GenerarPDFFormularioB1;