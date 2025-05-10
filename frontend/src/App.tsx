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
  const { isLocal, isLoading } = useDeployment();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't do anything until deployment state is loaded
    if (isLoading) {
      return;
    }

    console.log("Deployment status loaded, isLocal:", isLocal);

    // Skip authentication in local development
    if (isLocal) {
      console.log("Local development mode - bypassing authentication");
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    // SIMPLIFIED APPROACH - NO SESSION STORAGE OR COMPLEX LOGIC
    const initKeycloak = async () => {
      try {
        console.log("Initializing Keycloak...");
        
        // Basic initialization - matching your working example
        const auth = await keycloak.init({
          onLoad: 'check-sso', // Changed to check-sso to avoid immediate redirect
          checkLoginIframe: false
        });
        
        console.log("Keycloak initialization complete - authenticated:", auth);
        console.log("Keycloak token:", keycloak.token)
        if (auth) {
          console.log("Already authenticated, token:", keycloak.token ? "present" : "missing");
          
          // Set up token refresh
          keycloak.onTokenExpired = () => {
            console.log("Token expired, refreshing...");
            keycloak.updateToken(30);
          };
          
          setAuthenticated(true);
          setLoading(false);
        } else {
          console.log("Not authenticated, redirecting to login");
          // Manual login call with specific redirect
          keycloak.login({
            redirectUri: window.location.origin
          });
        }
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error);
        setLoading(false);
      }
    };

    initKeycloak();
  }, []); // ← IMPORTANT: Empty dependency array - only run once on mount

  // Debug check remains the same
  useEffect(() => {
    if (isLocal) return;
    
    const checkInterval = setInterval(() => {
      console.log("App: Periodic keycloak check:");
      console.log("App: - authenticated:", keycloak.authenticated);
      console.log("App: - token exists:", !!keycloak.token);
      if (keycloak.token) {
        console.log("App: - token start:", keycloak.token.substring(0, 10));
      }
    }, 2000);
    
    return () => clearInterval(checkInterval);
  }, [isLocal]);

  if (isLoading || loading) {
    return <div>Loading application...</div>;
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