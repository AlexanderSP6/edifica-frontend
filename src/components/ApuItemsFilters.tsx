// src/components/ApuItemsFilters.tsx
import React from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography,
  CircularProgress,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ApuItemsFiltersProps {
  filters: {
    buscar: string;
    categoria_id: string;
    unidad_id: string;
    rango_precio: '' | 'bajo' | 'medio' | 'elevado';
    activo: string;
  };
  categorias: Array<{ id: number; nombre: string }>;
  unidades: Array<{ id: number; codigo: string; nombre: string }>;
  perPage: number;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onReset: () => void;
  onPerPageChange: (value: number) => void;
  loading?: boolean;
}

const ApuItemsFilters: React.FC<ApuItemsFiltersProps> = ({
  filters,
  categorias,
  unidades,
  perPage,
  onFilterChange,
  onSearch,
  onReset,
  onPerPageChange,
  loading = false,
}) => {
  const selectStyles = {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.87)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* FILA 1: Buscar + Categoría */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Buscar */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Buscar"
              name="buscar"
              value={filters.buscar}
              onChange={onFilterChange}
              placeholder="Código o descripción..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch();
                }
              }}
            />
          </Grid>

          {/* Categoría */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoría</InputLabel>
              <Select
                name="categoria_id"
                value={filters.categoria_id}
                label="Categoría"
                onChange={onFilterChange as any}
                sx={selectStyles}
              >
                <MenuItem value="">Todas</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id.toString()}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* FILA 2: Unidad + Rango de Precio + Estado */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Unidad */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Unidad</InputLabel>
              <Select
                name="unidad_id"
                value={filters.unidad_id}
                label="Unidad"
                onChange={onFilterChange as any}
                sx={selectStyles}
              >
                <MenuItem value="">Todas</MenuItem>
                {unidades.map((unidad) => (
                  <MenuItem key={unidad.id} value={unidad.id.toString()}>
                    {unidad.codigo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Rango de Precio */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Rango de Precio</InputLabel>
              <Select
                name="rango_precio"
                value={filters.rango_precio}
                label="Rango de Precio"
                onChange={onFilterChange as any}
                sx={selectStyles}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="bajo">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="BAJO" color="success" size="small" />
                    <Typography variant="caption">(0-100)</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="medio">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="MEDIO" color="warning" size="small" />
                    <Typography variant="caption">(100-500)</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="elevado">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="ELEVADO" color="error" size="small" />
                    <Typography variant="caption">(&gt;500)</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Estado */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                name="activo"
                value={filters.activo}
                label="Estado"
                onChange={onFilterChange as any}
                sx={selectStyles}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activos</MenuItem>
                <MenuItem value="false">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* FILA 3: Botones + Items por página */}
        <Grid container spacing={2} alignItems="center">
          {/* Items por página */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Items por página</InputLabel>
              <Select
                value={perPage}
                label="Items por página"
                onChange={(e) => onPerPageChange(Number(e.target.value))}
                sx={selectStyles}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Espaciador */}
          <Grid size="grow" />

          {/* Botón Buscar */}
          <Grid size={{ xs: 6, sm: 'auto' }}>
            <Button
              variant="contained"
              onClick={onSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ 
                textTransform: 'none',
                minWidth: 120,
              }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Grid>

          {/* Botón Limpiar */}
          <Grid size={{ xs: 6, sm: 'auto' }}>
            <Button
  variant="text" 
  startIcon={<RefreshIcon />}
  onClick={onReset}
  disabled={loading}
  sx={{ 
    textTransform: 'none', 
    minWidth: 120,
    bgcolor: '#4685e9ff',  
    color: 'white',
    fontWeight: 600,
    boxShadow: 2,
  }}
>
  Limpiar
</Button>
          </Grid>

          
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ApuItemsFilters;