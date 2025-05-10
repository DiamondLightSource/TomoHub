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
  const { isLocal } = useDeployment();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip authentication in local development
    if (isLocal) {
      console.log("Local development mode - bypassing authentication");
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    // Simple initialization to test login flow
    const initKeycloak = async () => {
      try {
        console.log("Initializing Keycloak...");
        
        // Initialize with login-required to force authentication
        const auth = await keycloak.init({
          onLoad: 'login-required',
          checkLoginIframe: false
        });
        
        console.log("Keycloak initialized - authenticated:", auth);
        
        if (auth && keycloak.token) {
          console.log("Bearer token:", keycloak.token);
        }
        
        setAuthenticated(auth);
        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize Keycloak:", error);
        setLoading(false);
      }
    };

    initKeycloak();
  }, [isLocal]);

  if (loading) {
    return <div>Loading authentication...</div>;
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