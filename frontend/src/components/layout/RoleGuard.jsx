import { useAuth } from '../../context/AuthContext';

export const RoleGuard = ({ children, mutate = false, admin = false }) => {
  const { canMutate, isAdmin } = useAuth();

  if (admin && !isAdmin) return null;
  if (mutate && !canMutate) return null;

  return children;
};
