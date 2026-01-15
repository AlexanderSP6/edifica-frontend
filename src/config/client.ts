import axios from 'axios';
import Cookies from 'js-cookie';

const client = axios.create({
  baseURL: 'http://localhost:80/api', 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', 
  },
  withCredentials:true,  
});



client.interceptors.request.use(
  (config) => {
     if (config.params) {
      // Convertir booleanos
      const convertedParams: Record<string, any> = {};
      
      Object.keys(config.params).forEach((key) => {
        const value = config.params[key];
        
        if (typeof value === 'boolean') {
          convertedParams[key] = value ? 1 : 0;
        } else {
          convertedParams[key] = value;
        }
      });
      
      config.params = convertedParams;
    }
    // Agrega token
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response 
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar error 401 (No autorizado)
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');

      if (!isLoginRequest) {
        // Limpiar localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token_expires_at');
        
        // Limpiar cookies que frontend puede leer
        Cookies.remove('force_password_change', { path: '/' });

        // Redirigir a login 
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default client;
