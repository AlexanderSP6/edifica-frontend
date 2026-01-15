// Hook para manejar permisos de usuario de forma granular

import { useAuth } from '../auth/AuthContext';

/**
 *  Permisos de forma granular
 */
export const usePermissions = () => {
  const { 
    user, 
    hasPermission, 
    hasAnyPermission, 
    isAdmin, 
    isProjectManager, 
    isAsistente 
  } = useAuth();

  // ==========================================
  // PERMISOS POR MÓDULO
  // ==========================================

  /**
   * Verificar si puede ver un módulo completo
   */
  const canViewModule = (module: string): boolean => {
    // Admin siempre puede ver todo
    if (isAdmin()) return true;

    const modulePermissions: Record<string, boolean> = {
      // Módulos restringidos (solo admin)
      'usuarios': false,
      'roles': false,
      'audits': false,

      // Módulos de construcción (admin y gestor de proyectos)
      'categorias': hasPermission('ver_categorias'),
      'unidades': hasPermission('ver_unidades'),
      'apu_items': hasPermission('ver_apu_items'),
      'materiales': hasPermission('ver_materiales'),
      'mano_obra': hasPermission('ver_mano_obra'),
      'equipos': hasPermission('ver_equipos'),
      'clientes': hasPermission('ver_clientes'),

      // Presupuestos (admin y gestor de proyectos con permisos específicos)
      'presupuestos': hasAnyPermission(['ver_presupuestos', 'ver_presupuestos_propios']),
    };

    return modulePermissions[module] ?? false;
  };

  /**
   * Verificar si puede crear en un módulo
   */
  const canCreate = (module: string): boolean => {
    // Asistente nunca puede crear
    if (isAsistente()) return false;

    // Admin y Gestor de proyectos verifican permisos específicos
    if (isAdmin() || isProjectManager()) {
      const createPermissions: Record<string, string> = {
        'usuarios': 'crear_usuario',
        'categorias': 'crear_categoria',
        'unidades': 'crear_unidad',
        'apu_items': 'crear_apu_item',
        'materiales': 'crear_material',
        'mano_obra': 'crear_mano_obra',
        'equipos': 'crear_equipo',
        'clientes': 'crear_cliente',
        'presupuestos': 'crear_presupuesto',
      };

      const permission = createPermissions[module];
      return permission ? hasPermission(permission) : false;
    }

    return false;
  };

  /**
   * Verificar si puede editar (con ownership para presupuestos)
   */
  const canEdit = (module: string, createdBy?: number): boolean => {
    // Admin siempre puede editar
    if (isAdmin()) return true;

    // Asistente nunca puede editar
    if (isAsistente()) return false;

    // PRESUPUESTOS: Gestor solo edita los suyos
    if (module === 'presupuestos' && isProjectManager()) {
      // Si no hay createdBy, no puede editar 
      if (createdBy === undefined) return false;
      if (createdBy !== user?.iduser) return false;

      return hasPermission('editar_presupuesto_propio');
    }

    // OTROS MÓDULOS: Gestor puede editar
    if (isProjectManager()) {
      const editPermissions: Record<string, string> = {
        'usuarios': 'editar_usuario',
        'categorias': 'editar_categoria',
        'unidades': 'editar_unidad',
        'apu_items': 'editar_apu_item',
        'materiales': 'editar_material',
        'mano_obra': 'editar_mano_obra',
        'equipos': 'editar_equipo',
        'clientes': 'editar_cliente',
      };

      const permission = editPermissions[module];
      return permission ? hasPermission(permission) : false;
    }

    return false;
  };

  /**
   * Verificar si puede eliminar
   */
  const canDelete = (module: string, createdBy?: number): boolean => {
    // Admin siempre puede eliminar
    if (isAdmin()) return true;

    // Asistente nunca puede eliminar
    if (isAsistente()) return false;

    // PRESUPUESTOS: Gestor solo elimina los suyos
    if (module === 'presupuestos' && isProjectManager()) {
      if (createdBy === undefined) return false;
      if (createdBy !== user?.iduser) return false;
      return true;
    }

    // OTROS MÓDULOS: Gestor puede editar
    if (isProjectManager()) {
      return canEdit(module);
    }

    return false;
  };

  /**
   * Verificar si puede toggle estado
   */
  const canToggle = (module: string, createdBy?: number): boolean => {
    // Toggle usa la misma lógica que editar
    return canEdit(module, createdBy);
  };

  /**
   * Verificar si puede generar PDF
   */
  const canGeneratePDF = (module: string): boolean => {
    if (module === 'presupuestos') {
      return hasPermission('generar_pdf_presupuesto');
    }
    // Otros módulos no requieren permiso especial para PDF
    // Si puede ver el módulo, puede exportar PDF
    return canViewModule(module);
  };

  // ==========================================
  // HELPERS ESPECÍFICOS POR FUNCIONALIDAD
  // ==========================================

  /**
   * Verificar si puede acceder al dashboard de presupuestos
   */
  const canAccessPresupuestosDashboard = (): boolean => {
    return hasAnyPermission(['ver_presupuestos', 'ver_presupuestos_propios']);
  };

  /**
   * Verificar si puede ver presupuestos de otros usuarios
   */
  const canViewAllPresupuestos = (): boolean => {
    return hasPermission('ver_presupuestos');
  };

   /**
   * Verificar si solo puede ver sus propios presupuestos
   */
  const canViewOnlyOwnPresupuestos = (): boolean => {
    return hasPermission('ver_presupuestos_propios') && !hasPermission('ver_presupuestos');
  };

   /**
   * Verificar si un presupuesto es propio del usuario
   */
  const isOwnPresupuesto = (createdBy: number): boolean => {
    return user?.iduser === createdBy;
  };

   /**
   * Verificar si puede acceder a la gestión de usuarios
   */
  const canManageUsers = (): boolean => {
    return hasPermission('ver_usuarios');
  };

   /**
   * Verificar si puede ver auditorías
   */
  const canViewAudits = (): boolean => {
    return hasPermission('ver_usuarios'); // Solo admin tiene este permiso
  };

  // ==========================================
  // HELPERS DE ROLES (Re-exportados para conveniencia)
  // ==========================================

  /**
   * Verificar si el usuario actual es administrador
   */
  const userIsAdmin = (): boolean => {
    return isAdmin();
  };

  /**
   * Verificar si el usuario actual es gestor de proyectos
   */
  const userIsProjectManager = (): boolean => {
    return isProjectManager();
  };

  /**
   * Verificar si el usuario actual es asistente
   */
  const userIsAsistente = (): boolean => {
    return isAsistente();
  };
  return {
    // Permisos por módulo
    canViewModule,
    canCreate,
    canEdit,
    canDelete,
    canToggle,
    canGeneratePDF,

    // Helpers de presupuestos
    canAccessPresupuestosDashboard,
    canViewAllPresupuestos,
    canViewOnlyOwnPresupuestos,
    isOwnPresupuesto,

    // Helpers de usuarios/admin
    canManageUsers,
    canViewAudits,

    // Métodos  del AuthContext 
    hasPermission,
    hasAnyPermission,

    // Helpers de roles
    isAdmin: userIsAdmin,
    isProjectManager: userIsProjectManager,
    isAsistente: userIsAsistente,

    // Usuario actual
    currentUserId: user?.iduser,
  };
};