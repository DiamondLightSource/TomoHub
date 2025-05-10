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

    // Simple initialization with no complex attempt tracking
    const initKeycloak = async () => {
      try {
        console.log("Initializing Keycloak...");
        
        // We'll use check-sso which is less aggressive
        const auth = await keycloak.init({
          onLoad: 'login-required',
          checkLoginIframe: false
        });
        
        console.log("Keycloak initialization complete - authenticated:", auth);
        
        if (auth && keycloak.token) {
          // Successfully authenticated
          console.log("------------------------------------");
          console.log("BEARER TOKEN:", keycloak.token);
          console.log("------------------------------------");
          
          // Set up token refresh
          keycloak.onTokenExpired = () => {
            console.log("Token expired, refreshing...");
            keycloak.updateToken(30);
          };
          
          setAuthenticated(true);
        } else {
          console.log("Not authenticated, redirecting to login");
          // Using the silentCheckSsoRedirectUri to help with the redirect back
          keycloak.login({
            redirectUri: window.location.origin
          });
          return; // Stop here as we're redirecting
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error);
        setLoading(false);
      }
    };

    initKeycloak();
  }, [isLocal, isLoading]); // Depend on both isLocal AND isLoading

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