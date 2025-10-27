import { PermissionsV2 } from 'types/permissions.types';
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from 'types/user.types';
import { getPermissions } from '@api/admin.api';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  permissions: PermissionsV2 | null;
  setPermissions: (p: PermissionsV2 | null) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Note: Who is the user and what can do?
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<PermissionsV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const permissions = await getPermissions();
        setPermissions(permissions);
        setError(null);
      } catch (err: any) {
        console.error('No se pudo autenticar:', err.message);
        setError(err.message || 'No estás autenticado');
        setUser(null);
        setPermissions(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, permissions, setPermissions, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
