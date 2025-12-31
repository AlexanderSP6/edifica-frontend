/**
 * TIPOS Y ESTRUCTURAS DE AUTENTICACIÓN
*/

// ==========================================
// PERMISOS Y ROLES


export interface Permiso {
  idpermiso: number;
  nombre: string;
  modulo: string;
  accion: string;
}

export interface PermisoAgrupado {
  modulo: string;
  acciones: string[];
  total: number;
}

export interface Rol {
  idrol: number;
  rol: string
  status: boolean;
}

// ==========================================
// USUARIOS
// ==========================================

/**
 * Usuario básico (SIN permisos)
 */
export interface UserBasic {
  iduser: number;
  ci: string;
  grado?: string;
  nombres: string;
  appaterno: string;
  apmaterno: string;
  email: string;
  usuario: string;
  status: boolean;
  last_login: string | null;
  roles: Rol[];
}

/**
 * Usuario completo 
 */
export interface User {
  iduser: number;
  ci: string;
  grado?: string | null;
  nombres: string;
  appaterno?: string | null;
  apmaterno?: string | null;
  email: string;
  celular: string | null;
  usuario: string;
  status: boolean;
  
  // Relaciones
  roles: Rol[];
  permisos: Permiso[];
  permisos_agrupados?: PermisoAgrupado[];
  
  // Helpers booleanos desde backend
  es_admin: boolean;
  es_arquitecto: boolean;
  es_asistente: boolean;
  puede_ver_usuarios: boolean;
  puede_gestionar_presupuestos: boolean;
  
  // Timestamps
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// RESPUESTAS DE API
// ==========================================

/**
 * Devuelve token y usuario básico (SIN permisos completos)
 */
export interface LoginApiResponse {
  status: boolean;
  message: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserBasic;
}

/**
 * Devuelve usuario completo (CON permisos)
 */
export interface MeApiResponse {
  success: boolean;
  message: string;
  data: User;
}

/**
 * Respuesta del servicio de login (authService.ts)
 * Contiene token y usuario completo (CON permisos)
 */
export interface LoginServiceResponse {
  data: {
    access_token: string;
    expires_in: number;
    user: User; 
  };
}


// ==========================================
// CREDENCIALES Y DATOS DE FORMULARIOS
// ==========================================

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  usuario: string;
  password: string;
}

/**
 * Datos para cambio de contraseña normal
 */
export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

/**
 * Datos para cambio forzado de contraseña (primer login)
 */
export interface ForceChangePasswordData {
  temporary_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// ==========================================
// AUTH CONTEXT
// ==========================================

/**
 * Define todos los métodos y propiedades disponibles en useAuth()
 */
export interface AuthContextType {
  // Estado
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  
  // Métodos de autenticación
  login: (token: string, user: User, expiresIn?: number, forcePasswordChange?: boolean) => void;
  logout: () => void;
  
  // Métodos de roles
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isArquitecto: () => boolean;
  isAsistente: () => boolean;
  userRoles: string[];
  
  // Métodos de permisos
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  getPermissions: () => Permiso[];
  
  // Cambio de contraseña
  requiresPasswordChange: () => boolean;
  clearPasswordChangeFlag: () => void;
}

// ==========================================
// ERRORES
// ==========================================

/**
 * Estructura de errores de autenticación
 * Captura errores de Axios con tipado
 */
export interface AuthError {
  response?: {
    status: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
  request?: any;
  message?: string;
}