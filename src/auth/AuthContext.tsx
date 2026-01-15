import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { authService } from '../services/authService';
import type { User, Permiso, AuthContextType } from '../types/auth.types';
import { ROLES } from '../constants/roles';

// ==========================================
// CONTEXTO
// ==========================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// PROVIDER
// ==========================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  
  // ==========================================
  // ESTADO
  // ==========================================
  
  const [isLoading, setIsLoading] = useState(true); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // ==========================================
  // EFECTO DE INICIALIZACIÓN 
  // ==========================================

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          try {
            const userData: User = JSON.parse(storedUser);
            
            if (userData?.iduser && userData?.permisos?.length > 0) {
              try {
                const validatedUser = await authService.getCurrentUser();
                localStorage.setItem('user', JSON.stringify(validatedUser));
                
                setIsAuthenticated(true);
                setUser(validatedUser);
                setIsLoading(false);
                return;
                
              } catch (apiError: any) {
                if (apiError?.response?.status === 401) {
                  clearAuth();
                  setIsLoading(false);
                  return;
                }
                
                setIsAuthenticated(true);
                setUser(userData);
                setIsLoading(false);
                return;
              }
            }
          } catch (parseError) {
            // Error parseando, limpiar
          }
        }
        
        clearAuth();
        
      } catch (error) {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []); 
  // ==========================================
  // HELPER: Limpiar autenticación
  // ==========================================

  const clearAuth = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token_expires_at');
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
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (expiresIn) {
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
      localStorage.setItem('token_expires_at', expiresAt);
    }
    
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      
      clearAuth();
      
      navigate('/login', { replace: true });
    }
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

  const isAdmin = (): boolean => hasRole(ROLES.ADMIN);
  const isProjectManager = (): boolean => hasRole(ROLES.PROJECT_MANAGER);
  const isAsistente = (): boolean => hasRole(ROLES.ASSISTANT);

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
        isLoading, 
        isAuthenticated,
        user,
        login,
        logout,
        hasRole,
        hasAnyRole,
        isAdmin,
        isProjectManager,
        isAsistente,
        userRoles,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getPermissions,
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