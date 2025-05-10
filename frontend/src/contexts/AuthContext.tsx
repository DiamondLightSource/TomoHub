import React, { createContext, useContext } from 'react';
import keycloak, { logout, forceLogin, getUserInfo } from '../keycloak';

// Define the shape of our auth context
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string;
  roles: string[];
  token: string;
  logout: () => void;
  login: (redirectPath?: string) => void;
  hasRole: (role: string) => boolean;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  username: '',
  roles: [],
  token: '',
  logout: () => {},
  login: () => {},
  hasRole: () => false,
});

// Context provider component
export const AuthContextProvider = ({ 
  children, 
  authenticated, 
  loading 
}: { 
  children: React.ReactNode;
  authenticated: boolean;
  loading: boolean;
}) => {
  const { username, roles, token } = getUserInfo();
  
  // Check if user has a specific role
  const hasRole = (role: string) => {
    return roles.includes(role);
  };

  // Custom login function
  const login = (redirectPath = window.location.pathname) => {
    forceLogin(redirectPath);
  };

  const value = {
    isAuthenticated: authenticated,
    isLoading: loading,
    username,
    roles,
    token,
    logout,
    login,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;