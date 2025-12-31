// EL COMPONENTE NO SE UTILIZA EN NINGUNA PARTE DEL CODIGO 
import { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

interface ProtectedComponentProps {
  children: ReactNode;
  roles: string[]; 
}

export const ProtectedComponent = ({ children, roles }: ProtectedComponentProps) => {
  const { hasAnyRole } = useAuth();

  // Si tiene alguno de los roles, mostrar children
  return hasAnyRole(roles) ? <>{children}</> : null;
};

export default ProtectedComponent;