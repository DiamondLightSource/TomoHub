import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout";
import Centerfinding from "./pages/CenterFinding.tsx";
import useDeployment from "./hooks/useDeployment";
import Run from "./pages/Run.tsx";
import Methods from "./pages/Methods.tsx";
import FullPipelines from "./pages/FullPipelines.tsx";
import keycloak from "./keycloak"; // Import directly from keycloak.ts
import { kcinit } from "./main.tsx"; // Import the initialization promise

// Create a custom hook that handles both modes
const useAuth = () => {
  const { isLocal } = useDeployment();
  const [authState, setAuthState] = useState({
    initialized: false,
    authenticated: false
  });

  useEffect(() => {
    if (isLocal) {
      setAuthState({
        initialized: true,
        authenticated: true
      });
      return;
    }

    // Use the global keycloak instance and initialization
    const checkAuth = async () => {
      try {
        await kcinit; // Wait for the initialization to complete
        setAuthState({
          initialized: true,
          authenticated: keycloak.authenticated || false
        });
        
        console.log("Auth state set to:", {
          initialized: true,
          authenticated: keycloak.authenticated || false,
          token: keycloak.token ? "token present" : "no token"
        });
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthState({
          initialized: true,
          authenticated: false
        });
      }
    };

    checkAuth();
  }, [isLocal]);
  
  return {
    initialized: authState.initialized,
    authenticated: authState.authenticated,
    keycloak
  };
};

// Protected route component that only renders in local mode
const LocalOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const { isLocal, isLoading } = useDeployment();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isLocal) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Simplified ProtectedRoute using direct keycloak instance
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLocal } = useDeployment();
  const { initialized, authenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Skip authentication check in local mode
  if (isLocal) {
    return children;
  }
  
  if (!initialized) {
    return <div>Initializing authentication...</div>;
  }
  
  // Check for a session flag to prevent redirect loops
  const hasRedirected = sessionStorage.getItem('auth_redirect_attempted');
  
  if (!authenticated && !isRedirecting && !hasRedirected) {
    // We only want to trigger login once per session
    console.log("Not authenticated, redirecting to login");
    setIsRedirecting(true);
    
    // Set a session flag to prevent redirect loops
    sessionStorage.setItem('auth_redirect_attempted', 'true');
    
    // Redirect to login
    keycloak.login({
      redirectUri: window.location.origin
    });
    
    return <div>Redirecting to login...</div>;
  }
  
  // If we've already attempted a redirect and still not authenticated
  if (!authenticated && hasRedirected) {
    console.error("Authentication failed after redirection");
    return <div>Authentication failed. Please try again later or contact support.</div>;
  }
  
  return children;
};

// Update App component to clear session flag on successful auth
const App: React.FC = () => {
  const { isLocal } = useDeployment();
  const { initialized, authenticated } = useAuth();
  
  // Clear the session flag if we're authenticated
  useEffect(() => {
    if (authenticated) {
      sessionStorage.removeItem('auth_redirect_attempted');
    }
  }, [authenticated]);
  
  if (!initialized && !isLocal) {
    return <div>Loading...</div>;
  }
  
  return (
    <Router>
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="methods" element={<Methods/>}></Route>
            <Route 
              path="corfinder" 
              element={
                <LocalOnlyRoute>
                  <Centerfinding />
                </LocalOnlyRoute>
              } 
            />
            <Route path="fullpipelines" element={<FullPipelines/>}/>
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
      </ProtectedRoute>
    </Router>
  );
};

export default App;
