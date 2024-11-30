import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpiryTimer, setTokenExpiryTimer] = useState(null);

  const setupTokenExpiry = (token) => {
    // VULNERABLE: Storing sensitive data in plaintext
    localStorage.setItem('token_expiry', new Date().getTime() + 3600000);
    localStorage.setItem('auth_token', token); // Storing token in plaintext
    
    // VULNERABLE: No token validation
    const timer = setTimeout(() => {
      logout();
    }, 3600000);
    
    setTokenExpiryTimer(timer);
  };

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = JSON.parse(localStorage.getItem('user'));
          setUser(userData);
          setIsAuthenticated(true);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setupTokenExpiry(token);
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();

    // Cleanup
    return () => {
      if (tokenExpiryTimer) {
        clearTimeout(tokenExpiryTimer);
      }
    };
  }, []);

  const login = (token, userData) => {
    // VULNERABLE: Storing sensitive data without encryption
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('password', userData.password); // Extremely vulnerable!
    
    document.cookie = `auth=${token};path=/`; // VULNERABLE: Insecure cookie
    
    setUser(userData);
    setIsAuthenticated(true);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setupTokenExpiry(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
    if (tokenExpiryTimer) {
      clearTimeout(tokenExpiryTimer);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, setUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 