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

export interface ComponenteFiltersState {
  buscar: string;
  categoria_id: number | '';
  apu_item_id: number | '';
  unidad_id: number | '';
  estado_vigencia: string | '';
  activo: string | '';
}

interface ApuItem {
  id: number;
  codigo: string;
  descripcion: string;
}

interface Unidad {
  id: number;
  codigo: string;
  nombre: string;
}

interface Categoria {
  id: number;
  codigo: string;
  nombre: string;
}

interface ComponenteFiltersProps {
  filters: ComponenteFiltersState;
  categorias: Categoria[]; 
  apuItems: ApuItem[];
  unidades: Unidad[];
  perPage: number;
  loading?: boolean;
  searchPlaceholder?: string;
  onFilterChange: (field: string, value: any) => void;
  onSearch: () => void;
  onReset: () => void;
  onPerPageChange: (value: number) => void;
}

// ==========================================
// COMPONENTE
// ==========================================

const ComponenteFilters: React.FC<ComponenteFiltersProps> = ({
  filters,
  categorias,
  apuItems,
  unidades,
  perPage,
  loading = false,
  searchPlaceholder = 'Buscar...',
  onFilterChange,
  onSearch,
  onReset,
  onPerPageChange,
}) => {
  // ==========================================
  // HANDLERS
  // ==========================================

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !loading) {
      onSearch();
    }
  };

  // Estado para Items filtrados
  const [apuItemsFiltrados, setApuItemsFiltrados] = React.useState(apuItems);

  // Filtrar Items cuando cambia la categoría
  React.useEffect(() => {
    if (filters.categoria_id) {
      const itemsFiltrados = apuItems.filter(
        (item: any) => item.categoria?.id === filters.categoria_id
      );
      setApuItemsFiltrados(itemsFiltrados);

      if (filters.apu_item_id) {
        const itemExiste = itemsFiltrados.some((item) => item.id === filters.apu_item_id);
        if (!itemExiste) {
          onFilterChange('apu_item_id', '');
        }
      }
    } else {
      setApuItemsFiltrados(apuItems);
    }
  }, [filters.categoria_id, apuItems, filters.apu_item_id]);

  React.useEffect(() => {
    if (!filters.categoria_id) {
      setApuItemsFiltrados(apuItems);
    }
  }, [apuItems]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Box sx={{ mb: 3 }}>
      {/* ========================================== */}
      {/* FILA 1: Categoría, APU Item, Unidad */}
      {/* ========================================== */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Filtro: Categoría */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Categoría"
            value={filters.categoria_id}
            onChange={(e) => onFilterChange('categoria_id', e.target.value === '' ? '' : Number(e.target.value))}
            disabled={loading}
          >
            <MenuItem value="">Todas las categorías</MenuItem>
            {categorias.map((categoria) => (
              <MenuItem key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Filtro: APU Item */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="APU Item"
            value={filters.apu_item_id}
            onChange={(e) => onFilterChange('apu_item_id', e.target.value === '' ? '' : Number(e.target.value))}
            disabled={loading}
            helperText={filters.categoria_id ? `${apuItemsFiltrados.length} ítem(s) en esta categoría` : undefined}
          >
            <MenuItem value="">Todos los ítems</MenuItem>
            {apuItemsFiltrados.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.codigo} - {item.descripcion}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Filtro: Unidad */}
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

      {/* ========================================== */}
      {/* FILA 2: Búsqueda, Vigencia, Estado, Per Page, Botones */}
      {/* ========================================== */}
      <Grid container spacing={2} alignItems="center">
        {/* Campo de búsqueda manual */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Buscar"
            placeholder={searchPlaceholder}
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

        {/* Filtro: Estado de Vigencia */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            fullWidth
            select
            size="small"
            label="Vigencia"
            value={filters.estado_vigencia}
            onChange={(e) => onFilterChange('estado_vigencia', e.target.value)}
            disabled={loading}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="vigente">Vigente</MenuItem>
            <MenuItem value="proximo">Próximo</MenuItem>
            <MenuItem value="vencido">Vencido</MenuItem>
          </TextField>
        </Grid>

        {/* Filtro: Estado (Activo/Inactivo) */}
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

        {/* Botones de acción */}
        <Grid size={{ xs: 12, sm: 12, md: 3 }}>
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

export default ComponenteFilters;