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

const App: React.FC = () => {
  const { isLocal, isLoading: deploymentLoading } = useDeployment();
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Handle authentication flow
  useEffect(() => {
    // Skip if deployment info is still loading
    if (deploymentLoading) {
      return;
    }

    // For local development, bypass auth
    if (isLocal) {
      setAuthenticated(true);
      setAuthLoading(false);
      return;
    }

    // For deployment, initialize Keycloak
    const initKeycloak = async () => {
      try {
        const auth = await keycloak.init({
          onLoad: 'login-required',
          checkLoginIframe: false
        });
        
        if (auth) {
          setAuthenticated(true);
          
          // Set up token refresh
          keycloak.onTokenExpired = () => {
            keycloak.updateToken(30);
          };
        } else {
          keycloak.login({
            redirectUri: window.location.origin
          });
          return;
        }
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    initKeycloak();
  }, [deploymentLoading, isLocal]);

  // Periodic check for authentication state
  useEffect(() => {
    if (isLocal) return;
    
    const checkInterval = setInterval(() => {
      if (keycloak.authenticated && !authenticated) {
        setAuthenticated(true);
        setAuthLoading(false);
      }
    }, 2000);
    
    return () => clearInterval(checkInterval);
  }, [isLocal, authenticated]);

  if (deploymentLoading || authLoading) {
    return <div>Loading application...</div>;
  }

  return (
    <Router>
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