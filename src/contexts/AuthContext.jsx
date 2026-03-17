import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ggcs_token');
    if (token) {
      authApi.getUser()
        .then(res => {
          setUser(res.data.user);
          setPermissions(res.data.permissions || []);
        })
        .catch(() => {
          localStorage.removeItem('ggcs_token');
          localStorage.removeItem('ggcs_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('ggcs_token', res.data.token);
    localStorage.setItem('ggcs_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    setPermissions(res.data.permissions || []);
    return res.data;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('ggcs_token');
    localStorage.removeItem('ggcs_user');
    setUser(null);
    setPermissions([]);
  };

  const hasPermission = (perm) => permissions.includes(perm);
  const hasRole = (role) => user?.roles?.some(r => r.name === role);

  return (
    <AuthContext.Provider value={{ user, permissions, loading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
