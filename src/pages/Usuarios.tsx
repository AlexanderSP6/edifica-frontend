import { useState, useEffect,useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
  Pagination,
  Skeleton,
  SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { 
  Search as SearchIcon, 
  PersonAdd as PersonAddIcon, 
  PictureAsPdf, 
  Edit as EditIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { getUsuarios, toggleUserStatus } from '../services/userService';
import ModalUsuario from '../components/ModalUsuario';
import ModalAsignarRoles from '../components/ModalAsignarRoles';
import ConfirmDialog from '../components/ConfirmDialog';
import { getRoles } from '../services/roleService';
import ResetPasswordModal from '../components/ResetPasswordModal';
import { useAuth } from '../auth/AuthContext';
import { exportarUsuariosPDF } from '../utils/usuariosPDF';
import { ROLE_COLORS } from '../constants/roles';

interface User {
  iduser: number;
  ci: string;
  grado: string;
  nombres: string;
  appaterno: string;
  apmaterno: string;
  email: string;
  celular: string;
  usuario: string;
  status: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  password_reset_required?: boolean;        
  password_expires_at?: string | null;      
  roles: Array<{ idrol: number; rol: string; status: boolean }>;
}

// Interface para Role
interface Role {
  idrol: number;
  rol: string;
  status: boolean;
}

const getRolColor = (rol: string): "error" | "primary" | "success" | "default" => {
  return ROLE_COLORS[rol] || 'default';
};

// Estilo para select
const selectStyles = {
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'primary.main',
    borderWidth: '1.5px',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'primary.dark',
    borderWidth: '2px',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'primary.main',
    borderWidth: '2px',
  },
};

const TableRowSkeleton = () => (
    <TableRow>
      <TableCell align="center"><Skeleton width={30} /></TableCell>
      <TableCell><Skeleton width={50} /></TableCell>
      <TableCell><Skeleton width={70} /></TableCell>
      <TableCell><Skeleton width={150} /></TableCell>
      <TableCell><Skeleton width={70} /></TableCell>
      <TableCell><Skeleton width={120} /></TableCell>
      <TableCell><Skeleton width={60} /></TableCell>
      <TableCell align="center">
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2, mx: 'auto' }} />
      </TableCell>
      <TableCell align="center">
        <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 2, mx: 'auto' }} />
      </TableCell>
      <TableCell><Skeleton width={130} /></TableCell>
      <TableCell align="center">
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </TableCell>
    </TableRow>
  );

