import React, { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  Toolbar,
  Collapse,
} from '@mui/material';
import {
  Home,    
  People,
  AccountCircle,
  Category,
  ReceiptLong,
  Engineering,
  Inventory,
  Construction,
  ExpandLess,
  ExpandMore,
  Build,
  Groups,
  RequestQuote
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string;
  permissions?: string[];
  module?: string;
  children?: SubMenuItem[];
}

interface SubMenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
  permissions?: string[];
  module?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  // Estado para controlar el submenú
  const [construccionOpen, setConstruccionOpen] = useState(true);

  // ==========================================
  // DEFINICIÓN DE MENÚS CON PERMISOS
  // ==========================================
  const menuItems: MenuItem[] = [
    { 
      text: 'Inicio', 
      icon: <Home />, 
      path: '/presupuestos',
      permissions: ['ver_presupuestos', 'ver_presupuestos_propios'],
    },
    { 
      text: 'Categorías', 
      icon: <Category />, 
      path: '/categorias',
      permission: 'ver_categorias',
    },
    { 
      text: 'Ítems', 
      icon: <ReceiptLong />, 
      path: '/apu-items',
      permission: 'ver_apu_items',
    },
    // SUBMENÚ DESPLEGABLE - Precios Unitarios
    {
      text: 'Precios Unitarios',
      icon: <Build />,
      // Visible si tiene acceso a AL MENOS UNO de los submódulos
      permissions: ['ver_mano_obra', 'ver_materiales', 'ver_equipos'],
      children: [
        { 
          text: 'Mano de Obra', 
          icon: <Engineering />, 
          path: '/mano-obra', 
          permission: 'ver_mano_obra',

        },
        { 
          text: 'Materiales', 
          icon: <Inventory />, 
          path: '/materiales',
          permission: 'ver_materiales',
        },
        { 
          text: 'Equipos', 
          icon: <Construction />,
          path: '/equipos',
          permission: 'ver_equipos',

        },
      ]
    },
    { 
      text: 'Cálculo Presupuestario', 
      icon: <RequestQuote />, 
      path: '/presupuestos/lista',
      permissions: ['ver_presupuestos', 'ver_presupuestos_propios'],
    },
    { 
      text: 'Clientes', 
      icon: <Groups />, 
      path: '/clientes',
      permission: 'crear_cliente',

    },
    { 
      text: 'Usuarios', 
      icon: <People />, 
      path: '/usuarios',
      permission: 'ver_usuarios',

    },
    { 
      text: 'Mi Perfil', 
      icon: <AccountCircle />, 
      path: '/perfil',
      // Perfil siempre visible para todos los autenticados
    },
  ];

  // ==========================================
  // FUNCIÓN DE VALIDACIÓN DE VISIBILIDAD
  // ==========================================
  const isMenuItemVisible = (item: MenuItem | SubMenuItem): boolean => {
  // Validar permiso único
  if (item.permission) {
    return hasPermission(item.permission);
  }

  // Validar lista de permisos o permiso
  if (item.permissions && item.permissions.length > 0) {
    return hasAnyPermission(item.permissions);
  }

  // Sin restricciones = siempre visible
  return true;
  };

  // Filtrar items visibles
  const visibleMenuItems = menuItems.filter(isMenuItemVisible);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleToggleConstruccion = () => {
    setConstruccionOpen(!construccionOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      onClose();
    }
  };

  // ==========================================
  // DRAWER CONTENT
  // ==========================================
  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        backgroundColor: '#191c1f',
        color: '#FAFBFC',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Logo */}
      <Toolbar sx={{ px: 2 }}>
        <img src="/favicon.ico" alt="logo" width={24} />
        <Box ml={1} fontWeight="bold" fontSize={18}>
          EDIFICA
        </Box>
      </Toolbar>

      <Divider sx={{ backgroundColor: '#333' }} />

      {/* Menú */}
      <Box flex={1} sx={{ overflowY: 'auto' }}>
        <List>
          {visibleMenuItems.map((item) => {
            // ==========================================
            // SUBMENÚ (CON CHILDREN)
            // ==========================================
            if (item.children) {
              // Filtrar children visibles
              const visibleChildren = item.children.filter(isMenuItemVisible);

              // Si no hay children visibles, no mostrar el padre
              if (visibleChildren.length === 0) {
                return null;
              }

              const hasActiveChild = visibleChildren.some(
                child => child.path === location.pathname
              );
              
              return (
                <React.Fragment key={item.text}>
                  {/* Item padre */}
                  <ListItemButton
                    onClick={handleToggleConstruccion}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      my: 0.5,
                      color: '#FAFBFC',
                      borderLeft: hasActiveChild ? '3px solid #932d1bff' : 'none',
                      paddingLeft: hasActiveChild ? '13px' : '16px',
                      backgroundColor: 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#4b0f05',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: hasActiveChild ? '#932d1bff' : '#FAFBFC',
                      transition: 'color 0.2s ease'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{ 
                        fontSize: 14,
                        fontWeight: hasActiveChild ? 600 : 400
                      }}
                    />
                    {construccionOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  {/* Submenú desplegable */}
                  <Collapse in={construccionOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {visibleChildren.map((child) => {
                        const isActive = location.pathname === child.path;
                        return (
                          <ListItemButton
                            key={child.text}
                            onClick={() => handleNavigate(child.path)}
                            selected={isActive}
                            sx={{
                              pl: 4,
                              borderRadius: 2,
                              mx: 1,
                              my: 0.5,
                              color: '#FAFBFC',
                              backgroundColor: isActive ? '#6b1505' : 'transparent',
                              '&:hover': {
                                backgroundColor: '#6b1505',
                              },
                              '&.Mui-selected': {
                                backgroundColor: '#6b1505',
                                color: '#fff',
                                '&:hover': {
                                  backgroundColor: '#6b1505',
                                },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ color: '#FAFBFC', minWidth: 40 }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={child.text}
                              primaryTypographyProps={{ fontSize: 13 }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            }

            // ==========================================
            // ITEMS NORMALES (SIN CHILDREN)
            // ==========================================
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.text}
                onClick={() => item.path && handleNavigate(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: '#FAFBFC',
                  backgroundColor: isActive ? '#4b0f05' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#4b0f05',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#4b0f05',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#4b0f05',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#FAFBFC' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ backgroundColor: '#333' }} />

      {/* Footer */}
      <Box textAlign="center" py={2} fontSize={12} color="#777">
        EDIFICA<span style={{ color: 'gray' }}>CONSTRUCCION</span>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Drawer Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#0f0f0f'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: '#0f0f0f'
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;