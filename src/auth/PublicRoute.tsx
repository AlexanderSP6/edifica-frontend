import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const hasToken = Cookies.get('token');

  // Si tiene token, redirigir al dashboard
  if (hasToken) {
    return <Navigate to="/presupuestos" replace />;
  }

  // Si no tiene token, mostrar la página pública
  return children;
};

export default PublicRoute;
