import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  Badge,
  IconButton,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { DetalleItem, Cliente } from '../types/presupuesto.types';

// ==========================================
// INTERFACES
// ==========================================

interface CarritoItemsProps {
  detallesItems: DetalleItem[];
  editingIndex: number | null;
  clienteSeleccionado?: Cliente;
  nombreProyecto: string;
  onEditarItem: (index: number) => void;
  onEliminarItem: (index: number) => void;
}

// ==========================================
// COMPONENTE
// ==========================================

export const CarritoItems: React.FC<CarritoItemsProps> = ({
  detallesItems,
  editingIndex,
  clienteSeleccionado,
  nombreProyecto,
  onEditarItem,
  onEliminarItem,
}) => {
  const formatCurrency = (amount: number) => {
    return `Bs ${amount.toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <ShoppingCartIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Carrito
        </Typography>
      </Stack>

      {/* Info Resumen Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: '#fafafa',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Stack spacing={1}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Cliente
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {clienteSeleccionado?.nombre_completo || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Proyecto
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {nombreProyecto || '-'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* LISTA DE ÍTEMS */}
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Badge
            badgeContent={detallesItems.length}
            color={detallesItems.length > 0 ? 'success' : 'default'}
            sx={{
              mb: 2,
              '& .MuiBadge-badge': {
                right: -10,
                top: 5,
              },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Ítems Agregados
            </Typography>
          </Badge>

          <Box sx={{ maxHeight: 320, overflowY: 'auto', mt: 2 }}>
            {detallesItems.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No hay ítems agregados
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {detallesItems.map((item, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: editingIndex === index ? '#fff3e0' : 'grey.50',
                      border: 1,
                      borderColor: editingIndex === index ? 'warning.main' : 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 1,
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.codigo}
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onEditarItem(index)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'white',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onEliminarItem(index)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'error.light',
                              color: 'white',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 1 }}
                    >
                      {item.descripcion}
                    </Typography>

                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        {item.cantidad} {item.unidad} × {formatCurrency(item.precio_unitario)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: 'primary.main',
                          fontSize: '0.95rem',
                        }}
                      >
                        = {formatCurrency(item.subtotal)}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
};
