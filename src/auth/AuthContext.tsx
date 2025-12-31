import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authService } from '../services/authService';
import type { User, Permiso, AuthContextType } from '../types/auth.types';

// ==========================================
// CONTEXTO
// ==========================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// PROVIDER
// ==========================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ==========================================
  // ESTADO CON LOADING
  // ==========================================
  
  const [isLoading, setIsLoading] = useState(true); // 🔥 NUEVO
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // ==========================================
  // EFECTO DE INICIALIZACIÓN (solo una vez)
  // ==========================================

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = Cookies.get('token');

        if (token) {
          const userData = await authService.getCurrentUser();
          // Validar estructura
          if (userData && userData.iduser && userData.permisos && userData.permisos.length > 0) {
            setIsAuthenticated(true);
            setUser(userData);
          } else {
            clearCookies();
          }
        } 
      } catch (error) {
        clearCookies();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ==========================================
  // HELPER: Limpiar cookies
  // ==========================================

  const clearCookies = () => {
    Cookies.remove('token', { path: '/' });
    Cookies.remove('force_password_change', { path: '/' });
    setIsAuthenticated(false);
    setUser(null);
  };

  // ==========================================
  // MÉTODOS DE AUTENTICACIÓN
  // ==========================================

  const login = (
    token: string,
    userData: User,
    expiresIn?: number,
    forcePasswordChange?: boolean
  ) => {
    const expiresInDays = expiresIn ? expiresIn / (60 * 60 * 24) : 7;

    // guardar el token 
    Cookies.set('token', token, {
      expires: expiresInDays,
      sameSite: 'lax',
      path: '/',
    });

    if (forcePasswordChange) {
      Cookies.set('force_password_change', 'true', {
        expires: expiresInDays,
        sameSite: 'lax',
        path: '/',
      });
    }

    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    clearCookies();
  };

  const requiresPasswordChange = (): boolean => {
    return Cookies.get('force_password_change') === 'true';
  };

  const clearPasswordChangeFlag = () => {
    Cookies.remove('force_password_change', { path: '/' });
  };

  // ==========================================
  // MÉTODOS DE ROLES
  // ==========================================

  const hasRole = (roleName: string): boolean => {
    if (!user?.roles?.length) return false;
    return user.roles.some((role) => role.rol === roleName && role.status);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user?.roles?.length) return false;
    return user.roles.some((role) => roles.includes(role.rol) && role.status);
  };

  const isAdmin = (): boolean => hasRole('ADMINISTRADOR');
  const isArquitecto = (): boolean => hasRole('ARQUITECTO');
  const isAsistente = (): boolean => hasRole('ASISTENTE');

  const userRoles = user?.roles?.filter((role) => role.status).map((role) => role.rol) || [];

  // ==========================================
  // MÉTODOS DE PERMISOS
  // ==========================================

  const hasPermission = (permission: string): boolean => {
    if (!user?.permisos?.length) return false;
    return user.permisos.some((p) => p.nombre === permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user?.permisos?.length) return false;
    return user.permisos.some((p) => permissions.includes(p.nombre));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user?.permisos?.length) return false;
    return permissions.every((permission) =>
      user.permisos.some((p) => p.nombre === permission)
    );
  };

  const getPermissions = (): Permiso[] => user?.permisos || [];

  // ==========================================
  // PROVIDER VALUE
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        // Estado
        isLoading, 
        isAuthenticated,
        user,
        
        // Métodos de autenticación
        login,
        logout,
        
        // Métodos de roles
        hasRole,
        hasAnyRole,
        isAdmin,
        isArquitecto,
        isAsistente,
        userRoles,
        
        // Métodos de permisos
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getPermissions,
        
        // Cambio de contraseña
        requiresPasswordChange,
        clearPasswordChangeFlag,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};