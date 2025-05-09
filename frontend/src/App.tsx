import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Layout from "./components/Layout";
import Centerfinding from "./pages/CenterFinding.tsx";
import useDeployment from "./hooks/useDeployment";
import Run from "./pages/Run.tsx";
import Methods from "./pages/Methods.tsx";
import FullPipelines from "./pages/FullPipelines.tsx";
import { useKeycloak } from "@react-keycloak/web";

// Create a custom hook that handles both modes
const useAuth = () => {
  const { isLocal } = useDeployment();
  
  if (isLocal) {
    return {
      initialized: true,
      keycloak: {
        authenticated: true,
        token: "mock-token",
        login: () => {},
        logout: () => {},
        updateToken: () => Promise.resolve(true)
      }
    };
  }

  try {
    const { initialized, keycloak } = useKeycloak();
    
    // Add debug logging
    console.log("Keycloak state:", { 
      initialized, 
      authenticated: keycloak?.authenticated,
      token: keycloak?.token ? "token present" : "no token",
      keycloakInstance: keycloak ? "exists" : "missing"
    });
    
    // Simplify this to avoid any unintended side effects
    return { initialized, keycloak };
  } catch (error) {
    console.error("Error using Keycloak:", error);
    return {
      initialized: false,
      keycloak: {
        authenticated: false,
        login: () => {},
        logout: () => {}
      }
    };
  }
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

// Simplify the ProtectedRoute component to reduce potential issues
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLocal } = useDeployment();
  const { keycloak, initialized } = useAuth();
  
  // Skip authentication check in local mode
  if (isLocal) {
    return children;
  }
  
  if (!initialized) {
    return <div>Initializing authentication...</div>;
  }
  
  if (!keycloak?.authenticated) {
    keycloak.login();
    return <div>Redirecting to login...</div>;
  }
  
  return children;
};

const App: React.FC = () => {
  const { isLocal } = useDeployment();
  const { keycloak, initialized } = useAuth();
    
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
