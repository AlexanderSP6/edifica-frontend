import React from 'react';
import NotFound from './NotFound';

/**
 * Componente alias para página de acceso denegado
 * Reutiliza NotFound con type='forbidden'
 */
const SinPermisos: React.FC = () => {
  return <NotFound type="forbidden" />;
};

export default SinPermisos;