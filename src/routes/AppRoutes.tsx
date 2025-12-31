import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../auth/PrivateRoute';
import PublicRoute from '../auth/PublicRoute';

import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import SinPermisos from '../pages/SinPermisos';
import PrivateLayout from '../components/layout/PrivateLayout';
import Usuarios from '../pages/Usuarios';
import Perfil from '../pages/Perfil';
import ForceChangePassword from '../pages/ForceChangePassword';

import Categorias from '../pages/Categorias';
import ApuItems from '../pages/ApuItems';
import ManoObra from '../pages/ManoObra';
import Material from '../pages/Material';
import Equipo from '../pages/Equipo';
import Clientes from '../pages/Clientes';
import PresupuestoDashboard from '../pages/PresupuestoDashboard';
import PresupuestoLista from '../pages/PresupuestoLista';
import PresupuestoForm from '../pages/PresupuestoForm';
import PresupuestoView from '../pages/PresupuestoView';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Redirect a login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ========================================== */}
      {/* RUTAS PÚBLICAS */}
      {/* ========================================== */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* ========================================== */}
      {/* RUTAS DE AUTENTICACIÓN */}
      {/* ========================================== */}
      <Route
        path="/force-change-password"
        element={
          <PrivateRoute>
            <ForceChangePassword />
          </PrivateRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <PrivateLayout>
              <Perfil />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* ========================================== */}
      {/* SIN PERMISOS */}
      {/* ========================================== */}
      <Route
        path="/sin-permisos"
        element={
          <PrivateRoute>
            <SinPermisos />
          </PrivateRoute>
        }
      />

      {/* ========================================== */}
      {/* GESTIÓN DE USUARIOS (Solo ADMINISTRADOR) */}
      {/* ========================================== */}
      <Route
        path="/usuarios"
        element={
          <PrivateRoute requiredPermissions={['ver_usuarios']}>
            <PrivateLayout>
              <Usuarios />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* ========================================== */}
      {/* MÓDULO CONSTRUCCIÓN */}
      {/* ========================================== */}
      
      {/* Categorías - Admin y Arquitecto */}
      <Route
        path="/categorias"
        element={
          <PrivateRoute requiredPermissions={['ver_categorias']}>
            <PrivateLayout>
              <Categorias />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* APU Items - Admin y Arquitecto */}
      <Route
        path="/apu-items"
        element={
          <PrivateRoute requiredPermissions={['ver_apu_items']}>
            <PrivateLayout>
              <ApuItems />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* Mano de Obra - Admin y Arquitecto */}
      <Route
        path="/mano-obra"
        element={
          <PrivateRoute requiredPermissions={['ver_mano_obra']}>
            <PrivateLayout>
              <ManoObra />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* Materiales - Admin y Arquitecto */}
      <Route
        path="/materiales"
        element={
          <PrivateRoute requiredPermissions={['ver_materiales']}>
            <PrivateLayout>
              <Material />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* Equipos - Admin y Arquitecto */}
      <Route
        path="/equipos"
        element={
          <PrivateRoute requiredPermissions={['ver_equipos']}>
            <PrivateLayout>
              <Equipo />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* Clientes - Admin y Arquitecto */}
      <Route
        path="/clientes"
        element={
          <PrivateRoute requiredPermissions={['crear_cliente']}>
            <PrivateLayout>
              <Clientes />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* ========================================== */}
      {/* MÓDULO PRESUPUESTOS */}
      {/* Admin, Arquitecto, Asistente*/}
      {/* ========================================== */}

      {/* Dashboard */}
      <Route
        path="/presupuestos"
        element={
          <PrivateRoute 
            requiredPermissions={['ver_presupuestos', 'ver_presupuestos_propios']}
          >
            <PrivateLayout>
              <PresupuestoDashboard />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* Lista Completa */}
      <Route
        path="/presupuestos/lista"
        element={
          <PrivateRoute 
            requiredPermissions={['ver_presupuestos', 'ver_presupuestos_propios']}
          >
            <PrivateLayout>
              <PresupuestoLista />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* Crear Nuevo - Solo Admin y Arquitecto */}
      <Route
        path="/presupuestos/crear"
        element={
          <PrivateRoute requiredPermissions={['crear_presupuesto']}>
            <PrivateLayout>
              <PresupuestoForm />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* Ver Detalle - Todos */}
      <Route
        path="/presupuestos/:id"
        element={
          <PrivateRoute 
            requiredPermissions={['ver_presupuestos', 'ver_presupuestos_propios']}
          >
            <PrivateLayout>
              <PresupuestoView />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* Editar - Admin y Arquitecto  */}
      <Route
        path="/presupuestos/:id/editar"
        element={
          <PrivateRoute 
            requiredPermissions={['editar_presupuesto', 'editar_presupuesto_propio']}
          >
            <PrivateLayout>
              <PresupuestoForm />
            </PrivateLayout>
          </PrivateRoute>
        }
      />

      {/* ========================================== */}
      {/* 404 - NOT FOUND */}
      {/* ========================================== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
