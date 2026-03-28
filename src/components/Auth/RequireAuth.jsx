import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { getCurrentUser } from '@/services/userSession';

export default function RequireAuth() {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return (
      <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}
