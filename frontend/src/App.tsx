import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout";
import Centerfinding from "./pages/CenterFinding.tsx";
import useDeployment from "./hooks/useDeployment";
import Run from "./pages/Run.tsx";
import Methods from "./pages/Methods.tsx";
import FullPipelines from "./pages/FullPipelines.tsx";
import keycloak from "./keycloak";
import { AuthContextProvider } from "./contexts/AuthContext";

// Auth provider component to handle Keycloak initialization
const AuthProvider = ({ children }) => {
  const { isLocal } = useDeployment();
  const [authState, setAuthState] = useState<{
    initialized: boolean;
    authenticated: boolean;
    loading: boolean;
    error: string | null;
  }>({
    initialized: false,
    authenticated: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    // In local development, bypass authentication
    if (isLocal) {
      setAuthState({
        initialized: true,
        authenticated: true,
        loading: false,
        error: null
      });
      return;
    }

    // Initialize Keycloak
    const initKeycloak = async () => {
      try {
        // Use 'login-required' to force immediate authentication check
        const authenticated = await keycloak.init({
          onLoad: 'login-required', // This forces immediate redirect to login if not authenticated
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256', // Using PKCE for better security
          checkLoginIframe: false, // Disable iframe checking which can cause issues
          redirectUri: window.location.origin // Ensure redirect back to app root
        });

        // Setup token refresh - only needed if authenticated
        if (authenticated) {
          // Refresh token before it expires
          setInterval(() => {
            keycloak.updateToken(70).catch(() => {
              console.warn('Token refresh failed');
              // Force re-login if token refresh fails
              keycloak.login();
            });
          }, 60000); // Check every minute
        }

        setAuthState({
          initialized: true,
          authenticated,
          loading: false,
          error: null
        });

        console.log(`Authentication state: ${authenticated ? 'Authenticated' : 'Not authenticated'}`);
      } catch (error) {
        console.error('Failed to initialize Keycloak', error);
        setAuthState({
          initialized: true,
          authenticated: false,
          loading: false,
          error: 'Failed to initialize authentication'
        });
      }
    };

    initKeycloak();
  }, [isLocal]);

  // Still loading
  if (authState.loading) {
    return <div>Loading authentication...</div>;
  }

  // Authentication failed
  if (authState.error) {
    return <div>Authentication error: {authState.error}</div>;
  }

  // Initialized but not authenticated (and not in local mode)
  // This is a fallback - should rarely happen with onLoad: 'login-required'
  if (authState.initialized && !authState.authenticated && !isLocal) {
    console.log('Not authenticated, redirecting to login (fallback)');
    keycloak.login({ 
      redirectUri: window.location.href, // Preserve the current URL including path
    });
    return <div>Redirecting to login...</div>;
  }

  // Authentication successful or local mode
  return (
    <AuthContextProvider 
      authenticated={authState.authenticated} 
      loading={authState.loading}
    >
      {children}
    </AuthContextProvider>
  );
};

// Protected route for local-only features
const LocalOnlyRoute = ({ children }) => {
  const { isLocal, isLoading } = useDeployment();
  
  if (isLoading) {
    return <div>Loading deployment information...</div>;
  }
  
  if (!isLocal) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main App component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="methods" element={<Methods />} />
            <Route 
              path="corfinder" 
              element={
                <LocalOnlyRoute>
                  <Centerfinding />
                </LocalOnlyRoute>
              } 
            />
            <Route path="fullpipelines" element={<FullPipelines />} />
            <Route 
              path="run" 
              element={
                <LocalOnlyRoute>
                  <Run />
                </LocalOnlyRoute>
              } 
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;