import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../lib/types';

interface Props {
  children: React.ReactNode;
  roles?: Role[];
}

export function Protected({ children, roles }: Props) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Memuat…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role as Role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
