import { Navigate } from 'react-router-dom';

export default function RoleBasedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
