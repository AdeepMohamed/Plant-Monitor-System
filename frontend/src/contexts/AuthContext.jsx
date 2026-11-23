import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('plantcare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('plantcare_token');
      if (storedToken) {
        try {
          const userData = await api.auth.me();
          setUser(userData);
        } catch (err) {
          console.error("Failed to load authenticated user:", err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    localStorage.setItem('plantcare_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const register = async (email, fullName, password) => {
    const res = await api.auth.register(email, fullName, password);
    localStorage.setItem('plantcare_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('plantcare_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updated = await api.auth.updateProfile(data);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
