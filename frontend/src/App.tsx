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
  
  // Return a mock object for local mode
  if (isLocal) {
    return {
      initialized: true,
      keycloak: {
        authenticated: true,
        login: () => {},
        logout: () => {}
      }
    };
  }

  // Only call useKeycloak in non-local mode
  try {
    const keycloakContext = useKeycloak();
    return keycloakContext;
  } catch (error) {
    console.error("Error using Keycloak:", error);
    // Fallback to a mock object if there's an error with Keycloak
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

// Update the ProtectedRoute component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isLocal } = useDeployment();
  const { keycloak } = useAuth();
  
  // Skip authentication check in local mode
  if (isLocal) {
    return children;
  }
  
  if (!keycloak.authenticated) {
    return <div>Please login to access this application</div>;
  }
  
  return children;
};

const App: React.FC = () => {
  const { isLocal } = useDeployment();
  const { keycloak, initialized } = useAuth();
  
  useEffect(() => {
    // Only redirect to login in non-local mode
    if (!isLocal && initialized && !keycloak.authenticated) {
      keycloak.login();
    }
  }, [initialized, keycloak, isLocal]);
  
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
