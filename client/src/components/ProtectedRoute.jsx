import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import DataState from './DataState';
export default function ProtectedRoute({ children }) {
  const { user, authLoading, authError } = useAppContext();
  const location = useLocation();
  if (authLoading || authError)
    return (
      <DataState loading={authLoading} error={authError} retry={() => window.location.reload()} />
    );
  return user ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
