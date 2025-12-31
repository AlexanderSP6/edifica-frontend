import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Skeleton,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';

// ==========================================
// INTERFACES
// ==========================================

export interface DataTableColumn<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  format?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableAction<T> {
  icon: React.ReactNode;
  label: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  tooltip?: (row: T) => string;
  show?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  page: number;
  totalPages: number;
  totalRecords: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onEdit?: (row: T) => void;
  onToggle?: (row: T) => void;
  onDelete?: (row: T) => void;
  customActions?: DataTableAction<T>[];
  emptyMessage?: string;
  getRowId: (row: T) => number | string;
  getRowActive?: (row: T) => boolean;
  showActions?: boolean;
  showToggle?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showIndex?: boolean;
}

// ==========================================
// COMPONENTE SKELETON
// ==========================================

interface TableRowSkeletonProps {
  columns: number;
}

const TableRowSkeleton: React.FC<TableRowSkeletonProps> = ({ columns }) => (
  <TableRow>
    {Array.from({ length: columns }).map((_, index) => (
      <TableCell key={index}>
        <Skeleton variant="text" />
      </TableCell>
    ))}
  </TableRow>
);

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  page,
  totalPages,
  totalRecords,
  perPage,
  onPageChange,
  onEdit,
  onToggle,
  onDelete,
  customActions = [],
  emptyMessage = 'No se encontraron registros',
  getRowId,
  getRowActive,
  showActions = true,
  showToggle = true,
  showEdit = true,
  showDelete = true,
  showIndex = true,
}: DataTableProps<T>) {
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  const totalColumns = columns.length + (showIndex ? 1 : 0) + (showActions ? 1 : 0);

  const hasAnyAction = showEdit || showToggle || showDelete || customActions.length > 0;

  return (
    <Box>
      {/* Tabla */}
      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {showIndex && (
                <TableCell align="center" sx={{ fontWeight: 'bold', width: 60 }}>
                  #
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 'bold',
                    minWidth: column.minWidth,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {showActions && hasAnyAction && (
                <TableCell align="center" sx={{ fontWeight: 'bold', width: 150 }}>
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: perPage }).map((_, index) => (
                <TableRowSkeleton key={index} columns={totalColumns} />
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumns} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const rowId = getRowId(row);
                const isActive = getRowActive ? getRowActive(row) : true;

                return (
                  <TableRow key={rowId} hover>
                    {showIndex && (
                      <TableCell align="center">
                        {(page - 1) * perPage + index + 1}
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.format ? column.format(value, row) : value}
                        </TableCell>
                      );
                    })}
                    {showActions && hasAnyAction && (
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {/* Acción Editar */}
                          {showEdit && onEdit && (
                            <Tooltip title={isActive ? 'Editar' : 'No se puede editar un registro inactivo'}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => onEdit(row)}
                                  disabled={!isActive}
                                  sx={{
                                    '&:hover': {
                                      backgroundColor: isActive ? 'warning.light' : undefined,
                                      color: isActive ? 'white' : undefined,
                                    },
                                    '&.Mui-disabled': {
                                      color: 'action.disabled',
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}

                          {/* Acción Toggle Estado */}
                          {showToggle && onToggle && (
                            <Tooltip title={isActive ? 'Inactivar' : 'Activar'}>
                              <IconButton
                                size="small"
                                color={isActive ? 'success' : 'default'}
                                onClick={() => onToggle(row)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: isActive ? '#e8f5e9' : '#f5f5f5',
                                  },
                                }}
                              >
                                {isActive ? (
                                  <ToggleOnIcon fontSize="small" />
                                ) : (
                                  <ToggleOffIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Acción Eliminar */}
                          {showDelete && onDelete && (
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onDelete(row)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: '#ffebee',
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Acciones Personalizadas */}
                          {customActions.map((action, actionIndex) => {
                            const shouldShow = action.show ? action.show(row) : true;
                            const isDisabled = action.disabled ? action.disabled(row) : false;
                            const tooltipText = action.tooltip ? action.tooltip(row) : action.label;

                            if (!shouldShow) return null;

                            return (
                              <Tooltip key={actionIndex} title={tooltipText}>
                                <span>
                                  <IconButton
                                    size="small"
                                    color={action.color || 'default'}
                                    onClick={() => action.onClick(row)}
                                    disabled={isDisabled}
                                  >
                                    {action.icon}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Mostrando {data.length === 0 ? 0 : (page - 1) * perPage + 1} -{' '}
          {Math.min(page * perPage, totalRecords)} de{' '}
          <strong>{totalRecords}</strong> registros
        </Typography>

        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        )}
      </Box>
    </Box>
  );
}

export default DataTable;