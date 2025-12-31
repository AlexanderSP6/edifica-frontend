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

export interface PresupuestoFiltersState {
  buscar: string;
  cliente_id: number | '';
  tipo: string | '';
  fecha_desde: string | '';
  fecha_hasta: string | '';
  activo: string | '';
}

interface Cliente {
  id: number;
  nombre_completo: string;
  ci: string;
}

interface PresupuestoFiltersProps {
  filters: PresupuestoFiltersState;
  clientes: Cliente[];
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

const PresupuestoFilters: React.FC<PresupuestoFiltersProps> = ({
  filters,
  clientes,
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
      {/* Fila 1: Búsqueda, Cliente, Tipo */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Campo de búsqueda */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Buscar"
            placeholder="Buscar proyecto..."
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

        {/* Filtro: Cliente */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Cliente"
            value={filters.cliente_id}
            onChange={(e) =>
              onFilterChange('cliente_id', e.target.value === '' ? '' : Number(e.target.value))
            }
            disabled={loading}
          >
            <MenuItem value="">Todos los clientes</MenuItem>
            {clientes.map((cliente) => (
              <MenuItem key={cliente.id} value={cliente.id}>
                {cliente.nombre_completo} ({cliente.ci})
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Filtro: Tipo */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Tipo"
            value={filters.tipo}
            onChange={(e) => onFilterChange('tipo', e.target.value)}
            disabled={loading}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="cotizacion">Cotización</MenuItem>
            <MenuItem value="contrato">Contrato</MenuItem>
          </TextField>
        </Grid>

        {/* Filtro: Estado */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Estado"
            value={filters.activo}
            onChange={(e) => onFilterChange('activo', e.target.value)}
            disabled={loading}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="1">Activos</MenuItem>
            <MenuItem value="0">Inactivos</MenuItem>
          </TextField>
        </Grid>

        {/* Selector: Registros por página */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Por página"
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            disabled={loading}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Fila 2: Fechas y Botones */}
      <Grid container spacing={2} alignItems="center">
        {/* Fecha Desde */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            type="date"
            size="small"
            label="Desde"
            value={filters.fecha_desde}
            onChange={(e) => onFilterChange('fecha_desde', e.target.value)}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Fecha Hasta */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            type="date"
            size="small"
            label="Hasta"
            value={filters.fecha_hasta}
            onChange={(e) => onFilterChange('fecha_hasta', e.target.value)}
            disabled={loading}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Espaciador */}
        <Grid size={{ xs: 0, md: 6 }} />

        {/* Botones de acción */}
        <Grid size={{ xs: 12, sm: 12, md: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
            {/* Botón: Limpiar filtros */}
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
                flex: { xs: 1, md: 0 },
                minWidth: 100,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'primary.light',
                  color: 'white',
                },
              }}
            >
              Limpiar
            </Button>

            {/* Botón: Buscar */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={onSearch}
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                flex: { xs: 1, md: 0 },
                minWidth: 100,
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

export default PresupuestoFilters;