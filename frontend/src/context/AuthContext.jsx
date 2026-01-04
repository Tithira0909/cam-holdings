import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiLogin, apiMe } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cam_admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cam_admin_token');
      if (storedToken) {
        try {
          // Verify token and get user details
          // Assuming apiMe returns the user object
           const userData = await apiMe();
           setUser(userData);
        } catch (error) {
          console.error("Auth initialization failed:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const data = await apiLogin(username, password);
      // Assuming data contains { token, user } or similar
      // Adjust based on actual API response structure
      const newToken = data.token;
      const newUser = data.user;

      localStorage.setItem('cam_admin_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (error) {
        console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cam_admin_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
