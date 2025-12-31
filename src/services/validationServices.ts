import client from '../config/client';


// SERVICIOS DE VALIDACIÓN ASYNC - UNICIDAD

/**
 * Verifica si un código de Item es único
 */
export const checkCodigoUnicoApuItem = async (
  codigo: string,
  currentId?: number
): Promise<boolean> => {
  try {
    const params: any = { codigo };
    if (currentId) {
      params.exclude_id = currentId;
    }
    
    const response = await client.get('/construccion/apu-items/check-codigo', {
      params,
    });
    
    return response.data.isUnique;
  } catch (error) {
    console.error('Error checking codigo uniqueness:', error);
    return true; 
  }
};

/**
 * Verifica si un nombre de Categoría es único
 */
export const checkNombreUnicoCategoria = async (
  nombre: string,
  currentId?: number
): Promise<boolean> => {
  try {
    const params: any = { nombre };
    if (currentId) {
      params.exclude_id = currentId;
    }
    
    const response = await client.get('/construccion/categorias/check-nombre', {
      params,
    });
    
    return response.data.isUnique;
  } catch (error) {
    console.error('Error checking nombre uniqueness:', error);
    return true;
  }
};