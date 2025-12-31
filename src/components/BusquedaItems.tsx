import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Autocomplete,
  Button,
  Typography,
  Stack,
  InputAdornment,
  Alert,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import ConstructionIcon from '@mui/icons-material/Construction';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HandymanIcon from '@mui/icons-material/Handyman';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import type { ApuItemSelect, Categoria } from '../types/presupuesto.types';

// ==========================================
// INTERFACES
// ==========================================

interface BusquedaItemsProps {
  searchApuItem: string;
  categoriaFiltro: number | '';
  categorias: Categoria[];
  filteredApuItems: ApuItemSelect[];
  selectedApuItem: ApuItemSelect | null;
  cantidadTemp: string;
  editingIndex: number | null;
  onSearchChange: (value: string) => void;
  onCategoriaChange: (value: number | '') => void;
  onSelectApuItem: (item: ApuItemSelect | null) => void;
  onCantidadChange: (value: string) => void;
  onAgregarItem: () => void;
  onCancelarEdicion: () => void;
}

// ==========================================
// COMPONENTE
// ==========================================

export const BusquedaItems: React.FC<BusquedaItemsProps> = ({
  searchApuItem,
  categoriaFiltro,
  categorias,
  filteredApuItems,
  selectedApuItem,
  cantidadTemp,
  editingIndex,
  onSearchChange,
  onCategoriaChange,
  onSelectApuItem,
  onCantidadChange,
  onAgregarItem,
  onCancelarEdicion,
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
        <SearchIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Búsqueda de Ítems
        </Typography>
      </Stack>

      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Búsqueda Texto CON DEBOUNCE */}
          <TextField
            fullWidth
            size="small"
            label="Buscar por código o descripción"
            value={searchApuItem}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ej: C100 o Excavación"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Filtro Categoría - INMEDIATO */}
          <TextField
            fullWidth
            select
            size="small"
            label="Filtrar por categoría"
            value={categoriaFiltro}
            onChange={(e) => onCategoriaChange(e.target.value === '' ? '' : Number(e.target.value))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CategoryIcon sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Todas las categorías</MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.nombre}
              </MenuItem>
            ))}
          </TextField>

          {/* Autocomplete APU */}
          <Autocomplete
            options={filteredApuItems}
            getOptionLabel={(option) => `${option.codigo} - ${option.descripcion}`}
            value={selectedApuItem}
            onChange={(_, newValue) => onSelectApuItem(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Seleccionar ítem APU" placeholder="Buscar ítem..." />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.codigo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.descripcion}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {option.unidad.codigo}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {formatCurrency(option.precio_actual?.precio_total || 0)}
                    </Typography>
                  </Stack>
                </Box>
              </li>
            )}
            sx={{ mb: 2 }}
          />

          {/* ÍTEM SELECCIONADO */}
          {selectedApuItem && (
            <Box>
              {/* Info del ítem */}
              <Alert
                icon={<ConstructionIcon />}
                severity="info"
                sx={{
                  mb: 2,
                  backgroundColor: '#e3f2fd',
                  '& .MuiAlert-icon': {
                    color: 'primary.main',
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedApuItem.codigo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedApuItem.descripcion}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  Unidad: {selectedApuItem.unidad.codigo}
                </Typography>
              </Alert>

              {/* DESGLOSE DE PRECIOS */}
              {selectedApuItem.precio_actual && (
                <Card
                  elevation={0}
                  sx={{
                    mb: 2,
                    border: 2,
                    borderColor: 'primary.main',
                    backgroundColor: '#f5f9ff',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 1.5,
                      }}
                    >
                      Desglose de Precios
                    </Typography>

                    <Stack spacing={1}>
                      {/* Materiales */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ConstructionIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Materiales
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(selectedApuItem.precio_actual.precio_material)}
                        </Typography>
                      </Stack>

                      {/* Mano de Obra */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EngineeringIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Mano de Obra
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(selectedApuItem.precio_actual.precio_mano_obra)}
                        </Typography>
                      </Stack>

                      {/* Equipos */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <HandymanIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Equipos
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(selectedApuItem.precio_actual.precio_equipo)}
                        </Typography>
                      </Stack>

                      <Divider sx={{ my: 1 }} />

                      {/* TOTAL */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          TOTAL
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            fontSize: '1.1rem',
                          }}
                        >
                          {formatCurrency(selectedApuItem.precio_actual.precio_total)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* INPUT CANTIDAD Y BOTÓN AGREGAR */}
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cantidad"
                  value={cantidadTemp}
                  onChange={(e) => onCantidadChange(e.target.value)}
                  inputProps={{ step: '0.01', min: '0.0001' }}
                  placeholder="Ingrese cantidad..."
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={editingIndex !== null ? <EditIcon /> : <AddIcon />}
                  onClick={onAgregarItem}
                  disabled={!cantidadTemp || parseFloat(cantidadTemp) <= 0}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5,
                  }}
                >
                  {editingIndex !== null ? 'Actualizar Ítem' : 'Agregar al Carrito'}
                </Button>

                {editingIndex !== null && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    startIcon={<CloseIcon />}
                    onClick={onCancelarEdicion}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancelar Edición
                  </Button>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
};