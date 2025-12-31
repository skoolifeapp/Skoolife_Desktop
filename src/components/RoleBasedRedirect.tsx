import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSchoolRole } from '@/hooks/useSchoolRole';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const { user, loading: authLoading } = useAuth();
  const { membership, loading: roleLoading, isSchoolAdmin, isTeacher, isStudent } = useSchoolRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for both auth and role to load
    if (authLoading || roleLoading) return;

    // Not logged in - let normal auth flow handle it
    if (!user) return;

    // Only redirect on /app route
    if (location.pathname !== '/app') return;

    // Redirect based on role
    if (isSchoolAdmin) {
      navigate('/institution/dashboard', { replace: true });
    } else if (isTeacher) {
      navigate('/institution/students', { replace: true });
    }
    // Students stay on /app (their dashboard)
  }, [authLoading, roleLoading, user, isSchoolAdmin, isTeacher, location.pathname, navigate]);

  return <>{children}</>;
}

export default RoleBasedRedirect;
