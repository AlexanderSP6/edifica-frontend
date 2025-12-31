import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

// ==========================================
// INTERFACES
// ==========================================

interface ManoObraFiltersProps {
  filters: {
    buscar: string;
    apu_item_id: number | '';
    unidad_id: number | '';
    moneda: string;
    costo_min: number | '';
    costo_max: number | '';
    activo: string | '';
  };
  apuItems: Array<{ id: number; codigo: string; descripcion: string }>;
  unidades: Array<{ id: number; codigo: string; nombre: string }>;
  perPage: number;
  loading?: boolean;
  onFilterChange: (field: string, value: any) => void;
  onSearch: () => void;
  onReset: () => void;
  onPerPageChange: (value: number) => void;
}

// ==========================================
// COMPONENTE
// ==========================================

const ManoObraFilters: React.FC<ManoObraFiltersProps> = ({
  filters,
  apuItems,
  unidades,
  perPage,
  loading = false,
  onFilterChange,
  onSearch,
  onReset,
  onPerPageChange,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !loading) {
      onSearch();
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Fila 1: Búsqueda y Selectores principales */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Buscar"
            placeholder="Buscar por descripción..."
            value={filters.buscar}
            onChange={(e) => onFilterChange('buscar', e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            select
            size="small"
            label=" Item"
            value={filters.apu_item_id}
            onChange={(e) => onFilterChange('apu_item_id', e.target.value === '' ? '' : Number(e.target.value))}
            disabled={loading}
          >
            <MenuItem value="">Todos los Ítems </MenuItem>
            {apuItems.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.codigo} - {item.descripcion}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Unidad"
            value={filters.unidad_id}
            onChange={(e) => onFilterChange('unidad_id', e.target.value === '' ? '' : Number(e.target.value))}
            disabled={loading}
          >
            <MenuItem value="">Todas las unidades</MenuItem>
            {unidades.map((unidad) => (
              <MenuItem key={unidad.id} value={unidad.id}>
                {unidad.codigo} - {unidad.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Fila 2: Filtros de Moneda y Costos */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Moneda"
            value={filters.moneda}
            onChange={(e) => onFilterChange('moneda', e.target.value)}
            disabled={loading}
          >
            <MenuItem value="">Todas las monedas</MenuItem>
            <MenuItem value="BOB">BOB - Bolivianos</MenuItem>
            <MenuItem value="USD">USD - Dólares</MenuItem>
            <MenuItem value="EUR">EUR - Euros</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Costo Mínimo"
            placeholder="0.00"
            value={filters.costo_min}
            onChange={(e) => onFilterChange('costo_min', e.target.value === '' ? '' : Number(e.target.value))}
            onKeyPress={handleKeyPress}
            disabled={loading}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Costo Máximo"
            placeholder="0.00"
            value={filters.costo_max}
            onChange={(e) => onFilterChange('costo_max', e.target.value === '' ? '' : Number(e.target.value))}
            onKeyPress={handleKeyPress}
            disabled={loading}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Estado"
            value={filters.activo}
            onChange={(e) => onFilterChange('activo', e.target.value)}
            disabled={loading}
          >
            <MenuItem value="">Todos los estados</MenuItem>
            <MenuItem value="1">Activos</MenuItem>
            <MenuItem value="0">Inactivos</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Fila 3: Registros por página y Acciones */}
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Por página"
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            disabled={loading}
          >
            <MenuItem value={5}>5 </MenuItem>
            <MenuItem value={10}>10 </MenuItem>
            <MenuItem value={15}>15 </MenuItem>
            <MenuItem value={20}>20 </MenuItem>
            <MenuItem value={50}>50 </MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 9 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                flex: { xs: 1, sm: 0 },
                minWidth: 140,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'primary.light',
                  color: 'white',
                },
              }}
            >
              Limpiar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={onSearch}
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                flex: { xs: 1, sm: 0 },
                minWidth: 140,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManoObraFilters;