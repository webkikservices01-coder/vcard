import { Navigate } from 'react-router-dom';
import { hasValidSession } from '../utils/session';

const ProtectedRoute = ({ children }) => {
  // No token, or it has expired (7 days): sign in again. The dashboard never opens on an old session.
  if (!hasValidSession()) {
    let hadToken = false;
    try {
      hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
    } catch {
      /* storage blocked */
    }
    return <Navigate to={hadToken ? '/login?expired=1' : '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
