// ARCHIVO: TODO LO RELACIONADO A LOS DATOS DEL USUARIO. PERFIL
import client from '../config/client';

// Interface para el perfil del usuario
export interface UserProfile {
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
  password_changed_at: string | null;
  password_reset_required: boolean;
  created_at: string;
  updated_at: string;
  roles: {
    idrol: number;
    rol: string;
    status: boolean;
  }[];
}

/**
 * Obtener perfil del usuario autenticado
 */
export const getProfile = () => {
  return client.get('/profile');
};

