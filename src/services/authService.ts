// src/services/authService.ts

import client from '../config/client';
import type { MeApiResponse, LoginApiResponse, LoginServiceResponse } from '../types/auth.types';

/**
 * Obtener datos del usuario actual (con permisos completos)
 */
export const getCurrentUser = async () => {
  const response = await client.get<MeApiResponse>('/auth/me');
  return response.data.data;
};

/**
 * Login del usuario
 */
export const login = async (email: string, password: string): Promise<LoginServiceResponse> => {
  // Login inicial (obtiene token)
  const loginResponse = await client.post<LoginApiResponse>('/auth/login', {
    email,
    password,
  });

  const { access_token, expires_in } = loginResponse.data;
  
  // Obtener datos completos del usuario (CON permisos)
  const userData = await getCurrentUser();
  // Retornar
  return {
    data: {
      access_token,
      expires_in,
      user: userData,
    },
  };
};

/**
 * Logout del usuario
 */
export const logout = async () => {
  await client.post('/auth/logout');
};

/**
 * Verificar si el token es válido
 */
export const verifyToken = async () => {
  const response = await client.get('/auth/verify');
  return response.data;
};

/**
 * Cambiar contraseña del usuario actual (desde perfil)
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string
) => {
  const response = await client.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation,
  });
  return response.data;
};

/**
 * Cambiar contraseña forzado (primera vez / contraseña temporal)
 */
export const forceChangePassword = async (
  temporaryPassword: string,
  newPassword: string,
  newPasswordConfirmation: string
) => {
  const response = await client.post('/auth/force-change-password', {
    temporary_password: temporaryPassword,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation,
  });
  return response;
};

// Exportación por defecto del objeto con todos los métodos
export const authService = {
  login,
  logout,
  getCurrentUser,
  verifyToken,
  changePassword,
  forceChangePassword,
};

export default authService;