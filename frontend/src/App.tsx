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

    // Helper to track initialization attempts
    const initAttempted = sessionStorage.getItem('keycloak_init_attempted');
    
    // Initialize Keycloak
    const initKeycloak = async () => {
      try {
        console.log('Initializing Keycloak...');
        
        // Set init attempted flag to prevent multiple attempts
        sessionStorage.setItem('keycloak_init_attempted', 'true');
        
        const authenticated = await keycloak.init({
          onLoad: 'login-required',  // Force immediate login if not authenticated
          pkceMethod: 'S256',        // Using PKCE for better security
          checkLoginIframe: false,   // Disable iframe checking which can cause issues
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        });

        console.log('Keycloak initialization result:', authenticated);
        
        // Successfully initialized
        setAuthState({
          initialized: true,
          authenticated,
          loading: false,
          error: null
        });

        // Setup token refresh if authenticated
        if (authenticated) {
          // Clear init flag on successful auth
          sessionStorage.removeItem('keycloak_init_attempted');
          
          // Set up token refresh on a timer
          const refreshInterval = setInterval(() => {
            if (keycloak.token) {
              keycloak.updateToken(70).catch(() => {
                console.warn('Token refresh failed');
                clearInterval(refreshInterval);
                // Only force re-login if the app is being actively used
                if (document.visibilityState === 'visible') {
                  keycloak.login();
                }
              });
            }
          }, 60000);
          
          // Clean up interval on unmount
          return () => clearInterval(refreshInterval);
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak', error);
        
        // Clear init flag on error to allow retry
        sessionStorage.removeItem('keycloak_init_attempted');
        
        setAuthState({
          initialized: true,
          authenticated: false,
          loading: false,
          error: 'Failed to initialize authentication'
        });
      }
    };

    // Only attempt init if not already attempted in this session
    if (!initAttempted) {
      initKeycloak();
    } else {
      // We're probably in a post-redirect state,
      // check if we have a valid token already
      if (keycloak.authenticated) {
        setAuthState({
          initialized: true,
          authenticated: true,
          loading: false,
          error: null
        });
        // Clear the flag since we're successfully authenticated
        sessionStorage.removeItem('keycloak_init_attempted');
      } else {
        // Something went wrong, clear flag and retry
        sessionStorage.removeItem('keycloak_init_attempted');
        initKeycloak();
      }
    }
  }, [isLocal]);

  // Still loading
  if (authState.loading) {
    return <div>Loading authentication...</div>;
  }

  // Authentication failed
  if (authState.error) {
    return (
      <div className="auth-error">
        <h2>Authentication Error</h2>
        <p>{authState.error}</p>
        <button 
          onClick={() => {
            // Clear flags and reload
            sessionStorage.removeItem('keycloak_init_attempted');
            window.location.reload();
          }}
        >
          Retry
        </button>
      </div>
    );
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