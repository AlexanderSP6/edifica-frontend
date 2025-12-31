import client from '../config/client';

interface UserFilters {
  search?: string;
  status?: string;
  rol?: string;
  sortBy?: string;
  dir?: string;
  per_page?: number;
  page?: number;
}

interface CreateUserData {
  ci: string;
  grado: string;
  nombres: string;
  appaterno: string | null;
  apmaterno: string | null;
  email: string;
  celular: string | null;
  usuario: string;
  password: string;
  status: boolean;
  idrol: number;
}

interface UpdateUserData {
  ci: string;
  grado: string;
  nombres: string;
  appaterno: string | null;
  apmaterno: string | null;
  email: string;
  celular: string | null;
  usuario: string;
}

// Listar usuarios con filtros
export const getUsuarios = (params?: UserFilters) => {
  return client.get('/users/', { params });
};

// Obtener usuario por ID
export const getUsuarioById = (id: number) => {
  return client.get(`/users/${id}`);
};

// Crear nuevo usuario
export const createUser = (data: CreateUserData) => {
  return client.post('/users/', data);
};

// Actualizar usuario
export const updateUser = (id: number, data: UpdateUserData) => {
  return client.put(`/users/${id}`, data);
};

// Activar/Desactivar usuario
export const toggleUserStatus = (id: number) => {
  return client.patch(`/users/${id}/toggle`);
};

// Asignar roles a usuario
export const asignarRoles = (id: number, roles: number[]) => {
  return client.post(`/users/${id}/roles`, { roles });
};

// Obtener roles disponibles
export const getRoles = () => {
  return client.get('/roles'); 
};

export const resetUserPassword = (id: number) => {
  return client.post(`/users/${id}/reset-password`);
};
