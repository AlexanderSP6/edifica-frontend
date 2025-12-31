import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Chip,
  Paper,
  Alert,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoIcon from '@mui/icons-material/Info';
import PercentIcon from '@mui/icons-material/Percent';

// ==========================================
// INTERFACES
// ==========================================

interface ResumenFinancieroProps {
  subtotal: number;
  porcentajeCargas: number;
  porcentajeIvaMO: number;
  porcentajeHerramientas: number;
  porcentajeGastosGenerales: number;
  porcentajeUtilidad: number;
  porcentajeImpuestosIT: number;
}

// ==========================================
// COMPONENTE
// ==========================================

export const ResumenFinanciero: React.FC<ResumenFinancieroProps> = ({
  subtotal,
  porcentajeCargas,
  porcentajeIvaMO,
  porcentajeHerramientas,
  porcentajeGastosGenerales,
  porcentajeUtilidad,
  porcentajeImpuestosIT,
}) => {
  const formatCurrency = (amount: number) => {
    return `Bs ${amount.toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  return (
    <Box>
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <AttachMoneyIcon sx={{ color: 'success.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Resumen Financiero
        </Typography>
      </Stack>

      <Card
        elevation={2}
        sx={{
          borderLeft: 4,
          borderColor: 'success.main',
          backgroundColor: '#f8fffe',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            
            {/* ========================================== */}
            {/* ALERTA INFORMATIVA */}
            {/* Explica al usuario QUÉ va a pasar */}
            {/* ========================================== */}
            <Alert 
              severity="info" 
              icon={<InfoIcon />}
              sx={{ 
                backgroundColor: '#e3f2fd',
                '& .MuiAlert-icon': {
                  color: 'info.main',
                }
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                Los detalles del presupuesto se calculará <strong>automáticamente al guardar</strong>,basado en los materiales, mano de obra y equipo de cada ítem  seleccionado.
              </Typography>
            </Alert>

            {/* ========================================== */}
            {/* SUBTOTAL ACTUAL */}
            {/* Muestra cuánto suman los ítems agregados */}
            {/* ========================================== */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2.5, 
                backgroundColor: 'white',
                border: 2,
                borderColor: 'primary.main',
                borderRadius: 2
              }}
            >
              <Stack spacing={1}>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 700,
                    letterSpacing: 1.2
                  }}
                >
                  SUBTOTAL ÍTEMS SELECCIONADOS
                </Typography>
                
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'primary.main',
                    fontFamily: 'monospace'
                  }}
                >
                  {formatCurrency(subtotal)}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Suma de todos los ítems agregados al presupuesto
                </Typography>
              </Stack>
            </Paper>

            <Divider sx={{ my: 1 }} />

            {/* ========================================== */}
            {/* PORCENTAJES CONFIGURADOS B-2 */}
            {/* Muestra qué porcentajes aplicará el backend */}
            {/* ========================================== */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <PercentIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'text.primary'
                  }}
                >
                  Porcentajes Formulario B-2 Configurados
                </Typography>
              </Stack>
              
              <Stack spacing={1.5}>
                {/* Sección 2: Mano de Obra */}
                <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                    SECCIÓN 2: MANO DE OBRA
                  </Typography>
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Cargas Sociales:
                      </Typography>
                      <Chip 
                        label={formatPercentage(porcentajeCargas)} 
                        size="small" 
                        color="info"
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        IVA Mano Obra:
                      </Typography>
                      <Chip 
                        label={formatPercentage(porcentajeIvaMO)} 
                        size="small" 
                        color="info"
                      />
                    </Stack>
                  </Stack>
                </Paper>

                {/* Sección 3: Equipo */}
                <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                    SECCIÓN 3: EQUIPO
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Herramientas:
                    </Typography>
                    <Chip 
                      label={formatPercentage(porcentajeHerramientas)} 
                      size="small" 
                      color="warning"
                    />
                  </Stack>
                </Paper>

                {/* Secciones 4-6: Gastos, Utilidad, IT */}
                <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                    SECCIONES 4-6: GASTOS, UTILIDAD E IMPUESTOS
                  </Typography>
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Gastos Generales:
                      </Typography>
                      <Chip 
                        label={formatPercentage(porcentajeGastosGenerales)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Utilidad:
                      </Typography>
                      <Chip 
                        label={formatPercentage(porcentajeUtilidad)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Impuestos IT:
                      </Typography>
                      <Chip 
                        label={formatPercentage(porcentajeImpuestosIT)} 
                        size="small" 
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </Box>

            <Divider sx={{ borderStyle: 'dashed', borderWidth: 2, my: 1 }} />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};