const Usuarios = () => {
  
  const { user: currentUser } = useAuth();

  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rolFilter, setRolFilter] = useState('');

  // Estados de paginación
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);


  // Estados del modal 
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Estados del modal roles
  const [openRolesModal, setOpenRolesModal] = useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<User | null>(null);
  
  // Estados del modal reset password
  const [openResetModal, setOpenResetModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);

  //Snackbar unificado
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Estado para loading  por usuario
  const [togglingUsers, setTogglingUsers] = useState<Record<number, boolean>>({});
  
  // Estado para confirmación de toggle
  const [confirmToggleDialog, setConfirmToggleDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });



  // Función helper para determinar protecciones
  const getUserProtections = (user: User) => {
     const isCurrentUser = user.iduser === currentUser?.iduser;
 
    return {
    isCurrentUser,
    
    isProtectedToggle: isCurrentUser,
    isProtectedEdit: false,
    };
  };  

  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const response = await getRoles();
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

   const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsuarios({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        rol: rolFilter || undefined,
        page: page,  
        per_page: perPage,
      });

      setUsuarios(response.data.data || []);
      setTotalRecords(response.data.meta?.total || 0);
      setTotalPages(response.data.meta?.last_page || 1);

    } catch (error) {
       console.error('Error al cargar usuarios:', error);
       setSnackbar({
        open: true,
        message: 'Error al cargar los usuarios',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, rolFilter, page, perPage]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleFilter = () => {
  if (page !== 1) {
    setPage(1); 
  } else {
    fetchUsuarios(); 
  }
  };

  // Handler de cambio de página
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler de cambio de items por página
  const handlePerPageChange = (event: SelectChangeEvent<number>) => {
  setPerPage(Number(event.target.value));
  setPage(1);
  };

  // Abrir modal para CREAR
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setOpenModal(true);
  };

  // Abrir modal para EDITAR
  const handleOpenEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setOpenModal(true);
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  // Abrir modal para ASIGNAR ROLES
  const handleOpenRolesModal = (user: User) => {
    setSelectedUserForRoles(user);
    setOpenRolesModal(true);
  };

  const handleCloseRolesModal = () => {
    setOpenRolesModal(false);
    setSelectedUserForRoles(null);
  };

  const handleOpenResetModal = (user: User) => {
    setSelectedUserForReset(user);
    setOpenResetModal(true);
  };

  const handleCloseResetModal = () => {
    setOpenResetModal(false);
    setSelectedUserForReset(null);
  };

  const handleResetSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Contraseña reseteada exitosamente',
      severity: 'success'
    });
  };

  const handleSuccess = () => {
    const message = modalMode === 'create' 
      ? 'Usuario creado exitosamente' 
      : 'Usuario actualizado exitosamente';
      setSnackbar({
      open: true,
      message: message,
      severity: 'success'
    });
    fetchUsuarios();
  };

  const handleRolesSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Roles asignados exitosamente',
      severity: 'success'
    });
    fetchUsuarios();
  };
    
  
  // Abrir dialog de confirmación toogle
  const handleToggleClick = (user: User) => {
    setConfirmToggleDialog({
      open: true,
      user: user,
    });
  };

  // Ejecutar toggle después de confirmar
  const handleConfirmToggle = async () => {

    
  const user = confirmToggleDialog.user;
    if (!user) return;

    const userId = user.iduser;
    const previousStatus = user.status;

    try {
      setTogglingUsers(prev => ({ ...prev, [userId]: true }));

      setUsuarios(prevUsers =>
        prevUsers.map(u =>
          u.iduser === userId ? { ...u, status: !u.status } : u
        )
      );

      // Cerrar dialog
      setConfirmToggleDialog({ open: false, user: null });

      // Llamada a la API
      await toggleUserStatus(userId);

      const newStatus = !previousStatus ? 'activado' : 'desactivado';
       setSnackbar({
        open: true,
        message: `Usuario ${newStatus} exitosamente`,
        severity: 'success'
      });

    } catch (error: any) {
      console.error('Error al cambiar estado del usuario:', error);
      
      // Rollback
      setUsuarios(prevUsers =>
        prevUsers.map(u =>
          u.iduser === userId ? { ...u, status: previousStatus } : u
        )
      );

      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al cambiar el estado del usuario',
        severity: 'error'
      });

    } finally {
      setTogglingUsers(prev => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Cancelar confirmación
  const handleCancelToggle = () => {

    setConfirmToggleDialog({ open: false, user: null });
  };
  

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const [exportandoPDF, setExportandoPDF] = useState(false);

  const handleExportarPDF = async () => {
  if (usuarios.length === 0) {
    setSnackbar({
      open: true,
      message: 'No hay usuarios para exportar',
      severity: 'warning',
    });
    return;
  }

  setExportandoPDF(true);

  try {
    const success = await exportarUsuariosPDF(usuarios, {
      searchTerm: searchTerm || undefined,
      statusFilter: statusFilter || undefined,
      rolFilter: rolFilter || undefined,
    });

    if (success) {
      setSnackbar({
        open: true,
        message: `PDF generado exitosamente con ${usuarios.length} usuario${usuarios.length !== 1 ? 's' : ''}`,
        severity: 'success',
      });
    } else {
      throw new Error('Error al generar el PDF');
    }
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    setSnackbar({
      open: true,
      message: 'Error al generar el PDF. Por favor, intente nuevamente.',
      severity: 'error',
    });
  } finally {
    setExportandoPDF(false);
  }
};
  return (
    <Box sx={{ p: 3 }}>
      {/* Título con botón Nuevo Usuario */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Usuarios
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenCreateModal}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              }
            }}
          >
            Nuevo Usuario
          </Button>
        </Grid>
      </Grid>

      {/* Primera fila: Buscador + Filtros */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por CI, nombre, usuario o email."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleFilter();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small" variant="outlined">
            <InputLabel>Estado</InputLabel>
            <Select
              value={statusFilter}
              label="Estado"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={selectStyles}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="1">Activo</MenuItem>
              <MenuItem value="0">Inactivo</MenuItem>
            </Select>
          </FormControl>
        </Grid>
            <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small" variant="outlined">
          <InputLabel>Rol</InputLabel>
            <Select
            value={rolFilter}
            label="Rol"
            onChange={(e) => setRolFilter(e.target.value)}
            sx={selectStyles}
            disabled={loadingRoles}
    >
      <MenuItem value="">Todos</MenuItem>
       {loadingRoles ? (
        <MenuItem disabled>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          Cargando roles...
        </MenuItem>
       ) : (
        roles.map((rol) => (
            <MenuItem key={rol.idrol} value={rol.idrol.toString()}>
             {rol.rol}
            </MenuItem>
        ))
      )}
    </Select>
  </FormControl>
</Grid>
        <Grid item xs={12} md={2}>
         <Button
            fullWidth
            variant="contained"
            onClick={handleFilter}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ height: '40px' }}
          >
            {loading ? 'Filtrando...' : 'Filtrar'}
          </Button>
        </Grid>
      </Grid>

      {/* Segunda fila: Botones PDF y Excel */}
      <Grid container spacing={2} sx={{ mb: 2 }} justifyContent="flex-end">
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Items por página</InputLabel>
            <Select
              value={perPage}
              label="Items por página"
              onChange={handlePerPageChange}
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

        <Grid item xs />
        <Grid item>
          <Button
    variant="outlined"
    color="error"
    startIcon={
      exportandoPDF ? (
        <CircularProgress size={20} color="error" />
      ) : (
        <PictureAsPdf />
      )
    }
    onClick={handleExportarPDF}
    disabled={exportandoPDF || loading || usuarios.length === 0}
    sx={{
      textTransform: 'none',
      fontWeight: 500,
      px: 2.5,
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: 2,
        transform: 'translateY(-1px)',
      },
      '&:disabled': {
        opacity: 0.5,
      },
    }}
  >
    {exportandoPDF ? 'Generando PDF...' : 'Exportar PDF'}
          </Button>
        </Grid>
      </Grid>

      {/* Tabla de usuarios */}
      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CI</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Grado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombres</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Celular</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Roles</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Último Login</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/*Skeleton loading */}
            {loading ? (
              Array.from({ length: perPage }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))
            ) : usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((user, index) => {
                
                const protections = getUserProtections(user);
                
                return (
                <TableRow key={user.iduser} hover>
                  <TableCell align="center">
                    {(page - 1) * perPage + index + 1}
                  </TableCell>
                  <TableCell>{user.ci}</TableCell>
                  <TableCell>{user.grado || '-'}</TableCell>
                  <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Nombre completo */}
                        <Typography variant="body2">
                          {[user.nombres, user.appaterno, user.apmaterno]
                            .filter(Boolean)
                            .join(' ')
                            .trim() || '-'}
                        </Typography>
                        
                        {/*  Badge "TÚ" */}
                        {protections.isCurrentUser && (
                          <Chip
                            label="TÚ"
                            size="small"
                            sx={{
                            backgroundColor: '#e0f2f1',
                            color: '#00695c',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 22,
                            letterSpacing: '0.5px',
                            border: '1.5px solid #00897b',
                            '& .MuiChip-label': {
                            px: 1.5,
                            },
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: '#b2dfdb',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 6px rgba(0, 137, 123, 0.25)',
                            },
                            }}
                          /> 
                        )}
                      </Box>
                    </TableCell>
   
                  <TableCell>{user.usuario}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.celular ?? '-'}</TableCell>
            
                  {/* COLUMNA ROLES */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((rol) => (
                          <Chip
                            key={rol.idrol}
                            label={rol.rol}
                            size="small"
                            variant="outlined"
                            color={getRolColor(rol.rol)}
                            sx={{
                              fontWeight: 500,
                              borderWidth: '1.5px',
                            }}
                          />
                        ))
                      ) : (
                        <Chip 
                          label="Sin rol" 
                          size="small" 
                          variant="outlined"
                          color="default" 
                        />
                      )}
                    </Box>
                  </TableCell>

                  {/* COLUMNA ESTADO */}
                  <TableCell align="center">
                    <Chip
                      label={user.status ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={user.status ? 'success' : 'default'}
                      sx={{ minWidth: 70 }}
                    />
                  </TableCell>

                  <TableCell>
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString('es-BO', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Nunca'}
                  </TableCell>

                  {/* COLUMNA ACCIONES */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      {/* Botón Editar - NARANJA */}
                      <Tooltip title="Editar usuario">
                        <span>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleOpenEditModal(user)}
                            sx={{
                              '&:hover': {
                              backgroundColor: 'warning.light',
                              color: 'white',
                              },
                            }}
                          >
                          <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* Botón Asignar Roles - MORADO */}
                      <Tooltip title="Asignar roles">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleOpenRolesModal(user)}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'secondary.light',
                              color: 'white',
                            }
                          }}
                        >
                          <AdminPanelSettingsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Botón Toggle Estado - VERDE/GRIS */}
                      <Tooltip 
                        title={
                          protections.isCurrentUser
                          ? "No puedes desactivar tu propia cuenta"
                          : protections.isProtectedToggle
                          ? "Los administradores no pueden modificar el estado de otros administradores"
                          : user.status ? 'Desactivar usuario' : 'Activar usuario'
                        }
                      >
                        <span>
                            <IconButton
                              size="small"
                              color={user.status ? 'success' : 'default'}
                              onClick={() => handleToggleClick(user)}
                              disabled={togglingUsers[user.iduser] || protections.isProtectedToggle}
                              sx={{
                                '&:hover': {
                                  backgroundColor: protections.isProtectedToggle 
                                    ? 'transparent' 
                                    : (user.status ? '#e8f5e9' : '#f5f5f5'),
                                },
                                opacity: protections.isProtectedToggle ? 0.5 : 1,
                              }}
                            >
                              {togglingUsers[user.iduser] ? (
                                <CircularProgress size={20} />
                              ) : user.status ? (
                                <ToggleOnIcon fontSize="small" />
                              ) : (
                                <ToggleOffIcon fontSize="small" />
                              )}
                            </IconButton>
                          </span>
                      </Tooltip>

                      {/* Botón Resetear Contraseña - ROJO */}
                      <Tooltip title="Resetear contraseña">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenResetModal(user)}
                          sx={{
                            color: '#e74c3c',
                            '&:hover': {
                              backgroundColor: '#fdecea',
                            }
                          }}
                        >
                          <LockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Total de registros */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {usuarios.length === 0 ? 0 : (page - 1) * perPage + 1} - {Math.min(page * perPage, totalRecords)} de <strong>{totalRecords}</strong> usuarios
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
      {/* Modal Editar Usuario */}
      <ModalUsuario
        open={openModal}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        mode={modalMode}
        userData={selectedUser}
      />

      {/* Modal Asignar Roles */}
      <ModalAsignarRoles
        open={openRolesModal}
        onClose={handleCloseRolesModal}
        onSuccess={handleRolesSuccess}
        user={selectedUserForRoles}
      />

       {/* Modal Resetear Contraseña */}
      <ResetPasswordModal
        open={openResetModal}
        onClose={handleCloseResetModal}
        user={selectedUserForReset}
        onSuccess={handleResetSuccess}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'error' ? 4000 : 3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
       {/* Dialog de confirmación para toggle */}
      <ConfirmDialog
  open={confirmToggleDialog.open}
  onClose={handleCancelToggle}
  onConfirm={handleConfirmToggle}
  title={
    confirmToggleDialog.user?.status
      ? '¿Desactivar Usuario?'
      : '¿Activar Usuario?'
  }
  description={
    confirmToggleDialog.user?.status
      ? 'El usuario perderá acceso al sistema.'
      : 'El usuario tendrá acceso al sistema.'
  }
  severity={confirmToggleDialog.user?.status ? 'error' : 'success'}
  confirmText={confirmToggleDialog.user?.status ? 'Desactivar' : 'Activar'}
  cancelText="Cancelar"
  loading={togglingUsers[confirmToggleDialog.user?.iduser || 0]}
  showAlert={false}
/>
    </Box>
  );
};

export default Usuarios;