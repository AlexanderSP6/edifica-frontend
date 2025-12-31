import React from 'react';
import { Grid } from '@mui/material';
import { BusquedaItems } from './BusquedaItems';
import { CarritoItems } from './CarritoItems';
import { ResumenFinanciero } from './ResumenFinanciero';
import type {
  ApuItemSelect,
  Categoria,
  DetalleItem,
  Cliente,
} from '../types/presupuesto.types';

// ==========================================
// INTERFACES
// ==========================================

interface SeleccionItemsProps {
  // Búsqueda
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

  // Carrito
  detallesItems: DetalleItem[];
  clienteSeleccionado?: Cliente;
  nombreProyecto: string;
  onEditarItem: (index: number) => void;
  onEliminarItem: (index: number) => void;

  // Resumen Financiero B-2
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

export const SeleccionItems: React.FC<SeleccionItemsProps> = ({
  // Búsqueda
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

  // Carrito
  detallesItems,
  clienteSeleccionado,
  nombreProyecto,
  onEditarItem,
  onEliminarItem,

  // Resumen total financiero
  subtotal,
  porcentajeCargas,
  porcentajeIvaMO,
  porcentajeHerramientas,
  porcentajeGastosGenerales,
  porcentajeUtilidad,
  porcentajeImpuestosIT,
}) => {
  return (
    <Grid container spacing={3}>
      {/* BÚSQUEDA - IZQUIERDA */}
      <Grid size={{ xs: 12, md: 7 }}>
        <BusquedaItems
          searchApuItem={searchApuItem}
          categoriaFiltro={categoriaFiltro}
          categorias={categorias}
          filteredApuItems={filteredApuItems}
          selectedApuItem={selectedApuItem}
          cantidadTemp={cantidadTemp}
          editingIndex={editingIndex}
          onSearchChange={onSearchChange}
          onCategoriaChange={onCategoriaChange}
          onSelectApuItem={onSelectApuItem}
          onCantidadChange={onCantidadChange}
          onAgregarItem={onAgregarItem}
          onCancelarEdicion={onCancelarEdicion}
        />
      </Grid>

      {/* CARRITO Y RESUMEN - DERECHA */}
      <Grid size={{ xs: 12, md: 5 }}>
        <CarritoItems
          detallesItems={detallesItems}
          editingIndex={editingIndex}
          clienteSeleccionado={clienteSeleccionado}
          nombreProyecto={nombreProyecto}
          onEditarItem={onEditarItem}
          onEliminarItem={onEliminarItem}
        />

        <ResumenFinanciero
          subtotal={subtotal}
          porcentajeCargas={porcentajeCargas}
          porcentajeIvaMO={porcentajeIvaMO}
          porcentajeHerramientas={porcentajeHerramientas}
          porcentajeGastosGenerales={porcentajeGastosGenerales}
          porcentajeUtilidad={porcentajeUtilidad}
          porcentajeImpuestosIT={porcentajeImpuestosIT}
        />
      </Grid>
    </Grid>
  );
};