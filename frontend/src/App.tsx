import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout";
import Centerfinding from "./pages/CenterFinding.tsx";
import Run from "./pages/Run.tsx";
import Methods from "./pages/Methods.tsx";
import FullPipelines from "./pages/FullPipelines.tsx";
import keycloak from "./keycloak";
import useDeployment from "./hooks/useDeployment";
import AuthStatus from "./components/AuthStatus.tsx";

const App: React.FC = () => {
  const { isLocal, isLoading: deploymentLoading } = useDeployment();
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Add debugging to see loading states
  useEffect(() => {
    console.log("Loading States:", { deploymentLoading, authLoading, isLocal });
  }, [deploymentLoading, authLoading, isLocal]);

  // Handle authentication flow
  useEffect(() => {
    // Skip if deployment info is still loading
    if (deploymentLoading) {
      console.log("Waiting for deployment info to load...");
      return;
    }

    console.log("Deployment status loaded, isLocal:", isLocal);

    // For local development, bypass auth
    if (isLocal) {
      console.log("Local development mode - bypassing authentication");
      setAuthenticated(true);
      setAuthLoading(false);
      return;
    }

    // For deployment, initialize Keycloak
    const initKeycloak = async () => {
      try {
        console.log("Initializing Keycloak...");
        
        const auth = await keycloak.init({
          onLoad: 'login-required',
          checkLoginIframe: false
        });
        
        console.log("Keycloak initialization complete - authenticated:", auth);
        
        if (auth) {
          console.log("Already authenticated, token:", keycloak.token ? "present" : "missing");
          setAuthenticated(true);
          
          // Set up token refresh
          keycloak.onTokenExpired = () => {
            console.log("Token expired, refreshing...");
            keycloak.updateToken(30);
          };
        } else {
          console.log("Not authenticated, redirecting to login");
          keycloak.login({
            redirectUri: window.location.origin
          });
          // Don't set authLoading=false here since we're redirecting
          return;
        }
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error);
      } finally {
        // Always set authLoading to false unless we're redirecting
        setAuthLoading(false);
      }
    };

    initKeycloak();
  }, [deploymentLoading, isLocal]); // Run when deployment info changes

  // Debug check remains the same
  useEffect(() => {
    if (isLocal) return;
    
    const checkInterval = setInterval(() => {
      console.log("App: Periodic keycloak check:");
      console.log("App: - authenticated:", keycloak.authenticated);
      console.log("App: - token exists:", !!keycloak.token);
      
      // IMPORTANT: If we detect authentication but our state doesn't reflect it,
      // update the state
      if (keycloak.authenticated && !authenticated) {
        console.log("Detected authentication from periodic check!");
        setAuthenticated(true);
        setAuthLoading(false);
      }
      
      if (keycloak.token) {
        console.log("App: - token start:", keycloak.token.substring(0, 10));
      }
    }, 2000);
    
    return () => clearInterval(checkInterval);
  }, [isLocal, authenticated]);

  if (deploymentLoading || authLoading) {
    return <div>Loading application... (Deployment: {deploymentLoading ? 'Loading' : 'Ready'}, Auth: {authLoading ? 'Loading' : 'Ready'})</div>;
  }

  return (
    <Router>
      <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
        <AuthStatus />
      </div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="methods" element={<Methods />} />
          <Route path="corfinder" element={isLocal ? <Centerfinding /> : <div>Local only</div>} />
          <Route path="fullpipelines" element={<FullPipelines />} />
          <Route path="run" element={isLocal ? <Run /> : <div>Local only</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;