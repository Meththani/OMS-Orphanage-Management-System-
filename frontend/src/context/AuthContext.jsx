import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('oms_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await api.post('/auth/login', { username, password });
    localStorage.setItem('oms_token', data.token);
    localStorage.setItem('oms_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('oms_token');
    localStorage.removeItem('oms_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('oms_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
